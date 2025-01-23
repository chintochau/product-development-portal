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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

import { Check, Cross, Edit, Loader2, ThumbsUp, Trash2, X } from 'lucide-react'
import { useTickets } from '../../contexts/ticketsContext'
import FeatureRow from './FeatureRow'

const AllFeatures = ({ features, className }) => {
  const navigate = useNavigate()
  const { totalPages, currentPage, getFeatureRequests, loading } = useTickets()

  const handlePageChange = (page) => {
    getFeatureRequests(page)
  }

  return (
    <div className={className}>
      {/* <DataTable columns={featureColumns} data={features} /> */}
      <Table>
        <TableHeader className=" bg-secondary/10 text-secondary-foreground">
          <TableRow>
            <TableHead className="w-96">Title</TableHead>
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
          {features && features.map((feature) => <FeatureRow feature={feature} key={feature.id} />)}
          {
            features.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No features found.
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>

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
    </div>
  )
}
export default AllFeatures
