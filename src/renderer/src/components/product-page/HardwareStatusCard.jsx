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

const HardwareStatusCard = () => {
  const { hardware, postNote, setShouldReloadNotes } = useSingleProduct()
  const saveData = async () => {
    const res = await postNote({
      type: 'hardware',
      author: 'admin',
      hardware: hardware || defaultHardwareSteps
    })
    setShouldReloadNotes(true)
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <Button onClick={saveData}>Initial Hardware Data</Button>
        <CardTitle>Hardware Status</CardTitle>
        <CardDescription>*Updated by hardware team</CardDescription>
      </CardHeader>
      <CardContent className="max-h-96 overflow-auto">
        <ProcessStepper steps={hardware || defaultHardwareSteps} />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default HardwareStatusCard
