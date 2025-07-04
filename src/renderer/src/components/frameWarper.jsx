import React from 'react'
import { useSidebar } from '../../../components/ui/sidebar'
import { cn } from '../../../lib/utils'

const FrameWraper = ({ children }) => {
  const { open, isMobile } = useSidebar()
  return (
    <div
      className={cn(
        isMobile ? 'w-[100vw]' : open ? 'w-[calc(100vw-180px)]' : 'w-[calc(100vw-45px)]'
      )}
    >
      {children}
    </div>
  )
}

export default FrameWraper
