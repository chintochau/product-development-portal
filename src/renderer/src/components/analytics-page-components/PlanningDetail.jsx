import React, { useEffect, useState, forwardRef, useRef } from 'react'
import {
  createMilestonePlanningIssue,
  getIssuesFromMilestone,
  getLabelsFromTicket,
  getMilestonePlanningIssues,
  getNameForProject,
  getNotesFromTicket,
  updateMilestonePlanningIssue
} from '../../services/gitlabServices'
import FrameWraper from '../frameWarper'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { useSingleProduct } from '../../contexts/singleProductContext'

import frontMatter from 'front-matter'
import { cn, getColorForAuthor, timeAgo } from '@/lib/utils'
import { StatusComponent } from '../TicketPage'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ProjectAnalytics from './ProjectAnalytics'
import { MilestoneChart } from '../project-page/ProjectsPage'
import { Input } from '../../../../components/ui/input'
import { useAnalytics } from '../../contexts/analyticsContext'
import { Clock, ExternalLink, GitCommit, User } from 'lucide-react'
import AnalyticsTicketRow from './AnalyticsTicketRow'

const PlanningDetail = () => {
  const { allMilestones: milestones, selectedPlan, tickets, currentStatus } = useAnalytics()
  const { milestoneProjectId, milestoneId } = selectedPlan || {}
  const [shouldRefresh, setShouldRefresh] = useState(true)

  const [statusFilter, setStatusFilter] = useState(null) // "open", "closed", or null
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')

  const childRefs = useRef([])
  const handleSaveAll = async () => {
    // Filter out null or undefined refs and collect analytics data
    const allAnalyticsData = childRefs.current
      .filter((ref) => ref !== null && ref !== undefined)
      .map((ref) => {
        const { ticket, getAnalyticsData } = ref || {}
        const { iid, project_id, title, assignee } = ticket || {}

        return {
          iid,
          project_id,
          title,
          analytics: getAnalyticsData()
        }
      })
    const response = await updateMilestonePlanningIssue(selectedPlan.id, {
      milestoneProjectId,
      milestoneId,
      tickets: allAnalyticsData
    })
    setShouldRefresh(true)
  }

  if (!selectedPlan) {
    return null
  }

  const milestoneName =
    getNameForProject(milestoneProjectId) +
    milestones.find((milestone) => milestone.id === milestoneId)?.title

  const handleStatusToggle = (status) => {
    setStatusFilter((prev) => (prev === status ? null : status))
  }

  const filterFunction = (ticket) => {
    // Status filter
    if (statusFilter && ticket.state !== statusFilter) return false

    // Assignee filter
    // Assignee filter
    if (
      assigneeFilter.trim() &&
      !ticket.assignee?.name?.toLowerCase().startsWith(assigneeFilter.trim().toLowerCase())
    ) {
      return false
    }

    // Label filter
    if (labelFilter && !ticket.labels?.some((label) => label?.includes(labelFilter))) return false

    // Commits check
    return ticket
  }

  const filteredTickets = tickets.filter(filterFunction)

  return (
    <div className="px-4 space-y-2 py-4">
      <h2 className="text-2xl">Milestone: {milestoneName}</h2>
      <ProjectAnalytics tickets={tickets} />
      <div className="flex items-center gap-2">
        <RadioGroup
          className="flex items-center gap-2"
          value={statusFilter}
          onValueChange={handleStatusToggle}
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value={null} id="all" />
            <Label htmlFor="all">All</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="opened" id="opened" />
            <Label htmlFor="opened">Opened</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="closed" id="closed" />
            <Label htmlFor="closed">Closed</Label>
          </div>
        </RadioGroup>
        <Input
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          placeholder="Filter by assignee"
        />
        <Input
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          placeholder="Filter by label"
        />
      </div>
      <div>
        <Table frameClassName="min-h-[calc(100vh-100px)]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-6">id</TableHead>
              <TableHead className="w-40">title</TableHead>
              <TableHead className="w-96">Commits</TableHead>
              <TableHead className="w-10">status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStatus && (
              <TableRow>
                <TableCell colSpan={4}>{currentStatus}</TableCell>
              </TableRow>
            )}
            {filteredTickets
              .sort((a, b) => b.analytics?.totalCommits - a.analytics?.totalCommits)
              .map((ticket, index) => (
                <AnalyticsTicketRow
                  key={ticket.iid}
                  ticket={ticket}
                  ref={(el) => (childRefs.current[index] = el)}
                />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default PlanningDetail
