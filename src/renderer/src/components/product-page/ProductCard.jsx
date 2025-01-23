import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '../../../../components/ui/label'
import { productInformation } from '../../constant'
import { cn } from '../../../../lib/utils'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { useSingleProduct } from '../../contexts/singleProductContext'

const contentClassName = 'font-semibold text-sm'

const ProductCard = ({ className }) => {
  const { productData } = useSingleProduct()
  const {
    brand,
    projectName,
    description,
    model,
    mp1Date,
    launch,
    status,
    greenlightDate,
    greenlightTargetMP
  } = productData || {}
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full">
          <div className="h-40">
            <Label>Brand</Label>
            <p className={contentClassName}>{brand}</p>
            <Label>Project Name</Label>
            <p className={contentClassName}>{projectName}</p>
            <Label>Description</Label>
            <p className={contentClassName}>{description}</p>

            <Label>Model</Label>
            <p className={contentClassName}>{model}</p>

            <Label>Mass Production 1</Label>
            <p className={contentClassName}>{mp1Date}</p>
            <Label>Launch Date</Label>
            <p className={contentClassName}>{launch}</p>
            <Label>Status</Label>
            <p className={contentClassName}>{status}</p>
            <Label>Greenlight Date</Label>
            <p className={contentClassName}>{greenlightDate}</p>
            <Label>Greenlight Target MP</Label>
            <p className={contentClassName}>{greenlightTargetMP}</p>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default ProductCard
