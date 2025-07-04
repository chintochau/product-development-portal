import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Filter, ArrowUpDown, Check, X } from 'lucide-react'
import { useTickets } from '../contexts/ticketsContext'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table'
import { useNavigate } from 'react-router-dom'
import { useSingleProduct } from '../contexts/singleProductContext'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ReferenceLine } from 'recharts'
import dayjs from 'dayjs'
const chartConfig = {
  mp1Date: {
    label: 'mp1Date',
    color: 'hsl(var(--chart-1))'
  },
  launchDate: {
    label: 'launchDate',
    color: 'hsl(var(--chart-2))'
  },
  createdAt: {
    label: 'today',
    color: 'hsl(var(--background))'
  }
}
import AllFeatures from './feature-page-components/AllFeatures'
import BluOSFeatureRequest from './feature-page-components/BluOSFeatureRequest'
import BarChartComponent from './BarChartComponent'
// import { useRoadmap } from '../contexts/roadmapContext' // Removed during migration
import { useSidebar } from '../../../components/ui/sidebar'
import { cn } from '../../../lib/utils'
import FrameWraper from './frameWarper'
import {
  createFeatureRequestIssue,
  deleteFeatureRequestIssue,
  updateFeatureRequestIssue
} from '../services/gitlabServices'

const FeatureManagementPortal = () => {
  const { features, setShouldRefresh } = useTickets()
  const { getFeatureEpics } = useSingleProduct()
  // const { featureChartData, featuersByDevelopers } = useRoadmap() // Removed during migration
  const featureChartData = [] // Temporary empty data
  const featuersByDevelopers = [] // Temporary empty data
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchText, setSearchText] = useState('')

  const createNewFeature = async (featureData) => {
    // Use PostgreSQL API for creating features
    const response = await window.api.features.create({
      ...featureData,
      platforms: featureData.platforms || []
    })
    
    if (response.success) {
      setShouldRefresh(true)
      return response.data
    } else {
      console.error('Failed to create feature:', response.error)
      // Fallback to GitLab
      const gitlabResponse = await createFeatureRequestIssue(featureData)
      setShouldRefresh(true)
      return gitlabResponse
    }
  }

  const updateFeature = async (id, updatedData) => {
    // Use PostgreSQL API for updating features
    const response = await window.api.features.update(id, {
      ...updatedData,
      platforms: updatedData.platforms || []
    })
    
    if (response.success) {
      setShouldRefresh(true)
      return response.data
    } else {
      console.error('Failed to update feature:', response.error)
      // Fallback to GitLab
      const gitlabResponse = await updateFeatureRequestIssue(id, updatedData)
      setShouldRefresh(true)
      return gitlabResponse
    }
  }

  const deleteFeature = async (id) => {
    // Use PostgreSQL API for deleting features
    const response = await window.api.features.delete(id)
    
    if (response.success) {
      setShouldRefresh(true)
      return response
    } else {
      console.error('Failed to delete feature:', response.error)
      // Fallback to GitLab
      const gitlabResponse = await deleteFeatureRequestIssue(id)
      setShouldRefresh(true)
      return gitlabResponse
    }
  }

  // Filter features based on selected filter
  const filteredFeatures = features
    .filter((feature) => feature.title.toLowerCase().includes(searchText.toLowerCase()))
    .filter((feature) => {
      if (filter === 'all') return true
      if (filter === 'hardware') return feature.type?.hardware
      if (filter === 'software') return feature.type?.software
      return true
    })
    .filter((feature) => feature.archived !== true)

  // Sort features based on selected sort method
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
    if (sortBy === 'priority') {
      const priorityA = a.priority ? parseInt(a.priority) : 999
      const priorityB = b.priority ? parseInt(b.priority) : 999
      return priorityA - priorityB
    }
    return 0
  })

  return (
    <FrameWraper>
      <div className=" mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track all product features</p>
          </div>
        </div>
        <Tabs defaultValue="features">
          <TabsList>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="developers">Developers</TabsTrigger>
          </TabsList>
          <TabsContent value="developers">
            <BarChartComponent chartData={featuersByDevelopers} developerChart />
          </TabsContent>
          <TabsContent value="features">
            <BarChartComponent chartData={featureChartData} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search features..."
                className="pl-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Filter</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Features</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="software">Software</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span>Sort by</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="list">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <CreateFeatureDialog onSubmit={createNewFeature} />
          </div>

          <TabsContent value="list">
            <div className="flex flex-col gap-2 py-4">
              <AllFeatures features={sortedFeatures} />
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="flex flex-col gap-2 py-4">
              <AllFeatures features={features.filter((feature) => feature.archived === true)} />
            </div>
          </TabsContent>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  onUpdate={updateFeature}
                  onDelete={deleteFeature}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FrameWraper>
  )
}

const PriorityBadge = ({ priority }) => {
  const priorityNum = parseInt(priority)

  if (priorityNum === 1) {
    return <Badge className="bg-red-500">Critical</Badge>
  } else if (priorityNum === 2) {
    return <Badge className="bg-orange-500">High</Badge>
  } else if (priorityNum === 3) {
    return <Badge className="bg-blue-500">Medium</Badge>
  } else {
    return <Badge className="bg-slate-500">Low</Badge>
  }
}

const FeatureCard = ({ feature, onUpdate, onDelete }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{feature.title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {feature.description || 'No description provided'}
            </CardDescription>
          </div>
          {feature.priority && <PriorityBadge priority={feature.priority} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {feature.type?.hardware && <Badge variant="outline">Hardware</Badge>}
          {feature.type?.software && <Badge variant="outline">Software</Badge>}
          {feature.product && <Badge variant="secondary">Product {feature.product}</Badge>}
        </div>

        {feature.changes && feature.changes.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Recent Changes:</p>
            <div className="space-y-2">
              {feature.changes.slice(0, 2).map((change) => (
                <div key={change.id} className="flex items-start gap-2 text-sm">
                  <div className="mt-1">
                    {change.status === 'approved' && <Check className="h-4 w-4 text-green-500" />}
                    {change.status === 'rejected' && <X className="h-4 w-4 text-red-500" />}
                    {change.status === 'pending' && (
                      <div className="h-4 w-4 rounded-full bg-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{change.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(change.createdAt).toLocaleDateString()} • {change.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Created: {new Date(feature.created_at).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onUpdate(feature.id, {})}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => console.log('View details', feature.id)}>
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export const CreateFeatureDialog = ({ onSubmit, title, description }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(null)

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
          {title || 'New Feature'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create {title || 'New Feature'}</DialogTitle>
            <DialogDescription>
              {description || 'Add a new feature to the product management system.'}
            </DialogDescription>
          </DialogHeader>

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
              <label className="text-right font-medium col-span-1">Type</label>
              <div className="col-span-3 flex gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="hardware" name="hardware" className="mr-2" />
                  <label htmlFor="hardware">Hardware</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="software" name="software" className="mr-2" />
                  <label htmlFor="software">Software</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Priority</label>
              <Select name="priority" defaultValue="3">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Critical</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium col-span-1">Product</label>
              <Select name="product">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Product 4</SelectItem>
                  <SelectItem value="9">Product 9</SelectItem>
                  <SelectItem value="12">Product 12</SelectItem>
                </SelectContent>
              </Select>
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

export default FeatureManagementPortal
