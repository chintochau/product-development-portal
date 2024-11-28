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
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { getWrikeProjects } from '../../services/wrikeServices'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../../components/ui/select'

const HardwareTask = ({ task, className }) => {
  const [subTasks, setSubTasks] = useState()
  const getSubTasks = async (subtaskIds) => {
    if (!subtaskIds || !subtaskIds.length) return
    const res = await window.api.wrike(`tasks/${subtaskIds.join(',')}`, 'GET')
    console.log('sub tasks; ', res.data)
    setSubTasks(res.data)
    return res.data
  }
  const { subTaskIds } = task || {}
  return (
    <div className="pl-4 flex flex-col" onClick={() => getSubTasks(subTaskIds)}>
      <div className="cursor-pointer hover:bg-accent px-2 py-1">
        {`${task.title}  (${subTaskIds?.length})`}
      </div>
      {subTasks?.length > 0 && subTasks.map((item) => <HardwareTask key={item.id} task={item} />)}
    </div>
  )
}

const HardwareStatusCard = () => {
  const {
    hardware,
    postNote,
    setShouldReloadNotes,
    hardwareId,
    updateNote,
    setHardwareLoading,
    hardwareLoading
  } = useSingleProduct()

  const [folders, setFolders] = useState()
  const [selectedFolderId, setSelectedFolderId] = useState()
  const [tasks, setTasks] = useState()

  const saveData = async (hardware) => {
    if (hardwareId) {
      const res = await updateNote(hardwareId, {
        type: 'hardware',
        author: 'admin',
        hardware: hardware
      })
    } else {
      setHardwareLoading(true)
      const res = await postNote({
        type: 'hardware',
        author: 'admin',
        hardware: hardware
      })
      setShouldReloadNotes(true)
    }
  }

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
    if (selectedFolderId) {
      getTasks(selectedFolderId)
    }
  }, [selectedFolderId])

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <p>Hardware Status</p>
          <Button variant="link">Refresh</Button>
        </CardTitle>
        {selectedFolderId}
        <CardDescription>
          <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
            <SelectTrigger>
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
