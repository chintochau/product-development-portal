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
import BluOSFeatureRequest from './feature-page-components/BluOSFeatureRequest'
import BarChartComponent from './BarChartComponent'
// import { useRoadmap } from '../contexts/roadmapContext' // Removed during migration
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSidebar } from '../../../components/ui/sidebar'
import { cn } from '../../../lib/utils'
import FrameWraper from './frameWarper'

const FeaturesPage = () => {
  const { features } = useTickets()
  const { getFeatureEpics } = useSingleProduct()
  // const { featureChartData, featuersByDevelopers } = useRoadmap() // Removed during migration
  const featureChartData = [] // Temporary empty data
  const featuersByDevelopers = [] // Temporary empty data
  // get the open status of sidebar
  const { open, isMobile } = useSidebar()

  const chartData = getFeatureEpics()
    .filter((item) => dayjs(item.due_date).isAfter(dayjs()))
    .map((epic) => {
      return {
        projectName: epic.title,
        period2: [dayjs(epic.start_date).valueOf(), dayjs(epic.due_date).valueOf()]
      }
    })

  console.log(features)

  return (
    <FrameWraper>
      <div className="px-4 flex flex-col gap-6">
        <div className="flex items-center">
          <h2 className="text-2xl">Features</h2>
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

        <Tabs defaultValue="bluos">
          <TabsList>
            <TabsTrigger value="bluos">BluOS</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
          </TabsList>

          <TabsContent value="bluos">
            <BluOSFeatureRequest className="">
              <div className="flex flex-col gap-2 py-4">
                <Tabs defaultValue="features">
                  <TabsList>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="developers">Developers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="developers">
                    <BarChartComponent chartData={featuersByDevelopers} developerChart />
                  </TabsContent>
                  <TabsContent value="features">
                    <BarChartComponent chartData={featureChartData} />
                  </TabsContent>
                </Tabs>
                <AllFeatures features={features} />
              </div>
            </BluOSFeatureRequest>
          </TabsContent>

          <TabsContent value="apps">
            <AppFeatureChart chartData={chartData}>
              <Table>
                <TableHeader className="bg-secondary/20">
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
            </AppFeatureChart>
          </TabsContent>
        </Tabs>

        <div className=""></div>
      </div>
    </FrameWraper>
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

const AppFeatureChart = ({ chartData, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apps Planning</CardTitle>
        <CardDescription>Client Apps Planning</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ height: chartData.length * 40, width: '100%' }}
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
            layout="vertical"
          >
            <YAxis dataKey="projectName" type="category" width={300} />
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

        {children}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  )
}
