import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useProducts } from '../../contexts/productsContext'
dayjs.extend(isBetween)

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

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
const ScheduleChart = () => {
  const { products } = useProducts()

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (products && products.length > 0) {
      setChartData(
        products.map((product) => {
          const { launchDate, created_at, projectName, mp1Date } = product || {}
          return {
            projectName: projectName || 'Unnamed Project',
            startDate: dayjs(mp1Date).valueOf(),
            endDate: dayjs(launchDate).valueOf(),
            created_at: dayjs(created_at).valueOf(),
            start: mp1Date,
            end: launchDate,
            created: created_at
          }
        })
      )
    }
  }, [products])

  console.log(chartData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Start Day and Launch Day</CardTitle>
        <CardDescription>Showing MP1 and Launch Dates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 50,
              right: 50
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="projectName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              yAxisId="y2"
            />
            <YAxis
              yAxisId="y1"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />

            <XAxis
              type="number"
              domain={[dayjs().subtract(14, 'day').valueOf(), 'dataMax']}
              tickFormatter={(value) => dayjs(value).format('MMM YYYY')}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
              formatter={(value) => dayjs(value).format('D MMM YYYY')}
            />

            <Bar dataKey="endDate" yAxisId="y2" layout="vertical" fill="red" radius={4} />
            <Bar dataKey="startDate" yAxisId="y1" layout="vertical" fill="hsl(var(--background))" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}

export default ScheduleChart
