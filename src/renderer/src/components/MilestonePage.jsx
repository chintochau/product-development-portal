import React, { useEffect } from 'react'
import FrameWraper from './frameWarper'
import _ from 'lodash'
import { useSingleProduct } from '../contexts/singleProductContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getGroupIssuesWithQuery,
  getIssuesFromMilestone,
  getNameForProject
} from '../services/gitlabServices'
import { MilestoneChart } from './project-page/ProjectsPage'

const MilestonePage = () => {
  const { milestones } = useSingleProduct()
  const avaiableMilestones = milestones.filter((milestone) => milestone.due_date)

  const [selectedMilestone, setSelectedMilestone] = React.useState(null)

  return (
    <FrameWraper>
      <div className="grid grid-cols-4 gap-4 p-4">
        {avaiableMilestones.map((milestone) => {
          return (
            <div key={milestone.id} onClick={() => setSelectedMilestone(milestone)}>
              <MilestoneCard key={milestone.id} milestone={milestone} />
            </div>
          )
        })}
      </div>
      {selectedMilestone && selectedMilestone.title}
    </FrameWraper>
  )
}

export default MilestonePage

const MilestoneCard = ({ milestone }) => {
  const [issues, setIssues] = React.useState([])

  const closedIssues = issues.filter((issue) => issue.state === 'closed')
  const openedIssues = issues.filter((issue) => issue.state === 'opened')
  return (
    <Card key={milestone.id} className="flex flex-col gap-2">
      <CardHeader>
        <CardTitle>
          {getNameForProject(milestone.project_id)} {milestone.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MilestoneChart selectedMilestone={milestone} setIssues={setIssues} />
      </CardContent>
    </Card>
  )
}
