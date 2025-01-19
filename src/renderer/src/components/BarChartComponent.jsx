import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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

const BarChartComponent = ({ chartData }) => {
  console.log('chartData', chartData)

  const data = chartData
    .sort((a, b) => a.start - b.start)
    .map((item) => {
      return {
        name: item.name,
        period1: [item.start, item.end]
      }
    })
  const minDate =
    data.length > 0
      ? dayjs(data[0].period1[0]).subtract(14, 'day').valueOf()
      : dayjs().subtract(14, 'day').valueOf()
  const maxDate = dayjs().add(120, 'day').valueOf()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Features Planned</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ height: chartData.length * 50, width: '100%' }}
        >
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            layout="vertical"
          >
            <YAxis
              dataKey="name"
              type="category"
              interval={0}
              width={250}
            />
            <XAxis
              type="number"
              domain={[minDate, maxDate]}
              tickFormatter={(day) => dayjs(day).format('MM-YYYY')}
            />

            <ChartTooltip
              content={<ToolTipConpoment />}
              formatter={(_, __, item) =>
                `${dayjs(item.value[1]).format('MM-YYYY')} to ${dayjs(item.value[0]).format('MM-YYYY')}`
              }
            />

            <Bar dataKey="period1" fill="lightBlue" layout="vertical" radius={5} />
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

export default BarChartComponent
