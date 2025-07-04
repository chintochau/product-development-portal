import { File, Folder } from 'lucide-react'
import React, { Fragment, useEffect, useState } from 'react'
import { cn } from '../../../../lib/utils'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ScrollArea } from '../../../../components/ui/scroll-area'

const folderPaths = {
  root: '01LRHUTYYDO3KUBG3UTNH3XCVSB5RXLGBR',
  bls: '01LRHUTY5BBVGVH7CW2RALF4G4FPMK5FSX',
  bpr: '01LRHUTY5QFC5MUO67WJHYPFGNOF3XBVAO',
  nad: '01LRHUTY34DMLKF2MPFJAYAJVXC2XGGV4T',
  nadci: '01LRHUTY4EUTFNDSGTJFHJZ25CWCAGPVRT',
  psb: '01LRHUTY7ASPBZFRTZGBGI7PEI2KRWCEWF'
}

const PIFSelectorDropdown = ({ fileUrl, setFileUrl, setFileUrlName }) => {
  const [filesList, setFilesList] = React.useState([])
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: '01LRHUTYYDO3KUBG3UTNH3XCVSB5RXLGBR', name: 'PIF Folder' }
  ])
  const listFiles = async () => {
    const files = await window.api.graphGet(
      `/users/tvadgama@lenbrook.com/drive/items/${folderPaths.root}/children`
    )
    setFilesList(files?.value)
  }

  const loadFolder = async ({ folderId, folderName, index }) => {
    try {
      // Fetch files in the current folder

      const files = await window.api.graphGet(
        `/users/tvadgama@lenbrook.com/drive/items/${folderId}/children`
      )
      setFilesList(files?.value)

      if (index !== undefined) {
        setBreadcrumbs((prevBreadcrumbs) => {
          const newBreadcrumbs = [...prevBreadcrumbs]
          newBreadcrumbs.splice(index + 1)
          return newBreadcrumbs
        })
      } else {
        const newBreadcrumb = { id: folderId, name: folderName }
        setBreadcrumbs((prevBreadcrumbs) => [...prevBreadcrumbs, newBreadcrumb])
      }
    } catch (error) {
      console.error('Error loading folder:', error)
    }
  }

  useEffect(() => {
    listFiles()
  }, [])

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={item.id}>
              <BreadcrumbItem className="cursor-pointer">
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => loadFolder({ folderId: item.id, index: index })}>
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <ScrollArea>
        <div className="px-4 py-2 h-96">
          {filesList && filesList.length > 0 ? (
            filesList.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'group flex flex-col rounded-md transition-colors',
                  'hover:bg-accent/50 cursor-pointer',
                  'border border-transparent hover:border-secondary'
                )}
                onClick={() => {
                  file.folder && loadFolder({ folderId: file.id, folderName: file.name })
                  file.file && setFileUrl(file['@microsoft.graph.downloadUrl'])
                  file.file && setFileUrlName(file.name)
                }}
              >
                <div className="flex items-center gap-3 px-4 py-2">
                  {file.folder ? (
                    <Folder className="size-5 text-yellow-600" />
                  ) : (
                    <File className="size-5 text-green-600" />
                  )}
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col rounded-md border border-transparent hover:border-secondary">
              <div className="flex items-center gap-3 px-4 py-2">
                <p className="text-sm text-muted-foreground">No files found</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default PIFSelectorDropdown
