import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getAllMilestones,
  getIssuesFromMilestone,
  getLabelsFromTicket,
  getNotesFromTicket
} from '../services/gitlabServices'
import dayjs from 'dayjs'

const AnalyticsContext = createContext()

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState(null)
  const [allMilestones, setAllMilestones] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { milestoneProjectId, milestoneId } = selectedPlan || {}
  const [tickets, setTickets] = useState([])

  const [shouldRefresh, setShouldRefresh] = useState(true)

  const [statusFilter, setStatusFilter] = useState(null) // "open", "closed", or null
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')

  const [currentStatus, setCurrentStatus] = useState('')

  const getAndAnalyseTickets = async () => {
    setCurrentStatus('Getting tickets...')
    const response = await getIssuesFromMilestone(milestoneProjectId, milestoneId)
    setCurrentStatus('Analyzing tickets...')

    const ticketsWithLabelsDetails = await getNotesAndLabelsForAllTickets(response)

    const analyzedTickets = analyzeGitLabTickets(ticketsWithLabelsDetails)

    console.log(analyzedTickets)

    setTickets(analyzedTickets)
    setShouldRefresh(false)

    setCurrentStatus(null)
  }

  const getNotesAndLabelsForAllTickets = async (tickets) => {
    try {
      // Fetch notes for all tickets concurrently
      const ticketsWithNotes = await Promise.all(
        tickets.map(async (ticket) => {
          const notes = await getNotesFromTicket(ticket.iid, milestoneProjectId)
          const labels = await getLabelsFromTicket(ticket.iid, milestoneProjectId)
          const commits = notes
            .filter((note) => note.body.includes('mentioned in commit '))
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          let firstCommit, lastCommit
          if (commits) {
            firstCommit = commits[0]
            lastCommit = commits[commits.length - 1]
          }

          return {
            ...ticket,
            notes: notes,
            commits: commits,
            labelsDetails: labels
          }
        })
      )

      console.log(ticketsWithNotes)

      return ticketsWithNotes.sort((a, b) => b.commits.length - a.commits.length)
    } catch (error) {
      console.error('Error fetching notes for tickets:', error)
    }
  }

  useEffect(() => {
    if (selectedPlan) {
      getAndAnalyseTickets()
    }
  }, [selectedPlan, milestoneProjectId, milestoneId])

  useEffect(() => {
    getAllMilestones().then((data) => {
      setAllMilestones(data)
    })
  }, [])

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        setAnalytics,
        allMilestones,
        setAllMilestones,
        selectedPlan,
        setSelectedPlan,
        tickets,
        currentStatus
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => useContext(AnalyticsContext)

/**
 * Analyzes GitLab tickets to extract timing, commit, and workflow information
 *
 * @param {Object[]} tickets - Array of GitLab ticket objects
 * @returns {Object[]} - Array of analyzed ticket data
 */
function analyzeGitLabTickets(tickets) {

  const WORKFLOW_LABELS = {
    DOING: 'workflow:: 2 doing',
    REVIEW: 'workflow:: 3 review',
    TESTING: 'workflow:: 4 testing'
  }

  return tickets.map((ticket) => {
    const { commits = [], closed_at, labelsDetails:labels = [], title, id } = ticket || {}

    // Parse commit dates
    const firstCommitDate = commits.length > 0 ? dayjs(commits[0].created_at) : null
    const lastCommitDate = commits.length > 0 ? dayjs(commits[commits.length - 1].created_at) : null
    const closedDate = closed_at ? dayjs(closed_at) : null

    // Parse label history
    const labelHistory = parseLabelHistory(labels)

    // Find first occurrences of each label
    const firstDoingLabel = findFirstLabel(labelHistory, WORKFLOW_LABELS.DOING)
    const firstReviewLabel = findFirstLabel(labelHistory, WORKFLOW_LABELS.REVIEW)
    const firstTestingLabel = findFirstLabel(labelHistory, WORKFLOW_LABELS.TESTING)

    // Calculate test metrics
    const testFailCount = countLabels(labelHistory, 'test::fail')
    const testingCount = countLabels(labelHistory, WORKFLOW_LABELS.TESTING)

    // Calculate durations
    const totalTimeWorked = calculateTotalTimeWorked(
      firstCommitDate,
      lastCommitDate,
      firstDoingLabel
    )

    // Calculate commits by author
    const commitsByAuthor = calculateCommitsByAuthor(commits)

    // Calculate label times
    const totalTimeInDoing = calculateLabelTime(labelHistory, WORKFLOW_LABELS.DOING, closedDate)
    const totalTimeInReview = calculateLabelTime(labelHistory, WORKFLOW_LABELS.REVIEW, closedDate)
    const totalTimeInTesting = calculateLabelTime(labelHistory, WORKFLOW_LABELS.TESTING, closedDate)

    // Calculate percentages
    const percentageOfTimeInDoing = calculateLabelPercentage(totalTimeInDoing.milliseconds, [
      totalTimeInDoing.milliseconds,
      totalTimeInReview.milliseconds,
      totalTimeInTesting.milliseconds
    ])

    const percentageOfTimeInReview = calculateLabelPercentage(totalTimeInReview.milliseconds, [
      totalTimeInDoing.milliseconds,
      totalTimeInReview.milliseconds,
      totalTimeInTesting.milliseconds
    ])

    const percentageOfTimeInTesting = calculateLabelPercentage(totalTimeInTesting.milliseconds, [
      totalTimeInDoing.milliseconds,
      totalTimeInReview.milliseconds,
      totalTimeInTesting.milliseconds
    ])

    // Calculate time to first testing after review
    const timeToFirstTestingAfterReview = calculateTimeToFirstTestingAfterReview(
      firstReviewLabel,
      firstTestingLabel
    )

    return {
      ...ticket,
      analytics: {
        commitMetrics: {
          totalCommits: commits.length,
          commitsByAuthor,
          firstCommitDate: firstCommitDate?.toISOString() || null,
          lastCommitDate: lastCommitDate?.toISOString() || null,
          totalTimeWorked
        },
        workflowMetrics: {
          totalTimeInDoing: totalTimeInDoing.humanized,
          totalTimeInReview: totalTimeInReview.humanized,
          totalTimeInTesting: totalTimeInTesting.humanized,
          percentageOfTimeInDoing,
          percentageOfTimeInReview,
          percentageOfTimeInTesting,
          timeToFirstTestingAfterReview
        },
        testMetrics: {
          testFailCount,
          testingCount,
          testFailRatio: testingCount > 0 ? (testFailCount / testingCount).toFixed(2) : 'N/A'
        },
        dateMetrics: {
          closedDate: closedDate?.toISOString() || null,
          firstDoingLabelDate: firstDoingLabel?.created_at?.toISOString() || null,
          firstReviewLabelDate: firstReviewLabel?.created_at?.toISOString() || null,
          firstTestingLabelDate: firstTestingLabel?.created_at?.toISOString() || null
        }
      }
    }
  })
}

/**
 * Parse and filter the label history for workflow and test labels
 */
function parseLabelHistory(labels) {
  return labels
    .filter(
      (label) =>
        label?.label?.name?.startsWith('workflow::') || label?.label?.name?.startsWith('test::')
    )
    .map((label) => ({
      ...label,
      created_at: dayjs(label.created_at),
      action: label.action,
      labelName: label.label.name
    }))
}

/**
 * Find the first occurrence of a specific label
 */
function findFirstLabel(labelHistory, labelName) {
  return labelHistory.find((label) => label.labelName === labelName && label.action === 'add')
}

/**
 * Count occurrences of labels that start with the given prefix
 */
function countLabels(labelHistory, labelPrefix) {
  return labelHistory.filter(
    (label) => label.action === 'add' && label.labelName.startsWith(labelPrefix)
  ).length
}

/**
 * Calculate total time worked on a ticket
 */
function calculateTotalTimeWorked(firstCommitDate, lastCommitDate, firstDoingLabel) {
  // Exit early if no valid timestamps
  if (!firstCommitDate || !lastCommitDate) return 'N/A'

  // Compute timestamps once
  const firstDoingTimestamp = firstDoingLabel?.created_at || firstCommitDate

  // Compute both durations once
  const doingLabelDurationMs = firstDoingTimestamp ? lastCommitDate.diff(firstDoingTimestamp) : 0

  const commitDurationMs = lastCommitDate.diff(firstCommitDate)

  // Get the longest duration
  const longestDurationMs = Math.max(doingLabelDurationMs, commitDurationMs)

  // Return humanized duration
  return dayjs.duration(longestDurationMs).humanize()
}

/**
 * Calculate commits grouped by author
 */
function calculateCommitsByAuthor(commits) {
  if (commits.length === 0) return {}

  return commits.reduce((acc, commit) => {
    const author = commit.author?.name || 'Unknown'
    acc[author] = (acc[author] || 0) + 1
    return acc
  }, {})
}

/**
 * Calculate total time spent in a specific label
 */
function calculateLabelTime(labelHistory, labelName, closedDate) {
  const labelEvents = labelHistory
    .filter((label) => label.labelName === labelName)
    .sort((a, b) => a.created_at - b.created_at)

  let totalDuration = dayjs.duration(0)

  for (let i = 0; i < labelEvents.length; i++) {
    const currentEvent = labelEvents[i]

    if (currentEvent.action === 'add') {
      const nextRemoveEvent = labelEvents
        .slice(i + 1)
        .find((event) => event.action === 'remove' && event.labelName === labelName)

      const endTime = nextRemoveEvent ? nextRemoveEvent.created_at : closedDate || dayjs()

      totalDuration = totalDuration.add(dayjs.duration(endTime.diff(currentEvent.created_at)))
    }
  }

  return {
    milliseconds: totalDuration.asMilliseconds(),
    humanized: totalDuration.asMilliseconds() === 0 ? 'N/A' : totalDuration.humanize()
  }
}

/**
 * Calculate percentage of time spent in a label compared to total workflow time
 */
function calculateLabelPercentage(labelDurationMs, allDurationsMs) {
  const totalDuration = allDurationsMs.reduce((sum, duration) => sum + duration, 0)

  if (totalDuration === 0 || labelDurationMs === 0) {
    return ''
  }

  return ((labelDurationMs / totalDuration) * 100).toFixed(2)
}

/**
 * Calculate time to first testing after review
 */
function calculateTimeToFirstTestingAfterReview(firstReviewLabel, firstTestingLabel) {
  if (!firstReviewLabel || !firstTestingLabel) return 'N/A'

  return dayjs.duration(firstTestingLabel.created_at.diff(firstReviewLabel.created_at)).humanize()
}
