import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import {
  createMilestonePlanningIssue,
  getIssuesFromMilestone,
  getLabelsFromTicket,
  getMilestonePlanningIssues,
  getNameForProject,
  getNotesFromTicket,
  updateMilestonePlanningIssue
} from '../../services/gitlabServices'
import FrameWraper from '../frameWarper'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { useSingleProduct } from '../../contexts/singleProductContext'

import frontMatter from 'front-matter'
import { getColorForAuthor, timeAgo } from '@/lib/utils'
import { StatusComponent } from '../TicketPage'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ProjectAnalytics from './ProjectAnalytics'
import { MilestoneChart } from '../project-page/ProjectsPage'

const PlanningDetail = ({ selectedPlan }) => {
  const { milestones } = useSingleProduct()
  const { milestoneProjectId, milestoneId } = selectedPlan || {}
  const [tickets, setTickets] = useState(selectedPlan?.tickets || [])

  const childRefs = useRef([])
  const handleSaveAll = async () => {
    // Filter out null or undefined refs and collect analytics data
    const allAnalyticsData = childRefs.current
      .filter((ref) => ref !== null && ref !== undefined)
      .map((ref) => {
        const { ticket, getAnalyticsData } = ref || {}
        const { iid, project_id, title } = ticket || {}

        return {
          iid,
          project_id,
          title,
          analytics: getAnalyticsData()
        }
      })
    const response = await updateMilestonePlanningIssue(selectedPlan.id, {
      milestoneProjectId,
      milestoneId,
      tickets: allAnalyticsData
    })
  }

  useEffect(() => {
    if (selectedPlan) {
      const savedTickets = selectedPlan.tickets || []

      const mergeTickets = (saved, updated) => {
        // Merge saved analytics with updated data
        const savedById = Object.fromEntries(saved.map((ticket) => [ticket.iid, ticket]))

        return updated.map((updatedTicket) => {
          const savedTicket = savedById[updatedTicket.iid]
          return {
            ...updatedTicket, // Overwrite with updated GitLab data
            analytics: savedTicket?.analytics // Retain saved analytics if available
          }
        })
      }

      const getTickets = async () => {
        const response = await getIssuesFromMilestone(milestoneProjectId, milestoneId)
        const mergedTickets = mergeTickets(savedTickets, response)
        setTickets(mergedTickets)
      }

      // Initially set tickets to saved data for immediate render
      setTickets(savedTickets)

      // Fetch updated tickets and merge
      getTickets()
    }
  }, [selectedPlan, milestoneProjectId, milestoneId])

  if (!selectedPlan) {
    return null
  }

  const milestoneName =
    getNameForProject(milestoneProjectId) +
    milestones.find((milestone) => milestone.id === milestoneId)?.title
  const getNotesAndLabelsForAllTickets = async () => {
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
            labels: labels
          }
        })
      )

      // Update the tickets state
      setTickets(ticketsWithNotes)
    } catch (error) {
      console.error('Error fetching notes for tickets:', error)
    }
  }

  return (
    <div className="px-4 space-y-2 py-4">
      <h2 className="text-2xl">Milestone: {milestoneName}</h2>
      <MilestoneChart
        selectedMilestone={{
          project_id: milestoneProjectId,
          id: milestoneId
        }}
      />
      <ProjectAnalytics issues={tickets} />
      <div className="flex items-center gap-2">
        <Button onClick={getNotesAndLabelsForAllTickets}> Analyze Tickets</Button>
        <Button onClick={handleSaveAll}> Save Results</Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6">id</TableHead>
              <TableHead className="w-40">title</TableHead>
              <TableHead className="w-96">Commits</TableHead>
              <TableHead className="w-10">status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets
              .sort((a, b) => b.analytics?.totalCommits - a.analytics?.totalCommits)
              .map((ticket, index) => (
                <TicketRow
                  key={ticket.iid}
                  ticket={ticket}
                  ref={(el) => (childRefs.current[index] = el)}
                />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const TicketRow = forwardRef(({ ticket }, ref) => {
  return (
    <TableRow key={ticket.id}>
      <TableCell className="w-6 text-muted-foreground">
        {ticket.references?.relative || ticket.iid}
      </TableCell>
      <TableCell
        className="w-40 max-w-40 font-semibold overflow-clip hover:underline cursor-pointer"
        onClick={() => window.open(ticket.web_url)}
      >
        {ticket.title}
      </TableCell>
      <TableCell className="w-96">
        <CommitAnalytics ticket={ticket} ref={ref} />
      </TableCell>
      <TableCell className="w-10">
        <StatusComponent ticket={ticket} />
      </TableCell>
    </TableRow>
  )
})

const CommitAnalytics = forwardRef(({ ticket }, ref) => {
  const { commits = [], closed_at, labels = [], analytics } = ticket || {}
  // Helper function to safely retrieve data
  const getFromAnalytics = (key, fallback = null) => analytics?.[key] ?? fallback

  // Parse commit dates
  const firstCommitDate =
    commits.length > 0
      ? dayjs(commits[0].created_at)
      : getFromAnalytics('firstCommitDate')
        ? dayjs(getFromAnalytics('firstCommitDate'))
        : null
  const lastCommitDate =
    commits.length > 0
      ? dayjs(commits[commits.length - 1].created_at)
      : getFromAnalytics('lastCommitDate')
        ? dayjs(getFromAnalytics('lastCommitDate'))
        : null
  const closedDate = closed_at
    ? dayjs(closed_at)
    : getFromAnalytics('closedDate')
      ? dayjs(getFromAnalytics('closedDate'))
      : null

  // Parse label history
  const labelHistory = labels
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

  // Find first occurrences of each label
  const firstDoingLabel = labelHistory.find(
    (label) => label.labelName === 'workflow:: 2 doing' && label.action === 'add'
  )
  const firstReviewLabel = labelHistory.find(
    (label) => label.labelName === 'workflow:: 3 review' && label.action === 'add'
  )
  const firstTestingLabel = labelHistory.find(
    (label) => label.labelName === 'workflow:: 4 testing' && label.action === 'add'
  )
  const testFailCount =
    labelHistory.filter(
      (label) => label.action === 'add' && label.labelName.startsWith('test::fail')
    ).length || getFromAnalytics('testFailCount')
  const testingCount =
    labelHistory.filter(
      (label) => label.action === 'add' && label.labelName.startsWith('workflow:: 4 testing')
    ).length || getFromAnalytics('testingCount')

  const allLabels = ['workflow:: 2 doing', 'workflow:: 3 review', 'workflow:: 4 testing']

  // Calculate durations
  const totalTimeWorked = (() => {
    // Compute timestamps once
    const firstDoingTimestamp = firstDoingLabel?.created_at || firstCommitDate
    const lastCommitTimestamp = lastCommitDate

    // Exit early if no valid timestamps
    if (!firstCommitDate || !lastCommitTimestamp) return 'N/A'

    // Compute both durations once
    const doingLabelDurationMs = firstDoingTimestamp
      ? lastCommitTimestamp.diff(firstDoingTimestamp)
      : 0

    const commitDurationMs = lastCommitTimestamp.diff(firstCommitDate)

    // Get the longest duration
    const longestDurationMs = Math.max(doingLabelDurationMs, commitDurationMs)

    // Return humanized duration
    return dayjs.duration(longestDurationMs).humanize()
  })()

  // Calculate commits by author
  const commitsByAuthor =
    commits.length > 0
      ? commits.reduce((acc, commit) => {
          const author = commit.author?.name || 'Unknown'
          acc[author] = (acc[author] || 0) + 1
          return acc
        }, {})
      : getFromAnalytics('commitsByAuthor')
        ? getFromAnalytics('commitsByAuthor')
        : {}

  // Calculate total time in each label
  const totalTimeInLabel = (labelName, returnNumber = false) => {
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

    if (returnNumber) {
      return totalDuration.asMilliseconds()
    }
    return totalDuration.asMilliseconds() === 0 ? 'N/A' : totalDuration.humanize()
  }

  const percentageOfLabelTime = (label, labels = allLabels) => {
    let totalDuration = 0
    const labelDuration = totalTimeInLabel(label, true)
    labels.forEach((labelName) => {
      totalDuration += totalTimeInLabel(labelName, true)
    })

    if (totalDuration === 0 || labelDuration === 0) {
      return ''
    }

    return ((labelDuration / totalDuration) * 100).toFixed(2)
  }

  // Calculate time to first testing after review
  const timeToFirstTestingAfterReview =
    firstReviewLabel && firstTestingLabel
      ? dayjs.duration(firstTestingLabel.created_at.diff(firstReviewLabel.created_at)).humanize()
      : 'N/A'

  const totalCommits = commits.length || getFromAnalytics('totalCommits')

  const totalTimeInDoing =
    totalTimeInLabel('workflow:: 2 doing') === 'N/A'
      ? getFromAnalytics('totalTimeInDoing')
      : totalTimeInLabel('workflow:: 2 doing')
  const totalTimeInReview =
    totalTimeInLabel('workflow:: 3 review') === 'N/A'
      ? getFromAnalytics('totalTimeInReview')
      : totalTimeInLabel('workflow:: 3 review')
  const totalTimeInTesting =
    totalTimeInLabel('workflow:: 4 testing') === 'N/A'
      ? getFromAnalytics('totalTimeInTesting')
      : totalTimeInLabel('workflow:: 4 testing')
  const percentageOfTimeInDoing =
    percentageOfLabelTime('workflow:: 2 doing') === ''
      ? getFromAnalytics('percentageOfTimeInDoing')
      : percentageOfLabelTime('workflow:: 2 doing')
  const percentageOfTimeInReview =
    percentageOfLabelTime('workflow:: 3 review') === ''
      ? getFromAnalytics('percentageOfTimeInReview')
      : percentageOfLabelTime('workflow:: 3 review')
  const percentageOfTimeInTesting =
    percentageOfLabelTime('workflow:: 4 testing') === ''
      ? getFromAnalytics('percentageOfTimeInTesting')
      : percentageOfLabelTime('workflow:: 4 testing')

  // Expose the analytics data to the parent via ref
  useImperativeHandle(ref, () => ({
    ticket: ticket,
    getAnalyticsData: () => ({
      firstCommitDate: firstCommitDate ? firstCommitDate.format('YYYY-MM-DD HH:mm') : null,
      lastCommitDate: lastCommitDate ? lastCommitDate.format('YYYY-MM-DD HH:mm') : null,
      closedDate: closedDate ? closedDate.format('YYYY-MM-DD HH:mm') : null,
      totalTimeWorked,
      commitsByAuthor,
      totalCommits,
      totalTimeInDoing: totalTimeInLabel('workflow:: 2 doing'),
      totalTimeInReview: totalTimeInLabel('workflow:: 3 review'),
      totalTimeInTesting: totalTimeInLabel('workflow:: 4 testing'),
      percentageOfTimeInDoing: percentageOfLabelTime('workflow:: 2 doing'),
      percentageOfTimeInReview: percentageOfLabelTime('workflow:: 3 review'),
      percentageOfTimeInTesting: percentageOfLabelTime('workflow:: 4 testing'),
      timeToFirstTestingAfterReview,
      testingCount,
      testFailCount
    })
  }))

  return (
    <div className="bg-background shadow-lg rounded-lg px-3 py-1.5 w-full border border-border hover:shadow-xl transition-shadow duration-300">
      <div className="flex gap-6">
        {/* Left Column: Commit Metrics */}
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">First Commit:</span>
            <span className={`font-medium ${firstCommitDate ? 'text-primary' : 'text-gray-400'}`}>
              {firstCommitDate ? firstCommitDate.format('YYYY-MM-DD HH:mm') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Commit:</span>
            <span className={`font-medium ${lastCommitDate ? 'text-primary' : 'text-gray-400'}`}>
              {lastCommitDate ? lastCommitDate.format('YYYY-MM-DD HH:mm') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Time Worked:</span>
            <span
              className={`font-medium ${
                totalTimeWorked !== 'N/A' ? 'text-blue-600' : 'text-primary'
              }`}
            >
              {totalTimeWorked}
            </span>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex justify-between">
              <span>Commits:</span> <span className="text-blue-600">{totalCommits}</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(commitsByAuthor).map(([author, count]) => (
                <div key={author} className="flex flex-col ">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{author}:</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <Progress
                    value={(count / totalCommits) * 100}
                    barColor={getColorForAuthor(author)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Label Metrics */}
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              <Badge className="bg-blue-500">Doing</Badge>
            </span>
            <span
              className={`font-medium ${
                totalTimeInDoing !== 'N/A' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {totalTimeInDoing}
              <span className="text-muted-foreground text-xs">({percentageOfTimeInDoing}%)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              <Badge className="bg-orange-500">Review</Badge>
            </span>
            <span
              className={`font-medium ${
                totalTimeInReview !== 'N/A' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {totalTimeInReview}
              <span className="text-muted-foreground text-xs">({percentageOfTimeInReview}%)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              <Badge className="bg-purple-500">Testing</Badge>
            </span>
            <span
              className={`font-medium ${
                totalTimeInTesting !== 'N/A' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {totalTimeInTesting}
              <span className="text-muted-foreground text-xs">({percentageOfTimeInTesting}%)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">From First Review To Testing:</span>
            <span
              className={`font-medium ${
                timeToFirstTestingAfterReview !== 'N/A' ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              {timeToFirstTestingAfterReview}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Testing Cycles:</span>
            <span className="font-medium text-gray-900">{testingCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default PlanningDetail
