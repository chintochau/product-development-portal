import React, { Fragment, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Label } from '../../../../components/ui/label'
import { Input } from '../../../../components/ui/input'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { cn } from '../../../../lib/utils'
import { Button } from '../../../../components/ui/button'
import { uploadPIFFile } from '../../services/gitlabServices'
import { useUser } from '../../contexts/userContext'
import PIFComponent from './PIFComponent'
import { Loader2, UploadCloud, FolderPlus, X } from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import PIFSelectorDropdown from './PIFSelectorDropdown'

const PIFCard = ({ className }) => {
  const { iid, pifs, postNote, setShouldReloadNotes } = useSingleProduct()
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [fileUrlName, setFileUrlName] = useState(null)
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const uploadFile = async () => {
    setLoading(true)
    const response = await uploadPIFFile(iid, file, fileUrl)
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
      setFile(null)
      setFileUrl(null)
    } else {
      console.log('Error uploading file')
    }
  }

  const canUpload = () => {
    if (loading) return false
    if (file || fileUrl) return true
    return false
  }

  return (
    <Card className={cn('flex flex-col h-96', className)}>
      {/* Card Header */}
      <CardHeader>
        <CardTitle>PIF Files</CardTitle>
      </CardHeader>

      {/* Card Content - Occupies remaining space */}
      <CardContent className="flex-1 p-2 overflow-hidden">
        <ScrollArea className="h-full">
          {!pifs || pifs.length === 0 ? (
            <div className="text-muted-foreground text-sm italic px-2">
              No PIF files available. Upload one below.
            </div>
          ) : (
            <div className="space-y-3">
              {pifs.map((item, index) => (
                <Fragment key={item.id}>
                  <PIFComponent pif={item} />
                  {index !== pifs.length - 1 && <hr className="my-2" />}
                </Fragment>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Card Footer - Dynamic height based on content */}
      <CardFooter className="flex flex-col gap-3 pt-4">
        {!file && !fileUrl && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col gap-2 w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2 text-xs h-8" disabled={loading}>
                    <FolderPlus className="h-4 w-4" />
                    Choose Existing
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Select from ShareDrive</DialogTitle>
                  </DialogHeader>
                  <PIFSelectorDropdown setFileUrl={setFileUrl} setFileUrlName={setFileUrlName} />
                </DialogContent>
              </Dialog>
              <Label className="flex-1 cursor-pointer">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  disabled={loading}
                />
                <Button variant="outline" asChild className="w-full gap-2 text-xs h-8">
                  <div>
                    <UploadCloud className="h-4 w-4" />
                    Upload New
                  </div>
                </Button>
              </Label>
            </div>
          </div>
        )}

        {/* File Selection Feedback */}
        {(file || fileUrl) && (
          <Label className="flex flex-col gap-2 w-full">
            <div className="text-xs">Selected File</div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={file ? file.name : fileUrlName}
                onChange={(e) => setFileUrlName(e.target.value)}
                readOnly // Prevent manual editing of the file name
              />
              <X
                className="h-4 w-4 cursor-pointer hover:text-red-500"
                onClick={() => {
                  setFile(null)
                  setFileUrl(null)
                }}
              />
            </div>
          </Label>
        )}

        {/* Upload Button */}
        <Button onClick={uploadFile} disabled={!canUpload()} className="w-full gap-2" size="sm">
          {loading ? (
            <>
              Uploading...
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            'Confirm Upload'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PIFCard
