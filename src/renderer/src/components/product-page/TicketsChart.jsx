import React from 'react'

import { TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb'
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa'
  }
}

import _ from 'lodash'

const TicketsChart = ({ tickets, softwareSignoffDate, className }) => {
  // Step 1: Generate a range of dates
  // Step 1: Aggregate Tickets by Date

  // find the start date and end date from tickets
  const startDate = softwareSignoffDate || _.minBy(tickets, 'created_at')?.created_at
  const endDate = new Date()

  //   const startDate = '2024-11-01' // Example start date
  //   const endDate = '2024-11-25' // Example end date

  const dateRange = []
  let currentDate = new Date(startDate)
  while (currentDate <= new Date(endDate)) {
    dateRange.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Step 2: Aggregate data
  const burndownData = dateRange.map((date) => {
    const openTickets = tickets.filter((ticket) => {
      const createdAt = new Date(ticket.created_at)
      const closedAt = ticket.closed_at ? new Date(ticket.closed_at) : null
      return createdAt <= new Date(date) && (!closedAt || closedAt > new Date(date))
    })
    const openBugs = openTickets.filter((ticket) => ticket.isBug)
    const openFeatures = openTickets.filter((ticket) => ticket.isFeature)
    return {
      date,
      openTickets: openTickets.length,
      bugs: openBugs.length,
      features: openFeatures.length
    }
  })


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Burndown Chart</CardTitle>
        <CardDescription>Remaining tickets from Gitlab</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-1/2">
          <AreaChart
            accessibilityLayer
            data={burndownData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="bugs"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="features"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TicketsChart
