import React, { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card'
import { cn } from '../../../../lib/utils'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { Button } from '../../../../components/ui/button'
import { useSingleProduct } from '../../contexts/singleProductContext'

const TicketSection = ({ tickets: initialTickets, className }) => {
  const [tickets, setTickets] = React.useState([])

  useEffect(() => {
    setTickets(initialTickets)
  }, [initialTickets])

  return (
    <Card className={cn('flex flex-col flex-1 min-w-96', className)}>
      {/* Card Header */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tickets</CardTitle>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="p-0">
        <ScrollArea className="h-[40vh]">
          <div className=" pr-4">
            {tickets &&
              tickets
                .sort((a, b) => (a.state === 'closed' ? 1 : -1)) // Sort by state
                .map((ticket) => (
                  <div
                    key={ticket.iid}
                    className={cn(
                      'flex flex-col gap-1 px-2 py-1 rounded-md transition-colors',
                      'hover:bg-accent/50 cursor-pointer',
                      ticket.state === 'closed' && 'opacity-60'
                    )}
                  >
                    {/* Ticket Header */}
                    <div className="flex items-center gap-2">
                      {/* Status Indicator */}
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full shrink-0',
                          ticket.isBug ? 'bg-red-500' : 'bg-green-500'
                        )}
                      />
                      {/* Ticket ID and State */}
                      <p className="text-xs font-medium text-muted-foreground">
                        #{ticket.iid} • {ticket.state}
                      </p>
                    </div>

                    {/* Ticket Title and Link */}
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium line-clamp-1">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.link}</p>
                    </div>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TicketSection
