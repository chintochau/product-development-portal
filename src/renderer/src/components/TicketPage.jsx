import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table'
import FrameWraper from './frameWarper'
import { Button } from '../../../components/ui/button'
import { getGroupIssuesWithQuery } from '../services/gitlabServices'
import { Input } from '../../../components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { useTickets } from '../contexts/ticketsContext'
import { Checkbox } from '../../../components/ui/checkbox'
import { Badge } from '../../../components/ui/badge'

const TicketPage = () => {
  const { tickets, setTickets } = useTickets()
  const [searchText, setSearchText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [openOnly, setOpenOnly] = React.useState(true)

  const getTickets = async () => {
    setLoading(true)
    const query = {
      search: searchText
    }
    if (openOnly) {
      query.state = 'opened'
    }
    const response = await getGroupIssuesWithQuery(query)
    setLoading(false)
    setTickets(response)
  }
  return (
    <FrameWraper>
      <div className="flex flex-col">
        <div className="px-4 sticky top-0 flex flex-col bg-background z-50 pb-4 border-b">
          <h1 className="text-2xl">Tickets</h1>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              getTickets()
            }}
          >
            <div className="flex gap-2">
              <Input
                placeholder="Search"
                type="search"
                className=" border-secondary border-2"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button onClick={() => getTickets()} variant="outline" size="icon">
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Checkbox id="openOnly" checked={openOnly} onCheckedChange={(e) => setOpenOnly(e)} />
              <label htmlFor="openOnly" className="text-sm text-muted-foreground">
                Open Tickets Only
              </label>
            </div>
          </form>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">id</TableHead>
                <TableHead>title</TableHead>
                <TableHead>Gitlab</TableHead>
                <TableHead>Epic</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4}>Searching for "{searchText}"...</TableCell>
                </TableRow>
              )}
              {tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </FrameWraper>
  )
}
export const StatusComponent = ({ ticket }) => {
  let isTesting, isBug, isFeature, isDoing, isReview

  ticket.labels?.forEach((label) => {
    if (label.includes('type::bug')) isBug = { label: 'Bug', color: 'bg-gray-100 text-gray-800' }
    if (label.includes('type::feature'))
      isFeature = { label: 'Feature', color: 'bg-gray-100 text-gray-800' }
    if (label.includes('workflow:: 2 doing'))
      isDoing = { label: 'Doing', color: 'bg-blue-500 text-blue-50' }
    if (label.includes('workflow:: 3 review'))
      isReview = { label: 'Review', color: 'bg-orange-500 text-orange-50' }
    if (label.includes('workflow:: 4 testing'))
      isReview = { label: 'Testing', color: 'bg-purple-500 text-purple-50' }
  })

  const ticketStatus =
    ticket.state === 'opened'
      ? { label: 'Open', color: 'bg-green-500 text-green-50' }
      : { label: 'Closed', color: 'bg-gray-500 text-gray-50' }

  const labelsArray = [ticketStatus, isTesting, isDoing, isReview, isBug, isFeature]

  return (
    <>
      {labelsArray
        .filter((labelObj) => labelObj) // Filter out undefined/null values
        .map((labelObj, index) => (
          <Badge
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded-full ${labelObj.color}`}
          >
            {labelObj.label}
          </Badge>
        ))}
    </>
  )
}
export default TicketPage

const TicketRow = ({ ticket }) => {
  return (
    <TableRow key={ticket.id}>
      <TableCell>{ticket.references?.relative || ticket.iid}</TableCell>
      <TableCell
        className="hover:underline cursor-pointer"
        onClick={() => window.open(ticket.web_url)}
      >
        {ticket.title}
      </TableCell>
      <TableCell>{ticket.assignee?.name}</TableCell>
      <TableCell>
        <p
          className=" cursor-pointer hover:underline"
          onClick={() => window.open(ticket.epic?.url)}
        >
          {ticket.epic?.title}
        </p>
      </TableCell>
      <TableCell>
        <p
          className=" cursor-pointer hover:underline"
          onClick={() => window.open(ticket.milestone?.web_url)}
        >
          {ticket.milestone?.title}
        </p>
      </TableCell>
      <TableCell>
        <StatusComponent ticket={ticket} />
      </TableCell>
    </TableRow>
  )
}
