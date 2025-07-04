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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Textarea } from '../../../../components/ui/textarea'

const fields = [
  'id',
  'title',
  'description',
  'type', // must have, nice to have
  'time required',
  'gitlab',
  'done'
]

const types = ['must have', 'nice to have']

const FeaturesStatusCard = ({ className }) => {
  const { features, featuresLoading, featuresId } = useSingleProduct()

  const addFeature = (e) => {
    e.preventDefault()
  }
  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>Features required for the product to launch</CardDescription>
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
          <TableBody>
            {features &&
              features.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{invoice.paymentStatus}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <form onSubmit={addFeature} id={featuresId} className="flex w-full flex-col gap-2 pt-4">
          <Input placeholder="Title" className="w-full" />
          <Textarea placeholder="Description" className="w-full" />
          <div>
            <Button variant="outline">Create</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default FeaturesStatusCard
