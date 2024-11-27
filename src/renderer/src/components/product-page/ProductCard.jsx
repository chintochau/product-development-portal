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

const contentClassName = 'font-semibold text-sm'

const ProductCard = ({className}) => {
  const {
    brand,
    projectName,
    description,
    model,
    massProduct1,
    launch,
    status,
    greenlightDate,
    greenlightTargetMP
  } = productInformation
  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>*Info from Master Roadmap Excel sheet</CardDescription>
      </CardHeader>
      <CardContent >
        <ScrollArea>
          <div className='max-h-72'>
            <Label>Brand</Label>
            <p className={contentClassName}>{brand}</p>
            <Label>Project Name</Label>
            <p className={contentClassName}>{projectName}</p>
            <Label>Description</Label>
            <p className={contentClassName}>{description}</p>
            {model && (
              <>
                <Label>Model</Label>
                <p className={contentClassName}>{model}</p>
              </>
            )}
            <Label>Mass Production 1</Label>
            <p className={contentClassName}>{massProduct1}</p>
            <Label>Launch</Label>
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
    </Card>
  )
}

export default ProductCard
