import React, { useEffect, useState } from 'react'
import FrameWraper from '../frameWarper'
import { useProjects } from '../../contexts/projecstContext'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { Separator } from '../../../../components/ui/separator'
import {
  getIssuesFromMilestone,
  getNameForProject,
  getProjectNamesAndIds,
  groupIssuesByProjectId
} from '../../services/gitlabServices'
import {
  CheckCircle,
  MailOpen,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCcw
} from 'lucide-react'
import { Label } from '../../../../components/ui/label'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import _ from 'lodash'
import { Progress } from '../../../../components/ui/progress'
import { cn, daysFromToday } from '../../../../lib/utils'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { StatusComponent } from '../TicketPage'

const ticketStates = ['opened', 'closed']

const ProjectsPage = () => {
  const { weekIssues, loading, setShouldRefresh } = useProjects()

  const projectNamesAndIds = getProjectNamesAndIds(weekIssues)

  const [selectedProjects, setSelectedProjects] = useState([])

  const [selectedState, setSelectedState] = useState(['opened'])

  useEffect(() => {
    setSelectedProjects(projectNamesAndIds.map((p) => p.projectId))
  }, [weekIssues])
  return (
    <FrameWraper>
      <div className="px-4">
        <div className="flex items-center">
          <h2 className="text-2xl ">Projects</h2>

          <Button
            size="icon"
            variant="ghost"
            className="group"
            onClick={() => setShouldRefresh(true)}
          >
            <RefreshCcw className="h-4 w-4 group-hover:animate-spin" />
          </Button>
        </div>
        <div>{!loading ? <IssueCards /> : <Loader2 className="animate-spin" />}</div>
        <div className="flex items-center">
          <h2 className="text-2xl "> Issues in Two Weeks</h2>
          <Button
            size="icon"
            variant="ghost"
            className="group"
            onClick={() => setShouldRefresh(true)}
          >
            <RefreshCcw className="h-4 w-4 group-hover:animate-spin" />
          </Button>
        </div>

        <div className="flex  gap-2">
          <div className="flex items-center gap-1">
            <Checkbox
              id="all"
              checked={selectedProjects.length === projectNamesAndIds.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedProjects(projectNamesAndIds.map((p) => p.projectId))
                } else {
                  setSelectedProjects([])
                }
              }}
            />
            <label htmlFor="all">All</label>
          </div>

          {projectNamesAndIds.map((project) => (
            <div key={project.id} className="flex items-center gap-1">
              <Checkbox
                id={project.id}
                checked={selectedProjects.includes(project.projectId)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedProjects([...selectedProjects, project.projectId])
                  } else {
                    setSelectedProjects(selectedProjects.filter((p) => p !== project.projectId))
                  }
                }}
              />
              <label htmlFor={project.id}> {project.name}</label>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {ticketStates.map((state) => (
            <div key={state} className="flex items-center gap-1">
              <Checkbox
                id={state}
                checked={selectedState.includes(state)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedState([...selectedState, state])
                  } else {
                    setSelectedState(selectedState.filter((s) => s !== state))
                  }
                }}
              />
              <label htmlFor={state}> {state}</label>
            </div>
          ))}
        </div>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-fit">Project</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Gitlab</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekIssues
                .filter(
                  (issue) =>
                    selectedProjects.includes(issue.project_id) &&
                    selectedState.includes(issue.state)
                )
                .map((issue) => (
                  <TableRow
                    key={issue.id}
                    className={cn(issue.state === 'closed' ? ' text-muted-foreground/50' : '')}
                  >
                    <TableCell className="w-44">{issue.references.relative}</TableCell>
                    <TableCell>{issue.title}</TableCell>
                    <TableCell>{issue.author?.name}</TableCell>
                    <TableCell>{issue.assignee?.name}</TableCell>
                    <TableCell
                      onClick={() => window.open(issue.web_url)}
                      className="cursor-pointer hover:underline"
                    >
                      Link
                    </TableCell>
                    <TableCell className="w-44">{issue.milestone?.title}</TableCell>
                    <TableCell>
                      <StatusComponent status={issue.state} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </FrameWraper>
  )
}

export default ProjectsPage

const IssueCards = () => {
  const {
    issuesOpenedThisWeek,
    issuesOpenedLastWeek,
    issuesClosedThisWeek,
    issuesClosedLastWeek,
    weekIssues
  } = useProjects()

  const projectNames = getProjectNamesAndIds(weekIssues)

  const lastWeekOpenByProject = groupIssuesByProjectId(issuesOpenedLastWeek)
  const lastWeekClosedByProject = groupIssuesByProjectId(issuesClosedLastWeek)
  const thisWeekOpenByProject = groupIssuesByProjectId(issuesOpenedThisWeek)
  const thisWeekClosedByProject = groupIssuesByProjectId(issuesClosedThisWeek)

  const calculateChange = (current, previous) => {
    const diff = current - previous
    const percentage = previous ? Math.round((diff / previous) * 100) : 0
    return { diff, percentage }
  }

  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      {projectNames.map((project) => {
        const thisWeekOpen = thisWeekOpenByProject[project.projectId]?.issues?.length || 0
        const lastWeekOpen = lastWeekOpenByProject[project.projectId]?.issues?.length || 0
        const openChange = calculateChange(thisWeekOpen, lastWeekOpen)

        const thisWeekClosed = thisWeekClosedByProject[project.projectId]?.issues?.length || 0
        const lastWeekClosed = lastWeekClosedByProject[project.projectId]?.issues?.length || 0
        const closedChange = calculateChange(thisWeekClosed, lastWeekClosed)
        return (
          <ProjectIssueCard
            key={project.projectId}
            project={project}
            thisWeekOpen={thisWeekOpen}
            openChange={openChange}
            thisWeekClosed={thisWeekClosed}
            closedChange={closedChange}
          />
        )
      })}
      <ProjectIssueCard
        project={{
          id: 0,
          name: 'Total',
          color: 'hsl(var(--default-chart-color))',
          web_url: 'https://gitlab.com/groups/lenbrook/sovi/-/issues/'
        }}
        thisWeekOpen={issuesOpenedThisWeek.length}
        openChange={calculateChange(issuesOpenedThisWeek.length, issuesOpenedLastWeek.length)}
        thisWeekClosed={issuesClosedThisWeek.length}
        closedChange={calculateChange(issuesClosedThisWeek.length, issuesClosedLastWeek.length)}
      />
    </div>
  )
}
function ProjectIssueCard({ project, thisWeekOpen, openChange, thisWeekClosed, closedChange }) {
  const { milestones } = useSingleProduct()

  const projectMilestons = milestones
    .filter((milestone) => milestone.project_id === project.projectId)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  const defaultMilesotne = projectMilestons.find(
    (milestone) => milestone.due_date && new Date(milestone.due_date) > new Date()
  )

  const [selectedMilestone, setSelectedMilestone] = useState(defaultMilesotne)

  return (
    <Card key={project.id}>
      <CardHeader className="bg-secondary/10">
        <CardTitle style={{ color: project.color }}>{project.name}</CardTitle>
        {project.web_url && (
          <CardDescription
            className="hover:underline cursor-pointer w-fit"
            onClick={(e) => {
              e.stopPropagation()
              window.open(project.web_url)
            }}
          >
            Gitlab
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Label> This Week</Label>
        <div className="flex items-center space-x-4 h-10">
          {/* Open Tickets */}
          <div className="flex items-center space-x-2">
            <MailOpen className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-primary/70">{thisWeekOpen}</p>
              {openChange.diff !== 0 ? (
                <div
                  className={`flex items-center text-xs ${openChange.diff > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {openChange.diff > 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(openChange.diff)} ({openChange.percentage}%)
                  </span>
                </div>
              ) : (
                <div className="text-xs">-</div>
              )}
            </div>
          </div>
          <Separator orientation="vertical" />
          {/* Closed Tickets */}
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{thisWeekClosed}</p>
              {closedChange.diff !== 0 ? (
                <div
                  className={`flex items-center text-xs ${closedChange.diff > 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {closedChange.diff > 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  <span>
                    {Math.abs(closedChange.diff)} ({closedChange.percentage}%)
                  </span>
                </div>
              ) : (
                <div className="text-xs">-</div>
              )}
            </div>
          </div>
        </div>
        {projectMilestons && projectMilestons.length > 0 && (
          <>
            <MilestoneChart selectedMilestone={selectedMilestone} />
          </>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

const MilestoneChart = ({ selectedMilestone }) => {
  const COLORS = {
    none: '#8f926d', // Neutral, unassigned or inactive tickets
    'to-do': '#F9D423', // Light yellow for tasks that need to be done, attention but not urgent
    doing: '#c4483b', // Soft red-orange for tasks in progress, a sense of urgency and activity
    review: '#3157ce', // Calm teal for review stage, clear and distinct
    done: '#81D8D0', // Safe green for completed tasks, a stable and reassuring color for done tasks
    testing: '#646d9b', // Bright red for testing tasks, draws attention for critical work needing validation
    backlog: '#FBC02D' // Warm amber for backlog tasks, not urgent but still needing attention
  }
  const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]
  const { shouldRefresh } = useProjects()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [aggregateTickets, setAggregateTickets] = useState({})

  useEffect(() => {
    if (!selectedMilestone && !shouldRefresh) return
    loadTickets()
  }, [selectedMilestone, shouldRefresh])

  const loadTickets = async () => {
    const data = await getIssuesFromMilestone(selectedMilestone.project_id, selectedMilestone.id)

    setTickets(data)
    // Group tickets by workflow label
    const ticketsByWorkflow = _.groupBy(data, (ticket) => {
      const label = ticket.labels.find((label) => label?.startsWith('workflow'))
      return label ? label : 'none'
    })

    const aggregateTicketsByWorkflow = Object.entries(ticketsByWorkflow)
      .map(([workflow, tickets]) => {
        return {
          name: workflow.split(' ').slice(-1)[0],
          value: tickets.length,
          stage: workflow.split(' ').slice(1)[0] || 0
        }
      })
      .sort((a, b) => {
        // sort by value
        return b.stage - a.stage
      })

    // aggregate tickets by state ["closed","opened"]

    const aggregateTicketsByState = Object.entries(
      _.groupBy(
        data.filter((ticket) => ticket.state !== 'closed'),
        (ticket) => ticket.assignee?.name
      )
    ).map(([state, tickets], idx) => {
      return {
        name: state,
        value: tickets.length,
        color: CHART_COLORS[idx % CHART_COLORS.length]
      }
    })

    setAggregateTickets({ workflow: aggregateTicketsByWorkflow, assignee: aggregateTicketsByState })
    setLoading(false)
  }

  const openedTickets = tickets.filter((ticket) => ticket.state === 'opened').length
  const closedTickets = tickets.filter((ticket) => ticket.state === 'closed').length

  return (
    <div className="min-h-80 mt-2 flex flex-col">
      <div className="text-sm flex justify-between items-center">
        <p
          className="hover:underline text-primary/80  cursor-pointer pt-1.5 pb-1 font-semibold"
          onClick={() =>
            window.open(
              selectedMilestone?.web_url.split('milestones')[0] +
                'issues/?milestone_title=' +
                selectedMilestone?.title.replace(' ', '%20')
            )
          }
        >
          Milestone: {selectedMilestone?.title}
        </p>
        <p>
          {openedTickets} / {tickets.length}{' '}
        </p>
      </div>
      <Progress className="w-full" value={(100 * closedTickets) / tickets.length} />
      <div className="flex justify-between text-sm">
        <p>Due: {daysFromToday(selectedMilestone?.due_date)}</p>
        <p>{((100 * closedTickets) / tickets.length).toFixed(2)} %</p>
      </div>
      <div className="h-72">
        {!loading ? (
          <ResponsiveContainer width="100%" height="90%">
            <PieChart width={400} height={400}>
              <Pie
                data={aggregateTickets.workflow}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
              >
                {aggregateTickets.workflow?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Pie
                data={aggregateTickets.assignee}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#82ca9d"
                label
              >
                {aggregateTickets.assignee?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Loader2 className="animate-spin mx-auto size-16 text-secondary h-40 flex-1" />
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {
          // turn the object into an array
          Object.entries(COLORS).map(([key, value]) => {
            return (
              <div className="flex gap-2 text-xs items-center" key={key}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: value }} />
                <p>{key}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
