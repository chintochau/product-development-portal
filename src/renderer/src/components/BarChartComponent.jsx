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
  developer: {
    label: 'developer',
    color: 'hsl(var(--chart-1))'
  },
  feature: {
    label: 'feature',
    color: 'hsl(var(--chart-2))'
  },
  adhoc: {
    label: 'adhoc',
    color: 'hsl(var(--chart-3))'
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

const BarChartComponent = ({ chartData, developerChart }) => {
  let data = chartData
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

  if (developerChart) {
    data = chartData.flatMap((item) => {
      // Find the minimum start date across all features
      const developerStart = item.features.reduce((acc, feature) => {
        return Math.min(acc, feature.startDate ? feature.startDate : new Date())
      }, Infinity)

      //Fine the max end date across all features
      const developerEnd = item.features.reduce((acc, feature) => {
        if (feature.startDate && feature.estimate) {
          return Math.max(acc, dayjs(feature.startDate).add(feature.estimate, 'day').valueOf())
        }
        return acc
      }, dayjs().add(1, 'day').valueOf())

      const features = item.features.map((item) => {
        const endDate = item.startDate
          ? dayjs(item.startDate).add(item.estimate, 'day').valueOf()
          : dayjs().add(120, 'day').valueOf()

        return {
          name: item.title,
          period1: [item.startDate || dayjs().valueOf(), endDate],
          type: 'feature'
        }
      })

      const adhocFeatures = item.adhoc.map((item) => {
        const endDate = item.startDate
          ? dayjs(item.startDate).add(item.estimate, 'day').valueOf()
          : dayjs().add(120, 'day').valueOf()

        return {
          name: item.title,
          period1: [item.startDate || dayjs().valueOf(), endDate],
          type: 'adhoc'
        }
      })


      return [
        {
          name: item.developer?.name,
          period1: [developerStart, developerEnd],
          type: 'developer'
        },
        ...features,
        ...adhocFeatures
      ]
    })

    return (
      <ChartContainer
        config={chartConfig}
        style={{ height: chartData.length * 120, width: '100%' }}
      >
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          layout="vertical"
        >
          <YAxis dataKey="name" type="category" interval={0} width={250} />
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
          <Bar
            dataKey="period1"
            layout="vertical"
            radius={5}
            shape={(props) => {
              const { x, y, width, height, type, name } = props
              const padding = 5
              return type === 'developer' ? (
                <text
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  dy={25}
                  fill="hsl(var(--chart-1))"
                  fontWeight={'bold'}
                  fontSize={19}
                >
                  {name}
                </text>
              ) : (
                <rect
                  x={x}
                  y={y + padding}
                  width={width}
                  height={height - 2 * padding}
                  rx={10}
                  fill={type === 'feature' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}
                />
              )
            }}
          />
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
    )
  }

  return (
    <ChartContainer config={chartConfig} style={{ height: chartData.length * 50, width: '100%' }}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }} layout="vertical">
        <YAxis dataKey="name" type="category" interval={0} width={250} />
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
  )
}

export default BarChartComponent
