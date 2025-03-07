import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import {
  createMilestonePlanningIssue,
  getIssuesFromMilestone,
  getLabelsFromTicket,
  getMilestonePlanningIssues,
  getNameForProject,
  getNotesFromTicket,
  updateMilestonePlanningIssue
} from '../services/gitlabServices'
import FrameWraper from './frameWarper'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../../../components/ui/table'
import { Button } from '../../../components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../../components/ui/select'
import { useSingleProduct } from '../contexts/singleProductContext'

import frontMatter from 'front-matter'
import { getColorForAuthor, timeAgo } from '../../../lib/utils'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import PlanningDetail from './analytics-page-components/PlanningDetail'
import { useAnalytics } from '../contexts/analyticsContext'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const AnalyticsPage = () => {
  const [issues, setIssues] = useState([])

  const { selectedPlan, setSelectedPlan } = useAnalytics()

  const getMilestonePlanning = async () => {
    const response = await getMilestonePlanningIssues()
    setIssues(
      response?.map((item) => {
        const attributes = frontMatter(item.body).attributes
        return { ...item, ...attributes, iid: item.iid, url: item.web_url }
      })
    )
  }

  useEffect(() => {
    getMilestonePlanning()
  }, [])
  const createPlanning = () => {
    const response = createMilestonePlanningIssue()
  }

  return (
    <FrameWraper>
      <div className="px-4">
        <h2 className="text-2xl">Analytics</h2>
        <Button onClick={createPlanning}>Create</Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Plan</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <PlanningRow key={issue.id} issue={issue} setSelectedPlan={setSelectedPlan} />
            ))}
          </TableBody>
        </Table>
      </div>

      <PlanningDetail/>
    </FrameWraper>
  )
}

export default AnalyticsPage

const PlanningRow = ({ issue, setSelectedPlan }) => {
  const { allMilestones } = useAnalytics()

  const sortedMilestones = allMilestones?.sort((a, b) => a.project_id - b.project_id)
  const [selectedMilestone, setSelectedMilestone] = useState(issue.milestoneId)

  const udpatePlanInfo = async (noteId, milestoneId) => {
    setSelectedMilestone(milestoneId)

    const milestoneInfo = allMilestones.find((milestone) => milestone.id === milestoneId)

    const response = await updateMilestonePlanningIssue(noteId, {
      milestoneProjectId: milestoneInfo.project_id,
      milestoneId: milestoneInfo.id
    })
  }

  return (
    <TableRow key={issue.id} onClick={() => setSelectedPlan(issue)} className="cursor-pointer">
      <TableCell className="font-medium">
        <Select
          onValueChange={(value) => udpatePlanInfo(issue.id, value)}
          value={selectedMilestone}
        >
          <SelectTrigger className="w-[180px] border-0 hover:underline">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null} className="text-muted-foreground">
              -
            </SelectItem>
            {sortedMilestones?.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                <div className="flex items-center">
                  <p className="text-muted-foreground">{getNameForProject(milestone.project_id)}</p>
                  <p>{milestone.title}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="font-medium">{issue.created_at.split('T')[0]}</TableCell>
      <TableCell className="font-medium">{timeAgo(issue.updated_at)}</TableCell>
    </TableRow>
  )
}
