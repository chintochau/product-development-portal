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

const TicketPage = () => {
  const { tickets, setTickets } = useTickets()
  const [searchText, setSearchText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [searchArray, setSearchArray] = React.useState([])
  const [openOnly, setOpenOnly] = React.useState(true)

  const getTickets = async () => {
    setLoading(true)
    const response = await getGroupIssuesWithQuery({
      text: searchText,
      state: openOnly ? 'opened' : 'closed'
    })
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
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.references?.relative}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell
                    className="hover:underline cursor-pointer"
                    onClick={() => window.open(ticket.web_url)}
                  >
                    Link
                  </TableCell>
                  <TableCell>
                    <StatusComponent status={ticket.state} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </FrameWraper>
  )
}

const StatusComponent = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        status === 'closed' ? 'bg-green-400 text-white' : 'bg-blue-400 text-white'
      }`}
    >
      {status}
    </span>
  )
}

export default TicketPage
