import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '../../../../components/ui/label'
import { Input } from '../../../../components/ui/input'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { getPIFFielsFromComments } from '../../services/gitlabServices'
import { cn } from '../../../../lib/utils'
import { Button } from '../../../../components/ui/button'
const PIFCard = ({ className }) => {
  const { iid, pifFilesSubmitted, setPifFilesSubmitted } = useSingleProduct()

  const loadPIFFiles = async () => {}

  const uploadPIFFile = async () => {}

  useEffect(() => {
    if (iid) {
    }

    return () => {}
  }, [iid])

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>PIF File</CardTitle>
      </CardHeader>
      <CardContent>
        {!pifFilesSubmitted ? <p>No PIF file submitted</p> : <></>}
        <Label>Upload</Label>
        <Input type="file" />
      </CardContent>
      <CardFooter>
        <Button onClick={uploadPIFFile}>Upload</Button>
      </CardFooter>
    </Card>
  )
}

export default PIFCard
