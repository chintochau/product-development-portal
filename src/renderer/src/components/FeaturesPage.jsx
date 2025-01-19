import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import AllFeatures from './feature-page-components/AllFeatures'
import NewFeatureRequest from './feature-page-components/NewFeatureRequest'
import BarChartComponent from './BarChartComponent'
import { useRoadmap } from '../contexts/roadmapConetxt'
 
const FeaturesPage = () => {
  const {  features } = useTickets()
  const { getFeatureEpics } = useSingleProduct()
  const {featureChartData} = useRoadmap()

  const chartData = getFeatureEpics()
    .filter((item) => dayjs(item.due_date).isAfter(dayjs()))
    .map((epic) => {
      return {
        projectName: epic.title,
        period2: [dayjs(epic.start_date).valueOf(), dayjs(epic.due_date).valueOf()]
      }
    })

  return (
    <div className="px-4 flex flex-col gap-6 pb-4">
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
      <NewFeatureRequest/>
      <BarChartComponent chartData={featureChartData}/>
      <AllFeatures features={features}/>
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
