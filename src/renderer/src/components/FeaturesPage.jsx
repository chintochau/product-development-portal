import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table'
import { Button } from '../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../contexts/ticketsContext'
import { useSingleProduct } from '../contexts/singleProductContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '../../../components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ReferenceLine } from 'recharts'
import dayjs from 'dayjs'
import { cn } from '../../../lib/utils'
const chartConfig = {
  mp1Date: {
    label: 'mp1Date',
    color: 'hsl(var(--chart-1))'
  },
  launchDate: {
    label: 'launchDate',
    color: 'hsl(var(--chart-2))'
  },
  createdAt: {
    label: 'today',
    color: 'hsl(var(--background))'
  }
}
const FeaturesPage = () => {
  const navigate = useNavigate()
  const { setSelectedTicket, features } = useTickets()
  const { getFeatureEpics } = useSingleProduct()
  // a table showing features requests

  const selectTicket = (ticket) => {
    const { iid } = ticket
    setSelectedTicket(ticket)
    navigate(`/features/${iid}`)
  }

  const chartData = getFeatureEpics()
    .filter((item) => dayjs(item.due_date).isAfter(dayjs()))
    .map((epic) => {
      return {
        projectName: epic.title,
        period2: [dayjs(epic.start_date).valueOf(), dayjs(epic.due_date).valueOf()]
      }
    })
  return (
    <div className="px-4 flex flex-col gap-4">
      {renderUpvoteTable(features)}
      <div className="flex items-center">
        <h2 className="text-2xl">Planned Features</h2>
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            window.open(
              'https://gitlab.com/groups/lenbrook/sovi/-/epics?state=opened&page=1&sort=start_date_desc'
            )
          }}
        >
          Gitlab
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFeatureEpics().map((ticket) => (
            <TableRow
              key={ticket.iid}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                window.open(ticket.web_url)
              }}
            >
              <TableCell className="font-medium">{ticket.references?.short}</TableCell>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="font-medium">{ticket.start_date}</TableCell>
              <TableCell className="font-medium">{ticket.due_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {renderChart(chartData)}
    </div>
  )
}

const ToolTipConpoment = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className=" bg-background px-3 py-2 rounded-md border border-border">
        <p className="intro">{label}</p>
      </div>
    )
  }

  return null
}

export default FeaturesPage
function renderUpvoteTable(features) {
  const navigate = useNavigate()
  console.log(features[0]);
  
  return (
    <>
      <div className="flex items-center">
        <h2 className="text-2xl">Upvote Requests</h2>
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => navigate('/features/new')}
        >
          Create
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Upvote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((ticket) => (
            <TableRow
              key={ticket.iid}
              onClick={(e) => {
                e.stopPropagation()
                window.open(ticket.web_url)
              }}
            >
              <TableCell className="font-medium">{ticket.iid}</TableCell>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="font-medium">{ticket.upvotes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

function renderChart(chartData) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Features Planned</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ height: chartData.length * 80, width: '100%' }}
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
            layout="vertical"
          >
            <YAxis dataKey="projectName" type="category" />
            <XAxis
              type="number"
              domain={[dayjs().subtract(14, 'day').valueOf(), dayjs().add(14, 'day').valueOf()]}
              tickFormatter={(day) => dayjs(day).format('MM-YYYY')}
            />

            <ChartTooltip
              content={<ToolTipConpoment />}
              formatter={(_, __, item) =>
                `${dayjs(item.value[1]).format('MM-YYYY')} to ${dayjs(item.value[0]).format('MM-YYYY')}`
              }
            />

            <Bar dataKey="period2" fill="lightBlue" layout="vertical" radius={5} />
            <ReferenceLine
              x={dayjs().valueOf()} // Today's timestamp
              stroke="hsl(var(--primary))" // Line color
              strokeDasharray="3 3" // Optional: dashed line style
              label={{
                value: `Today: ${dayjs().format('D-MM-YYYY')}`,
                position: 'top',
                fill: 'hsl(var(--primary))',
                fontSize: 12
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  )
}
