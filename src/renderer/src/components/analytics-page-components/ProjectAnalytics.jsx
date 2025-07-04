import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  AlertCircle,
  Bug,
  FileText,
  CheckCircle,
  Clock,
  GitCommit,
  User,
  Activity,
  BarChart2,
  Calendar
} from 'lucide-react'
import { useMemo } from 'react'

// Utility function to convert human-readable time to days
const convertTimeToDays = (timeStr) => {
  if (!timeStr || timeStr === 'N/A') return 0
  const [_, number, unit] = timeStr.match(/(\d+)?\s?(.*)/) || []
  const value = number ? parseInt(number) : 1

  const unitMap = {
    day: 1,
    days: 1,
    week: 7,
    weeks: 7,
    month: 30,
    months: 30,
    year: 365,
    years: 365
  }

  return value * (unitMap[unit] || 0)
}

// Safe average calculation helper
const safeAverage = (arr, valueFunc) => {
  if (!arr || arr.length === 0) return 0
  const validValues = arr.map(valueFunc).filter((v) => !isNaN(v) && v !== null && v !== undefined)
  if (validValues.length === 0) return 0
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length
}

const ProjectAnalytics = ({ tickets }) => {
  const {
    totalIssues,
    totalOpenIssues,
    totalClosedIssues,
    totalBugs,
    totalFeatures,
    completedBugs,
    completeFeatures,
    criticalIssues,
    highIssues,
    totalCommits,
    totalTestFailCount,
    totalTestingCount,
    totalTicketsInDoing,
    totalTicketsInReview,
    totalTicketsInTesting,
    totalTicketsInDone,
    avgCycleCount,
    avgResolutionTime,
    avgDoingPercentage,
    avgReviewPercentage,
    avgTestingPercentage,
    testFailRatio,
    avgTimeInDoing,
    avgTimeInReview,
    avgTimeInTesting,
    avgTimeToTestingAfterReview,
    developerStats
  } = useMemo(() => {
    // Initialize metrics
    let totalIssues = 0
    let totalOpenIssues = 0
    let totalClosedIssues = 0
    let totalBugs = 0
    let totalFeatures = 0
    let completedBugs = 0
    let completeFeatures = 0
    let criticalIssues = 0
    let highIssues = 0
    let totalCommits = 0
    let totalTestFailCount = 0
    let totalTestingCount = 0
    let totalTicketsInDoing = 0
    let totalTicketsInReview = 0
    let totalTicketsInTesting = 0
    let totalTicketsInDone = 0

    // Developer metrics tracking
    const developers = {}

    // Collect all resolution times for averages
    const resolutionTimes = []
    const doingTimes = []
    const reviewTimes = []
    const testingTimes = []
    const testingAfterReviewTimes = []

    // Calculate percentages for workflow stages
    const doingPercentages = []
    const reviewPercentages = []
    const testingPercentages = []

    // Process tickets
    for (const ticket of tickets) {
      totalIssues++
      totalCommits += ticket.analytics?.commitMetrics?.totalCommits || 0

      // Test metrics
      const testFails = ticket.analytics?.testMetrics?.testFailCount || 0
      const testCount = ticket.analytics?.testMetrics?.testingCount || 0
      totalTestFailCount += testFails
      totalTestingCount += testCount

      const isOpen = ticket.state === 'opened'
      const isClosed = ticket.state === 'closed'

      if (isOpen) totalOpenIssues++
      if (isClosed) totalClosedIssues++

      const labels = ticket.labels || []

      // Type metrics
      if (labels.includes('type::bug')) {
        totalBugs++
        if (isClosed) completedBugs++
      }

      if (labels.includes('type::feature')) {
        totalFeatures++
        if (isClosed) completeFeatures++
      }

      // Priority and workflow metrics
      if (labels.includes('priority::critical')) criticalIssues++
      if (labels.includes('priority::high')) highIssues++

      // Count tickets in each workflow stage
      if (labels.includes('workflow:: 2 doing')) totalTicketsInDoing++
      if (labels.includes('workflow:: 3 review')) totalTicketsInReview++
      if (labels.includes('workflow:: 4 testing')) totalTicketsInTesting++
      if (labels.includes('workflow:: 5 done')) totalTicketsInDone++

      // Collect time data for averages
      if (ticket.analytics?.workflowMetrics?.percentageOfTimeInDoing) {
        doingPercentages.push(parseFloat(ticket.analytics.workflowMetrics.percentageOfTimeInDoing))
      }

      if (ticket.analytics?.workflowMetrics?.percentageOfTimeInReview) {
        reviewPercentages.push(
          parseFloat(ticket.analytics.workflowMetrics.percentageOfTimeInReview)
        )
      }

      if (ticket.analytics?.workflowMetrics?.percentageOfTimeInTesting) {
        testingPercentages.push(
          parseFloat(ticket.analytics.workflowMetrics.percentageOfTimeInTesting)
        )
      }

      // Resolution time calculation
      if (
        isClosed &&
        ticket.analytics?.dateMetrics?.firstDoingLabelDate &&
        ticket.analytics?.dateMetrics?.closedDate
      ) {
        const start = new Date(ticket.analytics.dateMetrics.firstDoingLabelDate)
        const end = new Date(ticket.analytics.dateMetrics.closedDate)
        resolutionTimes.push((end - start) / (1000 * 60 * 60 * 24)) // days
      }

      // Workflow timing data
      if (ticket.analytics?.workflowMetrics?.totalTimeInDoing) {
        doingTimes.push(convertTimeToDays(ticket.analytics.workflowMetrics.totalTimeInDoing))
      }

      if (
        ticket.analytics?.workflowMetrics?.totalTimeInReview &&
        ticket.analytics.workflowMetrics.totalTimeInReview !== 'N/A'
      ) {
        reviewTimes.push(convertTimeToDays(ticket.analytics.workflowMetrics.totalTimeInReview))
      }

      if (
        ticket.analytics?.workflowMetrics?.totalTimeInTesting &&
        ticket.analytics.workflowMetrics.totalTimeInTesting !== 'N/A'
      ) {
        testingTimes.push(convertTimeToDays(ticket.analytics.workflowMetrics.totalTimeInTesting))
      }

      if (
        ticket.analytics?.workflowMetrics?.timeToFirstTestingAfterReview &&
        ticket.analytics.workflowMetrics.timeToFirstTestingAfterReview !== 'N/A'
      ) {
        testingAfterReviewTimes.push(
          convertTimeToDays(ticket.analytics.workflowMetrics.timeToFirstTestingAfterReview)
        )
      }

      // Developer metrics
      const commitsByAuthor = ticket.analytics?.commitMetrics?.commitsByAuthor || {}

      Object.entries(commitsByAuthor).forEach(([name, commits]) => {
        if (!developers[name]) {
          developers[name] = {
            commits: 0,
            tickets: 0,
            testCycles: 0,
            testFails: 0,
            doingDays: 0,
            reviewDays: 0,
            testingDays: 0
          }
        }

        developers[name].commits += commits
        developers[name].tickets += 1
        developers[name].testCycles += testCount
        developers[name].testFails += testFails
        developers[name].doingDays += convertTimeToDays(
          ticket.analytics?.workflowMetrics?.totalTimeInDoing || 0
        )
        developers[name].reviewDays += convertTimeToDays(
          ticket.analytics?.workflowMetrics?.totalTimeInReview || 0
        )
        developers[name].testingDays += convertTimeToDays(
          ticket.analytics?.workflowMetrics?.totalTimeInTesting || 0
        )
      })
    }

    // Calculate averages
    const avgCycleCount =
      totalClosedIssues > 0 ? (totalTestingCount / totalClosedIssues).toFixed(1) : '0.0'
    const avgResolutionTime = safeAverage(resolutionTimes, (v) => v).toFixed(1)
    const avgDoingPercentage = safeAverage(doingPercentages, (v) => v).toFixed(1)
    const avgReviewPercentage = safeAverage(reviewPercentages, (v) => v).toFixed(1)
    const avgTestingPercentage = safeAverage(testingPercentages, (v) => v).toFixed(1)

    const testFailRatio =
      totalTestingCount > 0 ? ((totalTestFailCount / totalTestingCount) * 100).toFixed(2) : '0.00'

    const avgTimeInDoing = safeAverage(doingTimes, (v) => v).toFixed(1)
    const avgTimeInReview = safeAverage(reviewTimes, (v) => v).toFixed(1)
    const avgTimeInTesting = safeAverage(testingTimes, (v) => v).toFixed(1)
    const avgTimeToTestingAfterReview = safeAverage(testingAfterReviewTimes, (v) => v).toFixed(1)

    // Format developer stats
    const developerStats = Object.entries(developers).map(([name, stats]) => ({
      name,
      ...stats,
      averageCycleCount: (stats.tickets > 0 ? stats.testCycles / stats.tickets : 0).toFixed(1),
      failRatio: (stats.testCycles > 0 ? (stats.testFails / stats.testCycles) * 100 : 0).toFixed(1)
    }))

    return {
      totalIssues,
      totalOpenIssues,
      totalClosedIssues,
      totalBugs,
      totalFeatures,
      completedBugs,
      completeFeatures,
      criticalIssues,
      highIssues,
      totalCommits,
      totalTestFailCount,
      totalTestingCount,
      totalTicketsInDoing,
      totalTicketsInReview,
      totalTicketsInTesting,
      totalTicketsInDone,
      avgCycleCount,
      avgResolutionTime,
      avgDoingPercentage,
      avgReviewPercentage,
      avgTestingPercentage,
      testFailRatio,
      avgTimeInDoing,
      avgTimeInReview,
      avgTimeInTesting,
      avgTimeToTestingAfterReview,
      developerStats
    }
  }, [tickets])

  // Calculate percentages for progress bars
  const bugFixedPercent = totalBugs > 0 ? (completedBugs / totalBugs) * 100 : 0
  const featuresCompletePercent = totalFeatures > 0 ? (completeFeatures / totalFeatures) * 100 : 0
  const issuesCompletedPercent = totalIssues > 0 ? (totalClosedIssues / totalIssues) * 100 : 0

  // Calculate percentages for workflow stage distribution
  const doingPercent = totalIssues > 0 ? ((totalTicketsInDoing / totalIssues) * 100).toFixed(1) : 0
  const reviewPercent =
    totalIssues > 0 ? ((totalTicketsInReview / totalIssues) * 100).toFixed(1) : 0
  const testingPercent =
    totalIssues > 0 ? ((totalTicketsInTesting / totalIssues) * 100).toFixed(1) : 0
  const donePercent = totalIssues > 0 ? ((totalTicketsInDone / totalIssues) * 100).toFixed(1) : 0

  return (
    <div className="space-y-8 p-6">
      {/* Project Overview Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" /> Project Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">{totalIssues}</div>
                <div className="text-sm text-muted-foreground">
                  {totalOpenIssues} open / {totalClosedIssues} closed
                </div>
              </div>
              <Progress className="h-2 mt-2" value={issuesCompletedPercent} />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">
                  {completeFeatures}
                  <span className="text-muted-foreground text-lg">/{totalFeatures}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {featuresCompletePercent.toFixed(0)}% complete
                </div>
              </div>
              <Progress className="h-2 mt-2" value={featuresCompletePercent} />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bug className="h-4 w-4" /> Bugs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">
                  {completedBugs}
                  <span className="text-muted-foreground text-lg">/{totalBugs}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {bugFixedPercent.toFixed(0)}% fixed
                </div>
              </div>
              <Progress className="h-2 mt-2" value={bugFixedPercent} />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitCommit className="h-4 w-4" /> Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-bold">{totalCommits}</div>
                <div className="text-sm text-muted-foreground">
                  {totalIssues > 0 ? (totalCommits / totalIssues).toFixed(1) : '0.0'} per issue
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" /> Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalIssues}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" /> High Priority Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{highIssues}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" /> Issues in Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{totalTicketsInTesting}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow & Testing Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" /> Workflow Insights
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Workflow Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Doing</div>
                    <div className="text-sm font-medium">{doingPercent}%</div>
                  </div>
                  <Progress
                    value={doingPercent}
                    className="h-2 bg-gray-200"
                    indicatorClassName="bg-amber-500"
                  />
                  <div className="text-sm text-muted-foreground">{totalTicketsInDoing} tickets</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Review</div>
                    <div className="text-sm font-medium">{reviewPercent}%</div>
                  </div>
                  <Progress
                    value={reviewPercent}
                    className="h-2 bg-gray-200"
                    indicatorClassName="bg-blue-500"
                  />
                  <div className="text-sm text-muted-foreground">
                    {totalTicketsInReview} tickets
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Testing</div>
                    <div className="text-sm font-medium">{testingPercent}%</div>
                  </div>
                  <Progress
                    value={testingPercent}
                    className="h-2 bg-gray-200"
                    indicatorClassName="bg-green-500"
                  />
                  <div className="text-sm text-muted-foreground">
                    {totalTicketsInTesting} tickets
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Done</div>
                    <div className="text-sm font-medium">{donePercent}%</div>
                  </div>
                  <Progress
                    value={donePercent}
                    className="h-2 bg-gray-200"
                    indicatorClassName="bg-green-500"
                  />
                  <div className="text-sm text-muted-foreground">{totalTicketsInDone} tickets</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Testing Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Test Cycles</div>
                  <div className="text-3xl font-bold">{totalTestingCount}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Average Cycles per Issue</div>
                  <div className="text-3xl font-bold">{avgCycleCount}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Test Failure Rate</div>
                  <div className="text-3xl font-bold">{testFailRatio}%</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Test Failures</div>
                  <div className="text-3xl font-bold">{totalTestFailCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Insights */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Timeline Insights
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Average Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgResolutionTime} days</div>
              <p className="text-sm text-muted-foreground mt-1">From start to completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Workflow Timing (Average)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Time in Doing:</span>
                  <span className="text-sm font-medium">{avgTimeInDoing} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Time in Review:</span>
                  <span className="text-sm font-medium">{avgTimeInReview} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Time in Testing:</span>
                  <span className="text-sm font-medium">{avgTimeInTesting} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Testing After Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgTimeToTestingAfterReview} days</div>
              <p className="text-sm text-muted-foreground mt-1">
                Average time to reach testing after review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Developer Performance Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Developer Performance
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Developer</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Commits</TableHead>
                <TableHead>Avg Cycle</TableHead>
                <TableHead>Doing (days)</TableHead>
                <TableHead>Review (days)</TableHead>
                <TableHead>Testing (days)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developerStats.map((dev) => (
                <TableRow key={dev.name}>
                  <TableCell className="font-medium">{dev.name}</TableCell>
                  <TableCell>{dev.tickets}</TableCell>
                  <TableCell>
                    {dev.commits}{' '}
                    <span className="text-xs text-muted-foreground">
                      ({dev.tickets > 0 ? (dev.commits / dev.tickets).toFixed(1) : '0.0'}/ticket)
                    </span>
                  </TableCell>
                  <TableCell>{dev.averageCycleCount}</TableCell>

                  <TableCell>{dev.doingDays.toFixed(1)}</TableCell>
                  <TableCell>{dev.reviewDays.toFixed(1)}</TableCell>
                  <TableCell>{dev.testingDays.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

export default ProjectAnalytics
