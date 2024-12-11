import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table'
import { Button } from '../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../contexts/ticketsContext'

const FeaturesPage = () => {
  const navigate = useNavigate()
  const { setSelectedTicket, features } = useTickets()
  // a table showing features requests

  const selectTicket = (ticket) => {
    const { iid } = ticket
    setSelectedTicket(ticket)
    navigate(`/features/${iid}`)
  }

  return (
    <div>
      <div className="flex px-4 items-center">
        <h1 className="text-2xl">Features</h1>
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          onClick={() => navigate('/features/new')}
        >
          Create
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Requestor</TableHead>
            <TableHead className="w-40"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((ticket) => (
            <TableRow
              key={ticket.iid}
              onClick={() => {
                selectTicket(ticket)
              }}
            >
              <TableCell className="font-medium">{ticket.iid}</TableCell>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="font-medium">{ticket.requestor}</TableCell>
              <TableCell
                className="font-medium hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(ticket.reference)
                }}
              >
                Open in GitLab
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default FeaturesPage
