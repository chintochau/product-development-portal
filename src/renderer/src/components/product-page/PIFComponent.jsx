import { Download, File } from 'lucide-react'
import React from 'react'
import { timeAgo } from '../../../../lib/utils'
import { Separator } from '../../../../components/ui/separator'

const PIFComponent = ({ pif }) => {
  const { attributes, date } = pif || {}
  const { fileName, path, author } = attributes || {}

  const handleDownloadFile = async () => {
    window.open(path, '_blank')
  }
  return (
    <div className="w-full rounded-md flex flex-col ">
      <div className="flex justify-between items-center hover:bg-accent px-2 py-1">
        <div className="flex items-center">
          <File className="mr-2 size-4" />
          <div className="flex flex-col">
            <h3 className="text-sm text-muted-foreground">{fileName}</h3>
            <p className="text-xs  text-muted-foreground/60">
              {timeAgo(date)}, {author}
            </p>
          </div>
        </div>
        <Download
          className="mr-2 w-5 h-5 hover:text-blue-500 cursor-pointer"
          onClick={handleDownloadFile}
        />
      </div>
    </div>
  )
}

export default PIFComponent
