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

const SoftwareStatusCard = () => {
  const {
    software,
    postNote,
    setShouldReloadNotes,
    softwareId,
    updateNote,
    setSoftwareLoading,
    softwareLoading
  } = useSingleProduct()
  const saveData = async (software) => {
    if (softwareId) {
      const res = await updateNote(softwareId, {
        type: 'software',
        author: 'admin',
        software: software
      })
    } else {
      setSoftwareLoading(true)
      const res = await postNote({
        type: 'software',
        author: 'admin',
        software: software
      })
      setShouldReloadNotes(true)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Software Status</CardTitle>
        <CardDescription>*Updated by software team</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <div className="max-h-[50vh] pr-3">
            {softwareLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ProcessStepper
                steps={software || defaultSoftwareSteps}
                saveData={saveData}
                software
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default SoftwareStatusCard
