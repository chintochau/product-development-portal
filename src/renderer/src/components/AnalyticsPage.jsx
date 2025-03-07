import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import { getNameForProject } from '../services/gitlabServices'
import FrameWraper from './frameWarper'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../../../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { timeAgo } from '../../../lib/utils'
import { ChartBarIcon, ListIcon } from 'lucide-react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import PlanningDetail from './analytics-page-components/PlanningDetail'
import { useAnalytics } from '../contexts/analyticsContext'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const AnalyticsPage = () => {
  const { setSelectedPlan, allMilestones, selectedPlan } = useAnalytics()
  const [activeView, setActiveView] = useState('milestones') // "milestones" or "details"

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    setActiveView('details')
  }
  return (
    <FrameWraper>
      <div className="px-2">
        <div className="sticky top-7 z-50 bg-background flex items-center justify-between">

          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          {selectedPlan && (
            <div className="flex gap-2 items-center">

              <Button
                variant={activeView === 'milestones' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('milestones')}
                className="gap-2"
              >
                <ListIcon size={16} />
                Milestones
              </Button>

              <Button
                variant={activeView === 'details' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('details')}
                className="gap-2"
              >
                <ChartBarIcon size={16} />
                Plan Details
              </Button>

            </div>
          )}
        </div>


        <div className="grid gap-6">
          <AnimatePresence mode="wait">
            {activeView === 'milestones' || !selectedPlan ? (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMilestones?.length > 0 ? (
                      allMilestones.sort((a, b) => dayjs(b.updated_at).isAfter(dayjs(a.updated_at)) ? 1 : -1).map((issue) => (
                        <MilestoneRow
                          key={issue.id}
                          issue={issue}
                          onClick={handlePlanSelect}
                          isSelected={selectedPlan?.id === issue.id}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          No milestones available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            ) : selectedPlan && activeView === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <PlanningDetail />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </FrameWraper>
  )
}

export default AnalyticsPage

const MilestoneRow = ({ issue, onClick, isSelected }) => (
  <TableRow
    className={`cursor-pointer transition-all duration-150 border-b hover:bg-muted/50 
      ${isSelected ? 'bg-primary/10 border-primary' : 'border-border'}`}
    onClick={() =>
      onClick({
        milestoneId: issue.id,
        milestoneProjectId: issue.project_id
      })
    }
  >
    <TableCell className="py-2 px-3 font-medium text-foreground">
      <span className="text-xs text-muted-foreground">{getNameForProject(issue.project_id)}</span>  
      <span className="text-sm">{issue.title}</span> 
    </TableCell>
    
    <TableCell className="py-2 px-3 text-xs text-muted-foreground">
      {timeAgo(issue.created_at)}
    </TableCell>
    
    <TableCell className="py-2 px-3 text-xs text-muted-foreground">
      {timeAgo(issue.updated_at)}
    </TableCell>
  </TableRow>
)