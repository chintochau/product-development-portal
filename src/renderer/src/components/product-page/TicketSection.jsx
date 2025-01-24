import React from 'react'
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

const TicketSection = ({ tickets, className }) => {
  return (
    <Card className={cn('flex flex-col gap-2 flex-1 min-w-96', className)}> 
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
        <CardDescription>Ticket from Epic</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <div className="max-h-[40vw]">
            {tickets &&
              tickets
                .sort((a, b) => {
                  // sort by state = opened, closed
                  return a.state === 'closed' ? 1 : -1
                })
                .map((ticket) => (
                  <div
                    key={ticket.iid}
                    className={cn(
                      'flex flex-col text-xs py-1 border-b',
                      ticket.state === 'closed' && 'text-accent-foreground/60'
                    )}
                  >
                    <div className="flex gap-2">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full',
                          ticket.isBug ? 'bg-red-500' : 'bg-green-500'
                        )}
                      ></div>
                      <p>{ticket.iid}</p>
                      <p>{ticket.state}</p>
                    </div>
                    <div className={cn('flex gap-2 text-sm')}>
                      <p>{ticket.title}</p>
                      <p>{ticket.link}</p>
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
