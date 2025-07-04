import React, { memo, useCallback, useState } from 'react'
import { TableCell, TableRow } from '../../../../components/ui/table'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Check,
  Clock,
  Users,
  Calendar,
  Link,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../../contexts/ticketsContext'
import { useUser } from '../../contexts/userContext'
import { WithPermission } from '../../contexts/permissionContext'
// import type { Feature } from '@/@types/models/feature.types'
import ProductDropdown from './ProductDropdown'
import PriorityDropdown from './PriorityDropdown'
import FeatureTypeSelector from './FeatureTypeSelector'
import EstimateSlider from './EstimateSlider'
import { DeveloperDropdown } from '../DeveloperPage'
import { useDevelopers } from '../../contexts/developerContext'
import dayjs from 'dayjs'
import { cn } from '../../../../lib/utils'
import FeatureEditRow from './FeatureEditRow'
import ChangeRequestRow from './ChangeRequestRow'

interface FeatureRowProps {
  feature: any // TODO: Update to proper GitLab feature type
  index: number
}

// Separate component for feature title and description display
const FeatureContent = memo(({ 
  feature, 
  onEdit, 
  onNavigate 
}: { 
  feature: any
  onEdit: () => void
  onNavigate: () => void
}) => {
  const { title, description, archived, updatedAt } = feature

  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="flex-1 min-w-0">
        {archived && (
          <Badge variant="secondary" className="mb-2">
            Archived • {dayjs(updatedAt).format('MMM DD, YYYY')}
          </Badge>
        )}
        <h3 
          className={cn(
            "font-medium text-foreground line-clamp-2",
            "cursor-pointer hover:text-primary transition-colors",
            "group-hover:underline underline-offset-2"
          )}
          onClick={onNavigate}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  )
})

FeatureContent.displayName = 'FeatureContent'

// Separate component for change request badges
const ChangeRequestBadges = memo(({ 
  changes, 
  onClick 
}: { 
  changes: any[]
  onClick: () => void
}) => {
  if (!changes?.length) return null

  const stats = changes.reduce((acc, change) => {
    acc[change.status] = (acc[change.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div 
      className={cn(
        "flex items-center gap-2 mt-2",
        "cursor-pointer hover:opacity-80 transition-opacity"
      )}
      onClick={onClick}
    >
      <Badge variant="outline" className="text-xs">
        Change Requests
      </Badge>
      {stats.approved > 0 && (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
          {stats.approved} approved
        </Badge>
      )}
      {stats.pending > 0 && (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
          {stats.pending} pending
        </Badge>
      )}
      {stats.rejected > 0 && (
        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
          {stats.rejected} rejected
        </Badge>
      )}
    </div>
  )
})

ChangeRequestBadges.displayName = 'ChangeRequestBadges'

// Main FeatureRow component
export const FeatureRow = memo<FeatureRowProps>(({ feature, index }) => {
  const navigate = useNavigate()
  const { setSelectedTicket, setShouldRefresh, setLoading, loading } = useTickets()
  const { developers } = useDevelopers()
  const { user } = useUser()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showChangeRequests, setShowChangeRequests] = useState(false)
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [showStatusBar, setShowStatusBar] = useState(false)

  const { 
    id, 
    title, 
    description, 
    product: initialProduct, 
    priority: initialPriority,
    type: initialType,
    assignee_ids,
    changes,
    isAdhoc,
    estimate,
    startDate,
    ticket
  } = feature

  // Optimized developer list calculation
  const assignedDevelopers = React.useMemo(
    () => developers.filter(dev => assignee_ids?.includes(dev.id)),
    [developers, assignee_ids]
  )

  const handleNavigate = useCallback(() => {
    setSelectedTicket(feature)
    navigate(`/features/${id || feature.iid}`)
  }, [feature, id, navigate, setSelectedTicket])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleEditCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleEditSave = useCallback(() => {
    setIsEditing(false)
    setShouldRefresh(true)
  }, [setShouldRefresh])

  const handleArchive = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { archived: true })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to archive feature:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleDelete = useCallback(async () => {
    if (loading || !window.confirm('Are you sure you want to delete this feature?')) return
    setLoading(true)
    try {
      await window.api.features.delete(id)
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to delete feature:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleProductChange = useCallback(async (value: string) => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { product_id: value })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update product:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handlePriorityChange = useCallback(async (value: string) => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { priority: value })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update priority:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleTypeChange = useCallback(async (value: string) => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { type: value })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update type:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleEstimateChange = useCallback(async (value: number) => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { estimate: value })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update estimate:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleDateChange = useCallback(async (value: string) => {
    if (loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, { startDate: value })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update date:', error)
    } finally {
      setLoading(false)
    }
  }, [id, loading, setLoading, setShouldRefresh])

  const handleCreateChangeRequest = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const newChange = {
        type: 'change',
        id: Date.now(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: user?.name
      }
      const updatedChanges = [...(feature.changes || []), newChange]
      await window.api.features.update(id, { changes: updatedChanges })
      setShouldRefresh(true)
      setShowChangeRequests(true)
    } catch (error) {
      console.error('Failed to create change request:', error)
    } finally {
      setLoading(false)
    }
  }, [id, feature.changes, user, loading, setLoading, setShouldRefresh])

  const handleChangeRequestStatus = useCallback(async (changeIndex: number, status: string) => {
    if (loading) return
    setLoading(true)
    try {
      const updatedChanges = feature.changes.map((change: any, index: number) =>
        index === changeIndex
          ? {
              ...change,
              status,
              statusBy: user?.name,
              statusAt: new Date().toISOString()
            }
          : change
      )
      await window.api.features.update(id, { changes: updatedChanges })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update change request status:', error)
    } finally {
      setLoading(false)
    }
  }, [id, feature.changes, user, loading, setLoading, setShouldRefresh])

  const handleDeveloperUpdate = useCallback(async () => {
    if (selectedDevelopers.length === 0 || loading) return
    setLoading(true)
    try {
      await window.api.features.update(id, {
        assignee_ids: selectedDevelopers.map((dev: any) => dev.id)
      })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update assignees:', error)
    } finally {
      setLoading(false)
    }
  }, [id, selectedDevelopers, loading, setLoading, setShouldRefresh])

  const handleDeveloperSelect = useCallback((developerId: string) => {
    setSelectedDevelopers((prev: any[]) => {
      const exists = prev.find(dev => dev.id === developerId)
      if (exists) {
        return prev.filter(dev => dev.id !== developerId)
      } else {
        const developer = developers.find(dev => dev.id === developerId)
        return developer ? [...prev, developer] : prev
      }
    })
  }, [developers])

  const isSelected = useCallback((developerId: string) => {
    return selectedDevelopers.some((dev: any) => dev.id === developerId)
  }, [selectedDevelopers])

  if (isEditing) {
    return (
      <FeatureEditRow 
        feature={feature}
        onCancel={handleEditCancel}
        onSave={handleEditSave}
      />
    )
  }

  return (
    <>
      <TableRow className="group hover:bg-muted/50 transition-colors">
        {/* Title & Description */}
        <TableCell className="py-4">
          <FeatureContent 
            feature={feature}
            onEdit={handleEdit}
            onNavigate={handleNavigate}
          />
          <ChangeRequestBadges 
            changes={changes}
            onClick={() => setShowChangeRequests(!showChangeRequests)}
          />
        </TableCell>

        {/* Product */}
        {!isAdhoc && (
          <TableCell>
            <ProductDropdown 
              product={initialProduct} 
              setProduct={handleProductChange}
            />
          </TableCell>
        )}

        {/* Developers */}
        <TableCell>
          <DeveloperDropdown
            showStatusBar={showStatusBar}
            setShowStatusBar={setShowStatusBar}
            selectedDevelopers={assignedDevelopers}
            selectDeveloper={handleDeveloperSelect}
            isSelected={isSelected}
            onClick={handleDeveloperUpdate}
            loading={loading}
          >
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
              {assignedDevelopers.length > 0 ? (
                <>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{assignedDevelopers.length}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>
          </DeveloperDropdown>
        </TableCell>

        {/* Time Estimate */}
        <TableCell>
          <EstimateSlider
            days={estimate}
            setDays={handleEstimateChange}
            startDate={startDate}
            setStartDate={handleDateChange}
          />
        </TableCell>

        {/* Priority */}
        {!isAdhoc && (
          <TableCell>
            <PriorityDropdown 
              priority={initialPriority} 
              setPriority={handlePriorityChange}
            />
          </TableCell>
        )}

        {/* Type */}
        <TableCell>
          <FeatureTypeSelector 
            type={initialType} 
            handleTypeChange={handleTypeChange}
            rowIndex={index}
          />
        </TableCell>

        {/* GitLab Ticket */}
        <TableCell>
          {ticket ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => window.open(ticket, '_blank')}
            >
              <Link className="h-4 w-4 mr-1" />
              #{ticket.split('/').pop()}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">No ticket</span>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit feature
              </DropdownMenuItem>
              {!isAdhoc && (
                <DropdownMenuItem onClick={handleCreateChangeRequest}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Create change request
                </DropdownMenuItem>
              )}
              <WithPermission requiredAccess={2}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive}>
                  <Check className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </WithPermission>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Change Request Rows */}
      {showChangeRequests && changes?.length > 0 && 
        changes.map((change: any, index: number) => (
          <ChangeRequestRow
            key={`${feature.id}-change-${index}`}
            change={change}
            changeIndex={index}
            feature={feature}
            onStatusChange={(status) => handleChangeRequestStatus(index, status)}
          />
        ))
      }
    </>
  )
})

FeatureRow.displayName = 'FeatureRow'

export default FeatureRow