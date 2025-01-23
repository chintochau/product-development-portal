import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { defaultSoftwareSteps } from '../../constant'
import { useSingleProduct } from '../../contexts/singleProductContext'
import ProcessStepper from './ProcessStepper'
import { Button } from '../../../../components/ui/button'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { cn } from '../../../../lib/utils'

const SoftwareStatusCard = ({ className }) => {
  const { software, softwareLoading } = useSingleProduct()
  return (
    <Card className={cn('flex flex-col ', className)}>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full">
          <div className=" h-52">
            {softwareLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ProcessStepper steps={software || defaultSoftwareSteps} software />
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default SoftwareStatusCard
