import React, { useEffect, useState } from 'react'
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
import {
  Check,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Minus
} from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { getWrikeProjects } from '../../services/wrikeServices'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../../components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../../../../components/ui/collapsible'
import { cn, isInProgress } from '../../../../lib/utils'
import { Badge } from '@/components/ui/badge'
import { updateTicketDescription } from '../../services/gitlabServices'

const HardwareTask = ({ task, className, element }) => {
  const { wrikeWorkflows } = useSingleProduct()
  const [subTasks, setSubTasks] = useState()
  const [open, setOpen] = useState(false)

  const getSubTasks = async (subtaskIds) => {
    if (!subtaskIds || !subtaskIds.length) return
    const res = await window.api.wrike(`tasks/${subtaskIds.join(',')}`, 'GET')
    setSubTasks(
      res.data.sort((a, b) => {
        // sort by item.dates.start
        return new Date(a.dates.start) - new Date(b.dates.start)
      })
    )

    return res.data
  }
  const { subTaskIds } = task || {}

  useEffect(() => {
    if (!subTasks) {
      getSubTasks(subTaskIds)
    }
  }, [subTaskIds, subTasks])

  const inProgress = isInProgress(task.dates.start, task.dates.due)
  const isCompleted = task.status === 'Completed'
  const hasSubTasks = subTaskIds?.length > 0

  return (
    <Collapsible
      className={cn('my-2 pl-2', open ? 'border-l border-l-muted-foreground rounded-l-md' : '')}
      open={open}
      onOpenChange={() => {
        hasSubTasks && setOpen(!open)
      }}
    >
      <CollapsibleTrigger
        className={cn(
          'flex justify-between items-center w-full',
          isCompleted ? 'text-primary font-semibold' : '',
          hasSubTasks ? 'hover:underline' : 'cursor-default',
          inProgress ? 'text-blue-500' : ''
        )}
      >
        <div className="flex flex-col justify-start">
          <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle className="size-4 text-blue-500" /> : element}
            <p className="text-left">
              {task.title}
              {hasSubTasks && (
                <span className="text-muted-foreground text-sm">{` (${subTaskIds.length})`}</span>
              )}
            </p>
          </div>
        </div>
      </CollapsibleTrigger>
      <div className={cn('flex gap-2 ', inProgress ? 'text-blue-500' : 'text-muted-foreground ')}>
        {task.dates.start && <p className="text-xs">start: {task.dates.start.split('T')[0]}</p>}
        {task.dates.due && <p className="text-xs">due: {task.dates.due.split('T')[0]}</p>}
      </div>
      <CollapsibleContent className="pl-1">
        {subTasks?.length > 0 &&
          subTasks.map((item) => (
            <HardwareTask key={item.id} task={item} element={<Minus className="size-4" />} />
          ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

const HardwareStatusCard = ({ className }) => {
  const { hardware, setHardware, saveData, productData } = useSingleProduct()
  const [folders, setFolders] = useState()
  const [tasks, setTasks] = useState()

  const getProjects = async () => {
    const res = await getWrikeProjects()
    setFolders(res.data)
  }

  const getTasks = async (folderId) => {
    const res = await window.api.wrike(`folders/${folderId}/tasks?fields=[subTaskIds]`, 'GET')
    setTasks(res.data)
    return res.data
  }

  useEffect(() => {
    getProjects()
  }, [])

  useEffect(() => {
    if (hardware) {
      getTasks(hardware)
    }
    return () => {
      setTasks()
    }
  }, [hardware])

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <p>Hardware Status</p>
        </CardTitle>
        <CardDescription>
          *Info from Wrike
          <Select
            value={hardware}
            onValueChange={(folderId) => {
              updateTicketDescription(productData.iid, { ...productData, wrikeId: folderId })
              saveData({
                type: 'hardware',
                wrikeId: folderId
              })
              setHardware(folderId)
            }}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {folders?.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <div className="max-h-[50vh] pr-3">
            {tasks?.map((task) => (
              <HardwareTask key={task.id} task={task} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default HardwareStatusCard
