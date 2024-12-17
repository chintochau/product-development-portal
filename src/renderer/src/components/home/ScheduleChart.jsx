import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useProducts } from '../../contexts/productsContext'
dayjs.extend(isBetween)

import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Tooltip } from '../../../../components/ui/tooltip'
import { Calendar } from '../../../../components/ui/calendar'

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
        products
          .map((product) => {
            const { launch, created_at, projectName, mp1Date } = product || {}
            return {
              projectName: projectName || 'Unnamed Project',
              period1: [
                // created date to mp1
                Math.min(dayjs(created_at).valueOf(), dayjs().subtract(14, 'day').valueOf()),
                dayjs(mp1Date).valueOf()
              ],
              period2: [
                // mp1 to launch
                Math.max(dayjs(mp1Date).valueOf(), dayjs().subtract(14, 'day').valueOf()),
                launch === mp1Date
                  ? dayjs(mp1Date).add(1, 'day').valueOf()
                  : dayjs(launch).valueOf()
              ],
              startDate: dayjs(mp1Date).valueOf(),
              adjustedStartDate: Math.max(
                dayjs(mp1Date).valueOf(),
                dayjs().subtract(14, 'day').valueOf()
              ),
              endDate: dayjs(launch).valueOf(),
              created_at: dayjs(created_at).valueOf(),
              start: mp1Date,
              end: launch,
              created: created_at
            }
          })
          .sort((a, b) => {
            return new Date(a.start) - new Date(b.start)
          })
      )
    }
  }, [products])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>From MP1 to Launch Dates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            width={730}
            height={250}
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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

export default ScheduleChart
