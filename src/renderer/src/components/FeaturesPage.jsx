import React from 'react'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Loader2, ThumbsUp } from 'lucide-react'
import { toInteger } from 'lodash'

const FeaturesPage = () => {
  const { setSelectedTicket, features } = useTickets()
  const { getFeatureEpics } = useSingleProduct()

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
      {renderUpvoteTable(features)}
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
  const { totalPages, currentPage, getFeatureRequests, loading } = useTickets()

  const handlePageChange = (page) => {
    getFeatureRequests(page)
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center">
          <h2 className="text-2xl">All Requests</h2>
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={() => navigate('/features/new')}
          >
            Create
          </Button>
        </div>
        <CardDescription>Data from Gitlab</CardDescription>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className=" w-52">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead></TableHead>
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
              <TableHead className="font-medium">{ticket.references?.relative}</TableHead>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="font-medium">
                <ThumbsUp
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="w-4 h-4 hover:cursor-pointer text-muted-foreground hover:text-foreground"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading ? (
        <div className='w-full py-4 flex items-center justify-center'><Loader2 className='animate-spin' /></div>
      ) : (
        <Pagination>
          <PaginationContent>
            {currentPage !== 1 && (
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>
            )}
            {currentPage !== 1 && (
              <PaginationItem key={1}>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => {
                    handlePageChange(1)
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {totalPages > 5 ? (
              <>
                {Array.from(
                  { length: Math.min(3, totalPages - currentPage) },
                  (_, index) => currentPage + index
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => {
                        handlePageChange(page)
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem key={totalPages}>
                  <PaginationLink
                    className="cursor-pointer"
                    onClick={() => {
                      handlePageChange(totalPages)
                    }}
                    isActive={totalPages === currentPage}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => {
                      handlePageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => {
                    handlePageChange(currentPage + 1)
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
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
