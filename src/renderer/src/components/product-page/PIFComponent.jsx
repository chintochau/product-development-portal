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
    <div className="w-full rounded-md flex flex-col hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-center px-2 py-1.5 gap-2">
        {/* File Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0 w-64">
          <Download
            className="size-5 text-muted-foreground hover:text-blue-500 cursor-pointer transition-colors shrink-0"
            onClick={handleDownloadFile}
          />
          <div className="flex flex-col flex-1 min-w-0 ">
            <h3 className="text-sm font-medium text-foreground truncate w-full">{fileName}</h3>
            <p className="text-xs text-muted-foreground/80">
              {timeAgo(date)} • {author}
            </p>
          </div>
        </div>

        {/* Download Button */}
      </div>
    </div>
  )
}

export default PIFComponent
