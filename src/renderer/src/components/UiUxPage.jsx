import React, { useState } from 'react'
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

const UiUxManagementDashboard = () => {
  // Mock data - these would be replaced with your actual data fetching
  const [requestFilter, setRequestFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState('list')
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const { uiuxRequests, loading, setLoading, setShouldRefresh } = useUiux()

  // Filter and search logic
  const filteredRequests = uiuxRequests.filter((request) => {
    const matchesFilter = requestFilter === 'all' || request.status === requestFilter
    const matchesSearch =
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  // Statistics for dashboard
  const stats = {
    totalRequests: uiuxRequests.length,
    inProgress: uiuxRequests.filter((r) => r.status === 'in-progress').length,
    completed: uiuxRequests.filter((r) => r.status === 'completed').length,
    priority: {
      critical: uiuxRequests.filter((r) => r.priority === 'critical').length,
      high: uiuxRequests.filter((r) => r.priority === 'high').length,
      medium: uiuxRequests.filter((r) => r.priority === 'medium').length,
      low: uiuxRequests.filter((r) => r.priority === 'low').length
    }
  }

  const handleCreateUiUxRequestIssue = async (newRequest) => {
    setLoading(true)
    const response = await createUiUxRequestIssue(newRequest)
    setShouldRefresh(true)
  }

  const handleUpdateUiUxRequestIssue = async (id, newData) => {
    const request = uiuxRequests.find((r) => r.id === id)
    if (!request || !newData) return
    setLoading(true)
    const response = await updateUiUxRequestIssue(id, { ...request, ...newData })
    setShouldRefresh(true)
  }
  const handleDeleteUiUxRequestIssue = async (id) => {
    setLoading(true)
    const response = await deleteUiUxRequestIssue(id)
    setShouldRefresh(true)
  }

  // Helper for rendering priority badges
  const getPriorityBadge = (priority) => {
    if (!priority) return null
    const colors = {
      critical: 'bg-red-500 hover:bg-red-600',
      high: 'bg-orange-500 hover:bg-orange-600',
      medium: 'bg-yellow-500 hover:bg-yellow-600',
      low: 'bg-blue-500 hover:bg-blue-600'
    }

    return (
      <Badge className={colors[priority] || 'bg-gray-500'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  // Helper for rendering status badges
  const getStatusBadge = (status) => {
    if (!status) return null

    const colors = {
      todo: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      'in-progress': 'bg-blue-200 text-blue-800 hover:bg-blue-300',
      review: 'bg-purple-200 text-purple-800 hover:bg-purple-300',
      completed: 'bg-green-200 text-green-800 hover:bg-green-300'
    }

    return (
      <Badge className={colors[status] || 'bg-gray-200'}>
        {status
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Badge>
    )
  }

  // Helper for rendering source badges
  const getSourceBadge = (source) => {
    if (!source) return null
    const colors = {
      'uiux-db': 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300',
      gitlab: 'bg-orange-200 text-orange-800 hover:bg-orange-300',
      'product-db': 'bg-teal-200 text-teal-800 hover:bg-teal-300'
    }

    return (
      <Badge className={colors[source] || 'bg-gray-200'}>
        {source === 'uiux-db'
          ? 'UI/UX DB'
          : source === 'product-db'
            ? 'Product DB'
            : source.charAt(0).toUpperCase() + source.slice(1)}
      </Badge>
    )
  }

  // Render the Kanban board view
  const renderKanbanView = () => {
    const columns = ['todo', 'in-progress', 'review', 'completed']
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
                        {getPriorityBadge(request.priority)}
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
                        {request.tags.map((tag) => (
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
  }

  // Render the list view
  const renderListView = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>References</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>By</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          )}
          {filteredRequests.map((request, index) => (
            <TableRow key={request.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell>
                <ProductDropdown
                  product={request.product}
                  includingApps={true}
                  setProduct={(product) => handleUpdateUiUxRequestIssue(request.id, { product })}
                />
              </TableCell>
              <TableCell>{request.title}</TableCell>
              <TableCell className="text-muted-foreground  whitespace-pre-line">
                {request.description}
              </TableCell>
              <TableCell>
                <PriorityDropdown
                  priority={request.priority}
                  setPriority={(priority) => handleUpdateUiUxRequestIssue(request.id, { priority })}
                />
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{getSourceBadge(request.source)}</TableCell>
              <TableCell>{request.by}</TableCell>
              <TableCell>
                <Trash2
                  className="cursor-pointer text-red-100 hover:opacity-70 size-4 transition-all hover:text-red-500"
                  onClick={() => handleDeleteUiUxRequestIssue(request.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Render a simple stats dashboard
  const renderStatsDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">
              {Math.round((stats.inProgress / stats.totalRequests) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs text-gray-500">
              {Math.round((stats.completed / stats.totalRequests) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.priority.critical}</div>
            <div className="text-xs text-gray-500">
              {Math.round((stats.priority.critical / stats.totalRequests) * 100)}% of total
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">UI/UX Request Management</h1>
          <p className="text-gray-500">Manage and track design requests across all projects</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <CreateUIUXDialog onSubmit={handleCreateUiUxRequestIssue} />
        </div>
      </div>

      {renderStatsDashboard()}

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={requestFilter} onValueChange={setRequestFilter}>
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
            onClick={() => setSelectedView('kanban')}
          >
            <GitPullRequest className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={selectedView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('list')}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {selectedView === 'kanban' ? renderKanbanView() : renderListView()}
        </CardContent>
      </Card>

      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
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
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>Apply Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UiUxManagementDashboard

const CreateUIUXDialog = ({ onSubmit }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')

  const { products } = useProducts()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Form validation and data gathering
    const formData = new FormData(e.target)
    const featureData = Object.fromEntries(formData)
    onSubmit(featureData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New UI/UX Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New UI/UX Request</DialogTitle>
            <DialogDescription>Add a new UI/UX request to the list.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium col-span-1">Product</label>

            <Select name="product" value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {['Apps', ...defaultPlatforms].map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
                {products
                  .filter((product) => product.bluos)
                  .map((product) => (
                    <SelectItem key={product.iid} value={product.iid.toString()}>
                      {product.projectName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right font-medium col-span-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Feature title"
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right font-medium col-span-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the feature..."
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="by" className="text-right font-medium col-span-1">
                By
              </label>
              <Input
                id="by"
                name="by"
                placeholder="Enter name..."
                className="col-span-3"

              />
            </div>


            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Type</label>
              <div className="col-span-3 flex gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="app" name="app" className="mr-2" />
                  <label htmlFor="app">App</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="hardware" name="hardware" className="mr-2" />
                  <label htmlFor="hardware">Hardware</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="documentation" name="documentation" className="mr-2" />
                  <label htmlFor="documentation">Documentation</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Start Date</label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="startDate" value={date ? date.toISOString() : ''} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="estimate" className="text-right font-medium col-span-1">
                Estimate (days)
              </label>
              <Input id="estimate" name="estimate" type="number" min="1" className="col-span-3" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Feature</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
