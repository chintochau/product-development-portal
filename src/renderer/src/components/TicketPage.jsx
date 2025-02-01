
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import FrameWraper from './frameWarper';
import { Button } from '../../../components/ui/button';
import { getGroupIssuesWithQuery } from '../services/gitlabServices';
import { Input } from '../../../components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { useTickets } from '../contexts/ticketsContext';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';

const TicketPage = () => {
  const { tickets, setTickets } = useTickets();
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [openOnly, setOpenOnly] = React.useState(true);

  // Fetch tickets based on search and filter
  const getTickets = async () => {
    setLoading(true);
    const query = { search: searchText };
    if (openOnly) query.state = 'opened';

    const response = await getGroupIssuesWithQuery(query);
    setLoading(false);
    setTickets(response);
  };

  return (
    <FrameWraper>
      <div className="flex flex-col">
        {/* Header and Search Bar */}
        <div className="px-4 sticky top-0 flex flex-col bg-background z-50 pb-4 border-b shadow-sm">
          <h1 className="text-2xl font-semibold mb-4">Tickets</h1>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              getTickets();
            }}
          >
            <div className="flex gap-2">
              <Input
                placeholder="Search tickets..."
                type="search"
                className="border-secondary border-2 flex-1"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                onClick={getTickets}
                variant="outline"
                size="icon"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Checkbox
                id="openOnly"
                checked={openOnly}
                onCheckedChange={(e) => setOpenOnly(e)}
              />
              <label htmlFor="openOnly" className="text-sm text-muted-foreground">
                Show Open Tickets Only
              </label>
            </div>
          </form>
        </div>

        {/* Tickets Table */}
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Epic</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Searching for "{searchText}"...
                  </TableCell>
                </TableRow>
              )}
              {!loading && tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No tickets found.
                  </TableCell>
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
  );
};

// Status Component for rendering badges
export const StatusComponent = ({ ticket }) => {
  const { labels } = ticket || {};

  // Define label mappings
  const labelMappings = {
    'type::bug': { label: 'Bug', color: 'bg-red-100 text-red-800' },
    'type::feature': { label: 'Feature', color: 'bg-blue-100 text-blue-800' },
    'workflow:: 2 doing': { label: 'Doing', color: 'bg-blue-500 text-blue-50' },
    'workflow:: 3 review': { label: 'Review', color: 'bg-orange-500 text-orange-50' },
    'workflow:: 4 testing': { label: 'Testing', color: 'bg-purple-500 text-purple-50' },
    'priority::critical': { label: 'Critical', color: 'bg-red-500 text-red-50' },
    'priority::high': { label: 'High', color: 'bg-yellow-500 text-yellow-50' },
  };

  // Ticket status
  const ticketStatus =
    ticket.state === 'opened'
      ? { label: 'Open', color: 'bg-green-500 text-green-50' }
      : { label: 'Closed', color: 'bg-gray-500 text-gray-50' };

  // Combine all labels
  const labelsArray = [ticketStatus, ...(labels || []).map((label) => labelMappings[label])];

  return (
    <div className="flex flex-wrap gap-1">
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
    </div>
  );
};

// Ticket Row Component
const TicketRow = ({ ticket }) => {
  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="font-medium">{ticket.references?.relative || ticket.iid}</TableCell>
      <TableCell
        className="hover:underline cursor-pointer"
        onClick={() => window.open(ticket.web_url)}
      >
        {ticket.title}
      </TableCell>
      <TableCell>{ticket.assignee?.name || 'Unassigned'}</TableCell>
      <TableCell>
        {ticket.epic?.url ? (
          <p
            className="cursor-pointer hover:underline"
            onClick={() => window.open(ticket.epic.url)}
          >
            {ticket.epic.title}
          </p>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        {ticket.milestone?.web_url ? (
          <p
            className="cursor-pointer hover:underline"
            onClick={() => window.open(ticket.milestone.web_url)}
          >
            {ticket.milestone.title}
          </p>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        <StatusComponent ticket={ticket} />
      </TableCell>
    </TableRow>
  );
};

export default TicketPage;