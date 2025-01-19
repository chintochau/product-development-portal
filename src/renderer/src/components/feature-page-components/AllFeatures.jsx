import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
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

import { Loader2, ThumbsUp, Trash2 } from 'lucide-react'
import { useDevelopers } from '../../contexts/developerContext'
import { useTickets } from '../../contexts/ticketsContext'
import { DeveloperDropdown } from '../DeveloperPage'
import { deleteFeatureRequestIssue, updateFeatureRequestIssue } from '../../services/gitlabServices'
import ProductDropdown from './ProductDropdown'
import EstimateSlider from './EstimateSlider'
import { DataTable } from '../home/data-table'
import { featureColumns } from './feature-columns'

const AllFeatures = ({ features }) => {
  const navigate = useNavigate()
  const { totalPages, currentPage, getFeatureRequests, loading } = useTickets()

  const handlePageChange = (page) => {
    getFeatureRequests(page)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <DataTable columns={featureColumns} data={features} /> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Developers</TableHead>
              <TableHead>Time Estimate</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Gitlab</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features &&
              features.map((feature) => <FeatureRow feature={feature} key={feature.id} />)}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {loading ? (
          <div className="w-full py-4 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
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
      </CardFooter>
    </Card>
  )
}

function FeatureRow({ feature }) {
  const { developers } = useDevelopers()
  const { setShouldRefresh, setLoading } = useTickets()
  const [showStatusBar, setShowStatusBar] = useState(false)
  const [selectedDevelopers, setSelectedDevelopers] = useState([])

  const isSelected = (id) => {
    return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
  }

  
  const updateAssignees = async () => {
    const response = await updateFeatureRequestIssue(id, {
      ...feature,
      assignee_ids: selectedDevelopers.map((dev) => dev.id)
    })
    setShouldRefresh(true)
  }

  const { assignee_ids, title, description, id } = feature || {}

  const [product, setProduct] = useState(feature?.product)

  const handleDeleteTicket = async () => {
    setLoading(true)
    const response = await deleteFeatureRequestIssue(id)
    setShouldRefresh(true)
  }

  const handleEstimateChange = async (value) => {
    setLoading(true)
    const response = await updateFeatureRequestIssue(id, {
      ...feature,
      estimate: value
    })
    setShouldRefresh(true)
  }

  const developersList = developers.filter((dev) =>
    assignee_ids?.find((assignee) => assignee === dev.id)
  )

  const handleDateChange = async (value) => {
    setLoading(true)
    const response = await updateFeatureRequestIssue(id, {
      ...feature,
      startDate: value
    })
    setShouldRefresh(true)
  }

  return (
    <TableRow
      onClick={async (e) => {
        e.stopPropagation()
      }}
    >
      <TableHead className="font-medium">{title}</TableHead>
      <TableCell className="font-medium">{description}</TableCell>
      <TableCell className="font-medium">
        <ProductDropdown product={product} setProduct={setProduct} />
      </TableCell>
      <TableCell className="font-medium">
        <DeveloperDropdown
          showStatusBar={showStatusBar}
          setShowStatusBar={setShowStatusBar}
          selectedDevelopers={developers.filter((dev) =>
            assignee_ids?.find((assignee) => assignee.id === dev.id)
          )}
          selectDeveloper={(id) => {
            if (isSelected(id)) {
              setSelectedDevelopers(selectedDevelopers.filter((dev) => dev.id !== id))
            } else {
              setSelectedDevelopers([
                ...selectedDevelopers,
                developers.find((dev) => dev.id === id)
              ])
            }
          }}
          isSelected={isSelected}
          onClick={() => {
            updateAssignees()
          }}
          loading={false}
        >
          <div className="cursor-pointer hover:underline flex-col flex">
            {assignee_ids && assignee_ids.length ? (
              developersList.map((dev) => 
                <p key={dev.id}>{dev.name}</p>
            )
            ) : (
              <p className="text-gray-500">Select</p>
            )}
          </div>
        </DeveloperDropdown>
      </TableCell>
      <TableCell className="font-medium">
        <EstimateSlider days={feature?.estimate} setDays={handleEstimateChange} startDate={feature?.startDate} setStartDate={handleDateChange} />
      </TableCell>
      <TableCell className="font-medium"></TableCell>
      <TableCell className="font-medium"></TableCell>

      <TableCell className="font-medium">
        <Trash2
          className="cursor-pointer size-4 duration-300 transition-all hover:text-red-500 text-muted-foreground"
          onClick={handleDeleteTicket}
        />
      </TableCell>
    </TableRow>
  )
}

export default AllFeatures
