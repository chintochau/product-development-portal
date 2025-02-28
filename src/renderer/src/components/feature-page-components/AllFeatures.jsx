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

import { ArrowUpDown, Check, Cross, Edit, Loader2, ThumbsUp, Trash2, X } from 'lucide-react'
import { useTickets } from '../../contexts/ticketsContext'
import FeatureRow from './FeatureRow'
import { DataTable } from '../home/data-table'
import { featureColumns } from './feature-columns'

const AllFeatures = ({ features, className }) => {
  const navigate = useNavigate()
  const { totalPages, currentPage, getFeatureRequests, loading } = useTickets()

  const handlePageChange = (page) => {
    getFeatureRequests(page)
  }

  return (
    <div className={className}>
      {/* <DataTable columns={featureColumns} data={features} /> */}
      <Table frameClassName="min-h-[calc(100vh-600px)]" >
        <TableHeader className=" bg-secondary/10 text-secondary-foreground">
          <TableRow>
            <TableHead className="w-60 flex items-center gap-2"><p>Title</p> {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}</TableHead>
            <TableHead>
              <Button variant="ghost" className="flex items-center">
                <p>Product</p> <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Developers</TableHead>
            <TableHead><Button variant="ghost" className="flex items-center">
                <p>Time Estimate</p> <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              </TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Gitlab</TableHead>
            <TableHead>Change Req.</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {features &&
            features.map((feature, index) => (
              <FeatureRow feature={feature} key={feature.id} index={index} />
            ))}
          {features.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No features found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
export default AllFeatures
