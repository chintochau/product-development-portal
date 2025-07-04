import React, { useCallback, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../components/ui/table'
import { TicketRow } from '../TicketPage'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../../../components/ui/select'
import { useUiux } from '../../contexts/uiuxContext'
import { addLabelToTicket } from '../../services/gitlabServices'
import { Badge } from '../../../../components/ui/badge'
import { Loader2 } from 'lucide-react'

const UIUXGitlabTicketsTable = React.memo(
  ({ tickets, uiuxRequests, handleUpdateUiUxRequestIssue }) => {
    const { assignTicketToTask, loading } = useUiux()

    const sortedUiuxRequests = useMemo(() => {
      return [...uiuxRequests].sort((a, b) => a.priority - b.priority)
    }, [uiuxRequests])

    const findLinkedRequest = useCallback(
      (ticketId) => {
        return uiuxRequests.find(
          (request) => request.gitlabTickets && request.gitlabTickets.includes(ticketId)
        )
      },
      [uiuxRequests]
    )

    const onTaskSelect = useCallback(
      (taskId, ticketId, linkedTask, ticketInfo) => {
        if (!taskId) {
          removeTask(ticketId, linkedTask)
          return
        }

        const request = sortedUiuxRequests.find((request) => request.id === taskId)
        assignTicketToTask(taskId, ticketId)
        handleUpdateUiUxRequestIssue(taskId, {
          ...request,
          gitlabTickets: request?.gitlabTickets
            ? [...new Set([...request.gitlabTickets, ticketId])]
            : [ticketId]
        })
        addLabelToTicket('Design Priority::' + request.priority, ticketInfo)
      },
      [assignTicketToTask, handleUpdateUiUxRequestIssue, sortedUiuxRequests]
    )

    const removeTask = useCallback(
      (ticketId, linkedTask) => {
        if (!linkedTask || !linkedTask.gitlabTickets) return
        const updatedTickets = linkedTask.gitlabTickets.filter((id) => id !== ticketId)
        handleUpdateUiUxRequestIssue(linkedTask.id, {
          ...linkedTask,
          gitlabTickets: updatedTickets
        })
      },
      [handleUpdateUiUxRequestIssue]
    )

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Milestone</TableHead>
            <TableHead>Task</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            const linkedRequest = findLinkedRequest(ticket.id)
            return (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isDesignTicket={true}
                extraColumns={
                  <TableCell>
                    {ticket.labels.find((label) => label.startsWith('Design Priority::')) && (
                      <Badge>
                        {ticket.labels.find((label) => label.startsWith('Design Priority::'))}
                      </Badge>
                    )}
                    <Select
                      onValueChange={(taskId) =>
                        onTaskSelect(taskId, ticket.id, linkedRequest, ticket)
                      }
                      value={linkedRequest ? linkedRequest.id : undefined}
                    >
                      <SelectTrigger className="w-full justify-center">
                        <SelectValue placeholder="Link to a Request" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null} className="text-left text-muted-foreground">
                          None
                        </SelectItem>
                        {sortedUiuxRequests.map((request) => (
                          <SelectItem
                            key={request.id}
                            value={request.id}
                            className="text-left font-semibold"
                          >
                            {request.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                }
              />
            )
          })}
        </TableBody>
      </Table>
    )
  }
)

export default UIUXGitlabTicketsTable
