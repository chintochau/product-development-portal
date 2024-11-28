import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'

const TicketSection = ({ tickets }) => {
  return (
    <Card className="flex-1 flex flex-col gap-2">
      <CardHeader>
        <CardTitle>Burndown Chart</CardTitle>
        <CardDescription>Remaining tickets from Gitlab</CardDescription>
      </CardHeader>

      <CardContent>
        {tickets &&
          tickets.map((ticket) => (
            <div key={ticket.iid} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: ticket.isBug ? '#ef4444' : '#3b82f6' }}
              ></div>
              <p>{ticket.iid}</p>
              <p>{ticket.title}</p>
              <p>{ticket.status}</p>
              <p>{ticket.link}</p>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

export default TicketSection
