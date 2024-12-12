import React from 'react'
import { useSingleProduct } from '../../contexts/singleProductContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { cn } from '../../../../lib/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const fields = [
  'id',
  'title',
  'description',
  'type', // must have, nice to have
  'time required',
  'gitlab',
  'done'
]

const FeaturesStatusCard = ({ className }) => {
  const { features, featuresLoading, featuresId } = useSingleProduct()
  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>Features Status</CardTitle>
        <CardDescription>
          Features required for the product to be considered complete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field}>{field}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </CardContent>
    </Card>
  )
}

export default FeaturesStatusCard
