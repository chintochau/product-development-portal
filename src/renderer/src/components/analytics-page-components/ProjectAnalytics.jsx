import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'

// Utility function to convert human-readable time to days (example implementation)
const convertTimeToDays = (timeStr) => {
  if (!timeStr) return 0
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

const ProjectAnalytics = ({ issues }) => {
  // Calculate project overview metrics

  let totalIssues = 0;
let totalOpenIssues = 0;
let totalClosedIssues = 0;
let totalBugs = 0;
let totalFeatures = 0;
let completedBugs = 0;
let completeFeatures = 0;
let criticalIssues = 0;
let highIssues = 0;
let testingIssues = 0;

for (const issue of issues) {
  totalIssues++;

  const isOpen = issue.state === 'opened';
  const isClosed = issue.state === 'closed';
  
  if (isOpen) totalOpenIssues++;
  if (isClosed) totalClosedIssues++;

  const labels = issue.labels || [];

  if (labels.includes('type::bug')) {
    totalBugs++;
    if (isClosed) completedBugs++;
  }
  if (labels.includes('type::feature')) {
    totalFeatures++;
    if (isClosed) completeFeatures++;
  }
  if (isOpen) {
    if (labels.includes('priority::critical')) criticalIssues++;
    if (labels.includes('priority::high')) highIssues++;
    if (labels.includes('workflow:: 4 testing')) testingIssues++;
  }
}

  const totalTestingCount = issues.reduce(
    (acc, issue) => acc + (issue.analytics?.testingCount || 0),
    0
  )
  const avgCycleCount = (totalTestingCount / totalClosedIssues).toFixed(1)

  // Calculate developer performance metrics
  const developers = {}

  issues.forEach((issue) => {
    const {
      commitsByAuthor,
      totalTimeInDoing,
      totalTimeInReview,
      totalTimeInTesting,
      testingCount
    } = issue.analytics || {}

    Object.entries(commitsByAuthor || {}).forEach(([name, commits]) => {
      if (!developers[name]) {
        developers[name] = {
          commits: 0,
          tickets: 0,
          testCycles: 0,
          doingDays: 0,
          reviewDays: 0,
          testingDays: 0
        }
      }

      developers[name].commits += commits
      developers[name].tickets += 1
      developers[name].testCycles += testingCount
      developers[name].doingDays += convertTimeToDays(totalTimeInDoing)
      developers[name].reviewDays += convertTimeToDays(totalTimeInReview)
      developers[name].testingDays += convertTimeToDays(totalTimeInTesting)
    })
  })

  const developerStats = Object.entries(developers).map(([name, stats]) => ({
    name,
    ...stats,
    averageCycleCount: (stats.testCycles / stats.tickets).toFixed(1)
  }))

  return (
    <div className="space-y-8 p-6">
      {/* Project Overview Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Project Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalOpenIssues}
                <span className="text-muted-foreground">/{totalIssues}</span>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {completeFeatures}
                <span className="text-muted-foreground">/{totalFeatures}</span>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {completedBugs}
                <span className="text-muted-foreground">/{totalBugs}</span>
              </div>
            </CardContent>
            <CardFooter />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium  ">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalIssues}</div>
            </CardContent>
            <CardFooter />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium  ">High Priority Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{highIssues}</div>
            </CardContent>
            <CardFooter />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Issues in testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{testingIssues}</div>
            </CardContent>
            <CardFooter />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Testing Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold ">{totalTestingCount}</div>
            </CardContent>
            <CardFooter />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Cycle Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgCycleCount}</div>
            </CardContent>
            <CardFooter />
          </Card>
        </div>
      </div>

      {/* Developer Performance Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Developer Performance</h2>
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
                  <TableCell>{dev.commits}</TableCell>
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
