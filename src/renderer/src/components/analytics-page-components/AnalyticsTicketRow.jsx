import React, { useMemo, useCallback, memo } from 'react'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

import { cn, getColorForAuthor, timeAgo } from '@/lib/utils'
import { StatusComponent } from '../TicketPage'

import dayjs from 'dayjs'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { Clock, ExternalLink, GitCommit, User } from 'lucide-react'

// Memoized TicketTitle component for better performance
const TicketTitle = memo(({ title, web_url }) => {
  const handleClick = useCallback(() => {
    window.open(web_url)
  }, [web_url])

  return (
    <h3 
      className="font-medium text-base text-primary group-hover:text-primary line-clamp-3"
      onClick={handleClick}
    >
      {title}
    </h3>
  )
})
TicketTitle.displayName = 'TicketTitle'

// Memoized TicketMetadata component
const TicketMetadata = memo(({ assignee, analytics }) => {
  return (
    <div className="flex items-center gap-3 text-muted-foreground text-xs">
      {assignee && (
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <img
              src={assignee.avatar_url}
              alt={assignee.name}
              className="w-5 h-5 rounded-full ring-1 ring-background shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-px shadow-sm">
              <User size={8} className="text-primary" />
            </span>
          </div>
          <span>{assignee.name}</span>
        </div>
      )}

      {analytics?.commitMetrics?.totalCommits > 0 && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/5 rounded-full">
          <GitCommit size={10} className="text-primary" />
          <span className="font-semibold text-primary">
            {analytics.commitMetrics.totalCommits}
          </span>
        </div>
      )}

      {analytics?.commitMetrics?.lastCommitDate && (
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{dayjs(analytics.commitMetrics.lastCommitDate).fromNow()}</span>
        </div>
      )}
    </div>
  )
})
TicketMetadata.displayName = 'TicketMetadata'

// Main component
const AnalyticsTicketRow = memo(({ ticket }) => {
  const handleTicketClick = useCallback(() => {
    window.open(ticket.web_url)
  }, [ticket.web_url])

  return (
    <TableRow
      key={ticket.id}
      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-all duration-200 border-b border-border/40"
    >
      <TableCell className="py-3 text-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-2 bg-primary/5 font-mono">
            #{ticket.references?.relative || ticket.iid}
          </Badge>
        </div>
      </TableCell>

      <TableCell
        className="py-3 cursor-pointer relative"
        onClick={handleTicketClick}
      >
        <div className="flex flex-col gap-1.5 group-hover:translate-x-1 transition-transform duration-200">
          <TicketTitle title={ticket.title} web_url={ticket.web_url} />
          <TicketMetadata assignee={ticket.assignee} analytics={ticket.analytics} />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={14} className="text-muted-foreground" />
        </div>
      </TableCell>

      <TableCell className="py-3 w-1/2">
        <CommitAnalytics analytics={ticket.analytics} />
      </TableCell>
      <TableCell>
        <StatusComponent ticket={ticket} />
      </TableCell>
    </TableRow>
  )
})
AnalyticsTicketRow.displayName = 'AnalyticsTicketRow'

// Timeline component
const WorkflowTimeline = memo(({ percentages }) => {
  const { percentageOfTimeInDoing, percentageOfTimeInReview, percentageOfTimeInTesting } = percentages

  return (
    <div className="mb-2">
      <div className="flex items-center h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {percentageOfTimeInDoing && (
          <div
            className="h-full bg-blue-500"
            style={{ width: `${percentageOfTimeInDoing}%` }}
            title={`Doing: ${percentages.totalTimeInDoing} (${percentageOfTimeInDoing}%)`}
          />
        )}
        {percentageOfTimeInReview && (
          <div
            className="h-full bg-amber-500"
            style={{ width: `${percentageOfTimeInReview}%` }}
            title={`Review: ${percentages.totalTimeInReview} (${percentageOfTimeInReview}%)`}
          />
        )}
        {percentageOfTimeInTesting && (
          <div
            className="h-full bg-purple-500"
            style={{ width: `${percentageOfTimeInTesting}%` }}
            title={`Testing: ${percentages.totalTimeInTesting} (${percentageOfTimeInTesting}%)`}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Doing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span>Testing</span>
        </div>
      </div>
    </div>
  )
})
WorkflowTimeline.displayName = 'WorkflowTimeline'

// ContributorsList component
const ContributorsList = memo(({ commitsByAuthor, totalCommits }) => {
  if (!commitsByAuthor || Object.keys(commitsByAuthor).length === 0) return null

  return (
    <div className="mt-1 pt-1 border-t border-border/30">
      <h5 className="text-xs font-medium text-muted-foreground mb-1">Contributors</h5>
      <div className="space-y-1">
        {Object.entries(commitsByAuthor).map(([author, count]) => (
          <div key={author} className="text-xs">
            <div className="flex justify-between items-center mb-0.5">
              <span className="truncate max-w-[120px]">{author}</span>
              <span className="font-semibold text-primary">{count}</span>
            </div>
            <Progress
              value={(count / totalCommits) * 100}
              className="h-1"
              barColor={getColorForAuthor(author)}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
ContributorsList.displayName = 'ContributorsList'

// Optimized CommitAnalytics component
const CommitAnalytics = memo(({ analytics }) => {
  // Optimize with useMemo to prevent unnecessary recalculations
  const { commitMetrics, workflowMetrics, testMetrics } = useMemo(() => {
    return {
      commitMetrics: analytics?.commitMetrics || {},
      workflowMetrics: analytics?.workflowMetrics || {},
      testMetrics: analytics?.testMetrics || {}
    }
  }, [analytics])

  // Extract data with useMemo to improve performance
  const { firstCommitDate, lastCommitDate, totalCommits, totalTimeWorked, commitsByAuthor } =
    useMemo(() => commitMetrics, [commitMetrics])

  const workflowPercentages = useMemo(() => {
    return {
      totalTimeInDoing: workflowMetrics.totalTimeInDoing,
      totalTimeInReview: workflowMetrics.totalTimeInReview, 
      totalTimeInTesting: workflowMetrics.totalTimeInTesting,
      percentageOfTimeInDoing: workflowMetrics.percentageOfTimeInDoing,
      percentageOfTimeInReview: workflowMetrics.percentageOfTimeInReview,
      percentageOfTimeInTesting: workflowMetrics.percentageOfTimeInTesting
    }
  }, [workflowMetrics])

  const { testFailCount, testingCount, testFailRatio, timeToFirstTestingAfterReview } = 
    useMemo(() => ({
      ...testMetrics,
      timeToFirstTestingAfterReview: workflowMetrics.timeToFirstTestingAfterReview
    }), [testMetrics, workflowMetrics])

  // Format dates only when needed
  const formattedDates = useMemo(() => ({
    firstCommit: firstCommitDate ? dayjs(firstCommitDate).format('MMM D, YYYY') : null,
    lastCommit: lastCommitDate ? dayjs(lastCommitDate).format('MMM D, YYYY') : null
  }), [firstCommitDate, lastCommitDate])

  return (
    <div className="bg-background/80 backdrop-blur-sm shadow-sm rounded-xl p-3 w-full border border-border/50 hover:shadow-md hover:border-border/80 transition-all duration-300">
      {/* Timeline visualization */}
      <WorkflowTimeline percentages={workflowPercentages} />

      <div className="grid grid-cols-2 gap-2">
        {/* Left Column: Dev Metrics */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-primary">Development</h4>
            {totalCommits > 0 && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs py-0"
              >
                {totalCommits} commits
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {totalTimeWorked && totalTimeWorked !== 'N/A' && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Work time:</span>
                <span className="font-medium text-primary">{totalTimeWorked}</span>
              </div>
            )}

            {formattedDates.firstCommit && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">First commit:</span>
                <span className="font-medium">{formattedDates.firstCommit}</span>
              </div>
            )}

            {formattedDates.lastCommit && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Last commit:</span>
                <span className="font-medium">{formattedDates.lastCommit}</span>
              </div>
            )}
          </div>

          {/* Contributors */}
          <ContributorsList commitsByAuthor={commitsByAuthor} totalCommits={totalCommits} />
        </div>

        {/* Right Column: Process Metrics */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-primary">Workflow</h4>
            {testingCount > 0 && (
              <Badge
                variant="outline"
                className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/30 text-xs py-0"
              >
                {testingCount} testing cycles
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {workflowPercentages.totalTimeInDoing && workflowPercentages.totalTimeInDoing !== 'N/A' && (
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Doing:</span>
                </div>
                <div>
                  <span className="font-medium">{workflowPercentages.totalTimeInDoing}</span>
                  <span className="text-muted-foreground text-[10px] ml-1">
                    ({workflowPercentages.percentageOfTimeInDoing}%)
                  </span>
                </div>
              </div>
            )}

            {workflowPercentages.totalTimeInReview && workflowPercentages.totalTimeInReview !== 'N/A' && (
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-muted-foreground">Review:</span>
                </div>
                <div>
                  <span className="font-medium">{workflowPercentages.totalTimeInReview}</span>
                  <span className="text-muted-foreground text-[10px] ml-1">
                    ({workflowPercentages.percentageOfTimeInReview}%)
                  </span>
                </div>
              </div>
            )}

            {workflowPercentages.totalTimeInTesting && workflowPercentages.totalTimeInTesting !== 'N/A' && (
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-muted-foreground">Testing:</span>
                </div>
                <div>
                  <span className="font-medium">{workflowPercentages.totalTimeInTesting}</span>
                  <span className="text-muted-foreground text-[10px] ml-1">
                    ({workflowPercentages.percentageOfTimeInTesting}%)
                  </span>
                </div>
              </div>
            )}

            {timeToFirstTestingAfterReview && timeToFirstTestingAfterReview !== 'N/A' && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Review to test:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {timeToFirstTestingAfterReview}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
CommitAnalytics.displayName = 'CommitAnalytics'

export default AnalyticsTicketRow