import React, { Fragment, useEffect, useState } from 'react'
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
import { cn } from '../../../../lib/utils'
import { Button } from '../../../../components/ui/button'
import { uploadPIFFile } from '../../services/gitlabServices'
import { useUser } from '../../contexts/userContext'
import PIFComponent from './PIFComponent'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'
const PIFCard = ({ className }) => {
  const { iid, pifs, postNote, setShouldReloadNotes } = useSingleProduct()
  const [file, setFile] = useState(null)
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const uploadFile = async () => {
    setLoading(true)
    const response = await uploadPIFFile(iid, file)
    if (response && response.markdown) {
      await postNote(
        {
          type: 'pif',
          author: user.name,
          fileName: response.alt,
          path: 'https://gitlab.com/' + response.full_path,
          fileId: response.id
        },
        response.markdown
      )
      setShouldReloadNotes(true)
      setLoading(false)
    } else {
      console.log('Error uploading file')
    }
  }

  const canUpload = () => {
    if (file && !loading) {
      return true
    }
    return false
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Card Header */}
      <CardHeader>
        <CardTitle>PIF Files</CardTitle>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="flex-1">
        <ScrollArea className="h-full">
          <div className="h-40">
            {!pifs || pifs.length === 0 ? (
              <Label>No PIF files found. Use the upload button below to add one.</Label>
            ) : (
              <>
                {pifs &&
                  pifs.map((item, index) => (
                    <Fragment key={item.id}>
                      <PIFComponent pif={item} />
                      {index !== pifs.length - 1 && <hr />}
                    </Fragment>
                  ))}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Card Footer */}
      <CardFooter>
        <div className="flex flex-col gap-1">
          <Label>Upload</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file:text-xs file:py-1 hover:bg-accent/50 cursor-pointer text-xs "
            />
            <Button onClick={uploadFile} disabled={!canUpload()}>
              Upload {loading && <Loader2 className="animate-spin" />}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PIFCard
