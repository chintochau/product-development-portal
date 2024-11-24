import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect } from 'react'

const SOVI_ID = 17062603

const HomePage = () => {

  const [epics, setEpics] = React.useState([])

  const loadTickets = async () => {
    const data = await window.api.getGitlab("/groups/17062603/epics?state=opened&page=1&per_page=100");
    console.log(data);

    setEpics(data)

  }

  useEffect(() => {
    loadTickets()
  }, [])

  return (
    <>
      <h1 className='text-2xl'>Dashboard</h1>
      <Select >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Select Epic" />
        </SelectTrigger>
        <SelectContent>
          {epics.map((epic) => (
            <SelectItem key={epic.id} value={epic.id}>
              {epic.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export default HomePage