import React, { useState, useMemo, useCallback, memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

import {
  Search,
  Filter,
  Plus,
  BarChart2,
  PieChart,
  User,
  GitPullRequest,
  Loader2,
  CalendarIcon,
  Trash,
  Trash2
} from 'lucide-react'
import { useUiux } from '../contexts/uiuxContext'
import {
  createUiUxRequestIssue,
  deleteUiUxRequestIssue,
  updateUiUxRequestIssue
} from '../services/gitlabServices'
import Markdown from 'react-markdown'
import { Textarea } from '../../../components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { Calendar } from '../../../components/ui/calendar'
import ProductDropdown from './feature-page-components/ProductDropdown'
import { useProducts } from '../contexts/productsContext'
import { defaultPlatforms } from '../constant'
import PriorityDropdown from './feature-page-components/PriorityDropdown'
import TimelineProgress, { uiuxSteps } from './uiux-page-components/UIUXProgressBar'
import FrameWraper from './frameWarper'
import { CreateFeatureDialog } from './FeaturesPage'

// Memoized components to prevent unnecessary re-renders
const MemoizedProductDropdown = memo(ProductDropdown)
const MemoizedPriorityDropdown = memo(PriorityDropdown)
const MemoizedTimelineProgress = memo(TimelineProgress)

// Memoized StatusBadge component
const StatusBadge = memo(({ status }) => {
  if (!status) return null;

  const colors = {
    todo: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    'in-progress': 'bg-blue-200 text-blue-800 hover:bg-blue-300',
    review: 'bg-purple-200 text-purple-800 hover:bg-purple-300',
    completed: 'bg-green-200 text-green-800 hover:bg-green-300'
  };

  return (
    <Badge className={colors[status] || 'bg-gray-200'}>
      {status
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')}
    </Badge>
  );
});

// Memoized TableRow component to prevent re-renders of unchanged rows
const RequestTableRow = memo(({ request, onUpdate, onDelete }) => {
  const handleProductChange = useCallback(
    (product) => onUpdate(request.id, { product }), 
    [request.id, onUpdate]
  );
  
  const handlePriorityChange = useCallback(
    (priority) => onUpdate(request.id, { priority }),
    [request.id, onUpdate]
  );

  const handleDelete = useCallback(
    () => onDelete(request.id),
    [request.id, onDelete]
  );

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50">
      <TableCell>
        <MemoizedProductDropdown
          product={request.product}
          includingApps={true}
          setProduct={handleProductChange}
        />
      </TableCell>
      <TableCell>{request.title}</TableCell>
      <TableCell className="text-muted-foreground whitespace-pre-line">
        {request.description}
      </TableCell>
      <TableCell>
        <MemoizedPriorityDropdown
          priority={request.priority}
          setPriority={handlePriorityChange}
        />
      </TableCell>
      <TableCell><StatusBadge status={request.status} /></TableCell>
      <TableCell><MemoizedTimelineProgress /></TableCell>
      <TableCell>{request.by}</TableCell>
      <TableCell>
        <Trash2
          className="cursor-pointer text-red-100 hover:opacity-70 size-4 transition-all hover:text-red-500"
          onClick={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
});

// Memoized StatCard component
const StatCard = memo(({ title, value, percentage }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {percentage !== undefined && (
        <div className="text-xs text-gray-500">{percentage}% of total</div>
      )}
    </CardContent>
  </Card>
));

const UiUxManagementDashboard = () => {
  // State
  const [requestFilter, setRequestFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState('list')
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const { uiuxRequests, loading, setLoading, setShouldRefresh } = useUiux()

  // Memoize filtered requests to prevent recalculation on every render
  const filteredRequests = useMemo(() => {
    return uiuxRequests.filter((request) => {
      const matchesFilter = requestFilter === 'all' || request.status === requestFilter
      const matchesSearch =
        request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.title?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    }).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  }, [uiuxRequests, requestFilter, searchQuery]);

  // Memoize statistics to prevent recalculation on every render
  const stats = useMemo(() => ({
    totalRequests: uiuxRequests.length,
    inProgress: uiuxRequests.filter((r) => r.status === 'in-progress').length,
    completed: uiuxRequests.filter((r) => r.status === 'completed').length,
    priority: {
      critical: uiuxRequests.filter((r) => r.priority === 'critical').length,
      high: uiuxRequests.filter((r) => r.priority === 'high').length,
      medium: uiuxRequests.filter((r) => r.priority === 'medium').length,
      low: uiuxRequests.filter((r) => r.priority === 'low').length
    }
  }), [uiuxRequests]);

  // Memoized callback handlers to prevent new function creation on each render
  const handleCreateUiUxRequestIssue = useCallback(async (newRequest) => {
    setLoading(true)
    await createUiUxRequestIssue(newRequest)
    setShouldRefresh(true)
  }, [setLoading, setShouldRefresh]);

  const handleUpdateUiUxRequestIssue = useCallback(async (id, newData) => {
    const request = uiuxRequests.find((r) => r.id === id)
    if (!request || !newData) return
    setLoading(true)
    await updateUiUxRequestIssue(id, { ...request, ...newData })
    setShouldRefresh(true)
  }, [uiuxRequests, setLoading, setShouldRefresh]);
  
  const handleDeleteUiUxRequestIssue = useCallback(async (id) => {
    setLoading(true)
    await deleteUiUxRequestIssue(id)
    setShouldRefresh(true)
  }, [setLoading, setShouldRefresh]);

  // Handler for search input changes
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, []);

  // Handler for filter changes
  const handleFilterChange = useCallback((value) => {
    setRequestFilter(value)
  }, []);

  // Handler for view changes
  const handleViewChange = useCallback((view) => {
    setSelectedView(view)
  }, []);

  // Handler for filter dialog
  const handleFilterDialogToggle = useCallback((open) => {
    setShowFilterDialog(open)
  }, []);

  // Memoized render functions to prevent recalculation on every render
  const renderKanbanView = useMemo(() => {
    const columns = uiuxSteps
    const columnTitles = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      review: 'Review',
      completed: 'Completed'
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">{columnTitles[column]}</h3>
              <Badge className="bg-gray-200 text-gray-800">
                {uiuxRequests.filter((r) => r.status === column).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {uiuxRequests
                .filter((request) => request.status === column)
                .map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">{request.id}</span>
                        <StatusBadge status={request.priority} />
                      </div>
                      <CardTitle className="text-sm font-medium mt-1">{request.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.assignee === 'Unassigned' ? (
                            <span className="text-gray-400">Unassigned</span>
                          ) : (
                            request.assignee
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {request.tags && request.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${request.completionPercentage}%` }}
                        ></div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }, [uiuxRequests]);

  // Memoized stats dashboard to prevent recalculation on every render
  const renderStatsDashboard = useMemo(() => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Requests" 
          value={stats.totalRequests} 
        />
        <StatCard 
          title="In Progress" 
          value={stats.inProgress} 
          percentage={stats.totalRequests ? Math.round((stats.inProgress / stats.totalRequests) * 100) : 0} 
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          percentage={stats.totalRequests ? Math.round((stats.completed / stats.totalRequests) * 100) : 0}
        />
        <StatCard 
          title="Critical Priority" 
          value={stats.priority.critical} 
          percentage={stats.totalRequests ? Math.round((stats.priority.critical / stats.totalRequests) * 100) : 0}
        />
      </div>
    )
  }, [stats]);

  return (
    <FrameWraper>
      <div className="container mx-auto p-4 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">UI/UX Request Management</h1>
            <p className="text-gray-500">Manage and track design requests across all projects</p>
          </div>
  
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleFilterDialogToggle(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <CreateFeatureDialog onSubmit={handleCreateUiUxRequestIssue} />
          </div>
        </div>
  
        {renderStatsDashboard}
  
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
  
            <Select value={requestFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('kanban')}
            >
              <GitPullRequest className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={selectedView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('list')}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
  
        <Card className="mb-6">
          <CardContent className="p-6">
            {selectedView === 'kanban' ? renderKanbanView : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>References</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div className="flex items-center justify-center">
                          <Loader2 className="size-8 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRequests.map((request) => (
                    <RequestTableRow
                      key={request.id}
                      request={request}
                      onUpdate={handleUpdateUiUxRequestIssue}
                      onDelete={handleDeleteUiUxRequestIssue}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
  
        {/* Advanced Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={handleFilterDialogToggle}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
              <DialogDescription>Filter UI/UX requests by multiple criteria.</DialogDescription>
            </DialogHeader>
  
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  Source
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="uiux-db">UI/UX Database</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                    <SelectItem value="product-db">Product Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignee" className="text-right">
                  Assignee
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="jane">Jane Cooper</SelectItem>
                    <SelectItem value="alex">Alex Morgan</SelectItem>
                    <SelectItem value="maria">Maria Rodriguez</SelectItem>
                    <SelectItem value="john">John Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="today">Due Today</SelectItem>
                    <SelectItem value="this-week">Due This Week</SelectItem>
                    <SelectItem value="next-week">Due Next Week</SelectItem>
                    <SelectItem value="later">Due Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
  
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleFilterDialogToggle(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleFilterDialogToggle(false)}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FrameWraper>
  )
}

export default UiUxManagementDashboard