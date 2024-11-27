import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { defaultHardwareSteps } from '../../constant'
import { useSingleProduct } from '../../contexts/singleProductContext'
import ProcessStepper from './ProcessStepper'
import { Button } from '../../../../components/ui/button'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'

const HardwareStatusCard = () => {
  const {
    hardware,
    postNote,
    setShouldReloadNotes,
    hardwareId,
    updateNote,
    setHardwareLoading,
    hardwareLoading
  } = useSingleProduct()
  const saveData = async (hardware) => {
    if (hardwareId) {
      const res = await updateNote(hardwareId, {
        type: 'hardware',
        author: 'admin',
        hardware: hardware
      })
    } else {
      setHardwareLoading(true)
      const res = await postNote({
        type: 'hardware',
        author: 'admin',
        hardware: hardware
      })
      setShouldReloadNotes(true)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Hardware Status</CardTitle>
        <CardDescription>*Updated by hardware team</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <div className='max-h-96 pr-3'>
            {hardwareLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ProcessStepper steps={hardware || defaultHardwareSteps} saveData={saveData} hardware />
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default HardwareStatusCard
