import React, { useState, useEffect } from 'react';
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
import {
  Loader2,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Download,
  X,
  ChevronDown,
  Clock,
  Calendar
} from 'lucide-react';
import { useTickets } from '../contexts/ticketsContext';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "../../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { useDevelopers } from '../contexts/developerContext';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';

const TicketPage = () => {
  const { tickets, setTickets } = useTickets();
  const { developers } = useDevelopers()
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [openOnly, setOpenOnly] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [activeFilters, setActiveFilters] = useState([]);
  const [ticketType, setTicketType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [milestone, setMilestone] = useState('all');
  const [assignees, setAssignees] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState('all');
  const [sortBy, setSortBy] = useState('desc');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const {milestones} = useSingleProduct()

  // Common milestone options for your projects
  const milestoneOptions = [
    {value:"None", label:"None"},
    {value:"Upcoming", label:"Upcoming"},
    {value:"Started", label:"Started"},

  ]
  
  // Workflow options based on your current code
  const workflowOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'workflow:: 2 doing', label: 'Doing' },
    { value: 'workflow:: 3 review', label: 'Review' },
    { value: 'workflow:: 4 testing', label: 'Testing' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'priority::critical', label: 'Critical' },
    { value: 'priority::high', label: 'High' },
    { value: 'priority::medium', label: 'Medium' },
    { value: 'priority::low', label: 'Low' }
  ];

  // Type options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'type::bug', label: 'Bug' },
    { value: 'type::feature', label: 'Feature' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'asc', label: 'Oldest' },
    { value: 'desc', label: 'Latest' },
  ];

  // Add active filters to display
  useEffect(() => {
    const filters = [];

    if (openOnly) {
      filters.push({ id: 'status', label: 'Open Only', value: 'open' });
    }

    if (ticketType !== 'all') {
      filters.push({ id: 'type', label: 'Type', value: typeOptions.find(t => t.value === ticketType)?.label });
    }

    if (priority !== 'all') {
      filters.push({ id: 'priority', label: 'Priority', value: priorityOptions.find(p => p.value === priority)?.label });
    }

    if (milestone !== 'all') {
      filters.push({ id: 'milestone', label: 'Milestone', value: milestone });
    }

    if (assignees.length > 0) {
      filters.push({
        id: 'assignees',
        label: 'Assignees',
        value: assignees.length === 1
          ? developers.find(d => d.id === assignees[0])?.name
          : `${assignees.length} developers`
      });
    }

    if (workflowStatus !== 'all') {
      filters.push({ id: 'workflow', label: 'Workflow', value: workflowOptions.find(w => w.value === workflowStatus)?.label });
    }

    if (dateRange.from) {
      filters.push({
        id: 'dateRange',
        label: 'Date Range',
        value: `${dateRange.from.toLocaleDateString()} - ${dateRange.to ? dateRange.to.toLocaleDateString() : 'now'}`
      });
    }

    setActiveFilters(filters);
  }, [openOnly, ticketType, priority, milestone, assignees, workflowStatus, dateRange, developers]);

  const buildQuery = (assignee = null) => {
    const query = {
      search: searchText,
      sort: sortBy,
      per_page: 100
    };
  
    if (openOnly) query.state = 'opened';
  
    if (ticketType !== 'all') query.labels = [...(query.labels || []), ticketType];
  
    if (priority !== 'all') query.labels = [...(query.labels || []), priority];
  
    if (workflowStatus !== 'all') query.labels = [...(query.labels || []), workflowStatus];
  
    if (milestone !== 'all') query.milestone_id = milestone;
  
    if (assignee) query.assignee_id = assignee; // Add assignee only if provided
  
    if (dateRange.from) {
      query.created_after = dateRange.from.toISOString();
      if (dateRange.to) query.created_before = dateRange.to.toISOString();
    }
  
    console.log("Query:", query);
    
    return query;
  };
  
  // Fetch tickets based on search and filter
  const getTickets = async () => {
    setLoading(true);
    
    try {
      let tickets = new Set();
  
      if (assignees.length === 0) {
        // No assignee selected, fetch all tickets
        const query = buildQuery(); // No assignee_id filter
        const response = await getGroupIssuesWithQuery(query);
        tickets = new Set(response.map(ticket => JSON.stringify(ticket)));
      } else if (assignees.length === 1) {
        // Single assignee case
        const query = buildQuery(assignees[0]);
        const response = await getGroupIssuesWithQuery(query);
        tickets = new Set(response.map(ticket => JSON.stringify(ticket)));
      } else {
        // Multiple assignees case
        for (const assignee of assignees) {
          const query = buildQuery(assignee);
          const response = await getGroupIssuesWithQuery(query);
          response.forEach(ticket => tickets.add(JSON.stringify(ticket))); // Ensure uniqueness
        }
      }
  
      setTickets(Array.from(tickets).map(ticket => JSON.parse(ticket))); // Convert back to objects
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching tickets:", error);
      // You can add a toast notification here for error handling
    } finally {
      setLoading(false);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setOpenOnly(true);
    setTicketType('all');
    setPriority('all');
    setMilestone('all');
    setAssignees([]);
    setWorkflowStatus('all');
    setDateRange({ from: undefined, to: undefined });
    setSortBy('created_at');
  };

  // Remove specific filter
  const removeFilter = (filterId) => {
    switch (filterId) {
      case 'status':
        setOpenOnly(false);
        break;
      case 'type':
        setTicketType('all');
        break;
      case 'priority':
        setPriority('all');
        break;
      case 'milestone':
        setMilestone('all');
        break;
      case 'assignees':
        setAssignees([]);
        break;
      case 'workflow':
        setWorkflowStatus('all');
        break;
      case 'dateRange':
        setDateRange({ from: undefined, to: undefined });
        break;
      default:
        break;
    }
  };

  // Export tickets to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Title", "Assignee", "Epic", "Milestone", "Status", "Priority", "Created At"];

    const csvRows = [
      headers.join(','),
      ...tickets.map(ticket => {
        const assigneeName = ticket.assignee?.name || 'Unassigned';
        const epicTitle = ticket.epic?.title || '';
        const milestoneTitle = ticket.milestone?.title || '';
        const status = ticket.state === 'opened' ? 'Open' : 'Closed';
        const priority = ticket.labels?.find(l => l.startsWith('priority::'))?.replace('priority::', '') || '';
        const createdAt = new Date(ticket.created_at).toLocaleDateString();

        return [
          ticket.references?.relative || ticket.iid,
          `"${ticket.title.replace(/"/g, '""')}"`,
          `"${assigneeName}"`,
          `"${epicTitle}"`,
          `"${milestoneTitle}"`,
          status,
          priority,
          createdAt
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `gitlab-tickets-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Toggle assignee selection
  const toggleAssignee = (developerId) => {
    if (assignees.includes(developerId)) {
      setAssignees(assignees.filter(id => id !== developerId));
    } else {
      setAssignees([...assignees, developerId]);
    }
  };

  return (
    <FrameWraper>
      <div className="flex flex-col">
        {/* Header and Search Bar */}
        <div className="px-4 sticky top-0 flex flex-col bg-background z-50 pb-2 border-b shadow-sm">
          <div className="flex items-center justify-between my-4">
            <h1 className="text-2xl font-semibold">Tickets</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={getTickets}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode('table')}>
                    Table View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('card')}>
                    Card View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={loading || tickets.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Main Search Bar */}
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              getTickets();
            }}
          >
            <div className="flex gap-2">
              <Input
                placeholder="Search tickets by title, description or ID..."
                type="search"
                className="border-secondary border-2 flex-1"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                onClick={getTickets}
                variant="default"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your ticket search with specific criteria.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6">
                    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                      <div className="space-y-4">
                        {/* Ticket State */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Ticket State</h3>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="openOnly"
                              checked={openOnly}
                              onCheckedChange={setOpenOnly}
                            />
                            <label htmlFor="openOnly" className="text-sm">
                              Show Open Tickets Only
                            </label>
                          </div>
                        </div>

                        <Separator />

                        {/* Ticket Type */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Ticket Type</h3>
                          <Select value={ticketType} onValueChange={setTicketType}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {typeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Priority</h3>
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {priorityOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Workflow Status */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Workflow Status</h3>
                          <Select value={workflowStatus} onValueChange={setWorkflowStatus}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select workflow" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {workflowOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Assignees */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Assignees</h3>

                          <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between"
                                role="combobox"
                              >
                                {assignees.length === 0
                                  ? 'Select developers'
                                  : assignees.length === 1
                                    ? developers.find(d => d.id === assignees[0])?.name || 'Developer'
                                    : `${assignees.length} developers selected`
                                }
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                              <Command>
                                <CommandInput placeholder="Type a name or search..." />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup heading="Developers">
                                    {developers?.map((developer) => (
                                      <CommandItem
                                        key={developer.id}
                                        onSelect={
                                          () => toggleAssignee(developer.id)
                                        }
                                      >
                                        <Checkbox
                                          id={`dev-${developer.id}`}
                                          checked={assignees.includes(developer.id)}
                                          onCheckedChange={() => toggleAssignee(developer.id)}
                                        />
                                        {developer.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Milestone */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Milestone</h3>
                          <Select value={milestone} onValueChange={setMilestone}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select milestone" />
                            </SelectTrigger>
                            <SelectContent className="max-w-60">
                              <SelectGroup>
                                <SelectItem value="all">All Milestones</SelectItem>
                                {milestoneOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Created Date Range</h3>
                          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                        </div>

                        {/* Sort Options */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Sort By</h3>
                          <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {sortOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>

                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>

                  <SheetFooter className="mt-6 flex gap-2 justify-between">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button onClick={getTickets}>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters Display */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.map(filter => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="px-2 py-1 flex items-center gap-1"
                  >
                    <span className="text-xs font-semibold">{filter.label}:</span>
                    <span className="text-xs">{filter.value}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={resetFilters}
                >
                  Clear All
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Tickets Display */}
        <div className="p-4">
          {viewMode === 'table' ? (
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
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <p>Searching for tickets...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-base font-medium">No tickets found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading && (
                <div className="col-span-full flex justify-center py-8">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Searching for tickets...</p>
                  </div>
                </div>
              )}
              {!loading && tickets.length === 0 && (
                <div className="col-span-full flex justify-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <Search className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-lg font-medium">No tickets found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  </div>
                </div>
              )}
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
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
    'type::improvement': { label: 'Improvement', color: 'bg-green-100 text-green-800' },
    'type::documentation': { label: 'Docs', color: 'bg-purple-100 text-purple-800' },
    'workflow:: 2 doing': { label: 'Doing', color: 'bg-blue-500 text-blue-50' },
    'workflow:: 3 review': { label: 'Review', color: 'bg-orange-500 text-orange-50' },
    'workflow:: 4 testing': { label: 'Testing', color: 'bg-purple-500 text-purple-50' },
    'priority::critical': { label: 'Critical', color: 'bg-red-500 text-red-50' },
    'priority::high': { label: 'High', color: 'bg-yellow-500 text-yellow-50' },
    'priority::medium': { label: 'Medium', color: 'bg-blue-300 text-blue-800' },
    'priority::low': { label: 'Low', color: 'bg-green-300 text-green-800' },
  };

  // Ticket status
  const ticketStatus =
    ticket.state === 'opened'
      ? { label: 'Open', color: 'bg-green-500 text-green-50' }
      : { label: 'Closed', color: 'bg-gray-500 text-gray-50' };

  // Combine all labels
  const labelsArray = [ticketStatus, ...(labels || [])
    .map((label) => labelMappings[label])
    .filter(Boolean)
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {labelsArray.map((labelObj, index) => (
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
  const ticketAge = () => {
    const created = new Date(ticket.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="font-medium">{ticket.references?.relative || ticket.iid}</TableCell>
      <TableCell
        className="hover:underline cursor-pointer group relative"
        onClick={() => window.open(ticket.web_url)}
      >
        <div>
          {ticket.title}
          <span className="text-xs text-muted-foreground ml-2 opacity-60">
            {ticketAge()}
          </span>
        </div>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10"></div>
      </TableCell>
      <TableCell>
        {ticket.assignee ? (
          <div className="flex items-center gap-2">
            {ticket.assignee.avatar_url ? (
              <img
                src={ticket.assignee.avatar_url}
                alt={ticket.assignee.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                {ticket.assignee.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{ticket.assignee.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        {ticket.epic?.url ? (
          <p
            className="cursor-pointer hover:underline text-sm flex items-center"
            onClick={() => window.open("https://gitlab.com/" + ticket.epic.url)}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
            {ticket.epic.title}
          </p>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {ticket.milestone?.web_url ? (
          <p
            className="cursor-pointer hover:underline flex items-center"
            onClick={() => window.open(ticket.milestone.web_url)}
          >
            <Calendar className="h-3 w-3 mr-1 opacity-70" />
            <span className="text-sm">{ticket.milestone.title}</span>
          </p>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <StatusComponent ticket={ticket} />
      </TableCell>
    </TableRow>
  );
};

// Ticket Card Component for card view
const TicketCard = ({ ticket }) => {
  const ticketAge = () => {
    const created = new Date(ticket.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const truncate = (str, n) => {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={() => window.open(ticket.web_url)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base">
            #{ticket.references?.relative || ticket.iid}
          </CardTitle>
          <StatusComponent ticket={ticket} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {ticketAge()}
          </div>
          {ticket.milestone?.title && (
            <Badge variant="outline" className="text-xs font-normal">
              {ticket.milestone.title}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-medium text-base mb-2">{truncate(ticket.title, 70)}</h3>

        <div className="flex justify-between items-center mt-3">
          <div>
            {ticket.epic?.title && (
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
                {truncate(ticket.epic.title, 30)}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {ticket.assignee ? (
              <div className="flex items-center">
                {ticket.assignee.avatar_url ? (
                  <img
                    src={ticket.assignee.avatar_url}
                    alt={ticket.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="ml-1 text-xs">{truncate(ticket.assignee.name, 15)}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSingleProduct } from '../contexts/singleProductContext';

const DatePickerWithRange = ({ date, setDate }) => {
  const handleChange = (dates) => {
    const [start, end] = dates;
    setDate({ from: start, to: end });
  };

  return (
    <div className="relative w-full">
      <DatePicker
        selected={date.from}
        onChange={handleChange}
        startDate={date.from}
        endDate={date.to}
        selectsRange
        isClearable
        placeholderText="Select date range"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};


export default TicketPage;