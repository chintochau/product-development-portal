import React, { memo, useState, useCallback } from 'react'
import { TableCell, TableRow } from '../../../../components/ui/table'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { Label } from '../../../../components/ui/label'
import { Badge } from '../../../../components/ui/badge'
import { Card } from '../../../../components/ui/card'
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar'
import { 
  Check, 
  X, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileEdit,
  Calendar,
  Trash2
} from 'lucide-react'
import { useTickets } from '../../contexts/ticketsContext'
import { useUser } from '../../contexts/userContext'
import { WithPermission } from '../../contexts/permissionContext'
import dayjs from 'dayjs'
import { cn } from '../../../../lib/utils'

interface ChangeRequestRowProps {
  change: any
  changeIndex: number
  feature: any
  onStatusChange: (status: string) => void
}

const statusConfig = {
  pending: { 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: Clock,
    label: 'Pending Review'
  },
  approved: { 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: CheckCircle,
    label: 'Approved'
  },
  rejected: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    label: 'Rejected'
  },
  draft: { 
    color: 'bg-slate-100 text-slate-800 border-slate-200', 
    icon: FileEdit,
    label: 'Draft'
  }
}

export const ChangeRequestRow = memo<ChangeRequestRowProps>(({ 
  change, 
  changeIndex, 
  feature,
  onStatusChange 
}) => {
  const { loading, setLoading, setShouldRefresh } = useTickets()
  const { user } = useUser()
  
  const [title, setTitle] = useState(change.title || '')
  const [description, setDescription] = useState(change.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const config = statusConfig[change.status as keyof typeof statusConfig]
  const StatusIcon = config.icon
  const isDraft = change.status === 'draft'
  const isPending = change.status === 'pending'
  const isAuthor = change.createdBy === user?.name

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setLoading(true)
    
    try {
      const updatedChanges = feature.changes.map((c: any, i: number) =>
        i === changeIndex 
          ? { ...c, title: title.trim(), description: description.trim(), status: 'pending' }
          : c
      )
      
      await window.api.features.update(feature.id, { changes: updatedChanges })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to submit change request:', error)
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }, [title, description, isSubmitting, changeIndex, feature, setLoading, setShouldRefresh])

  const handleDelete = useCallback(async () => {
    if (loading || !window.confirm('Are you sure you want to delete this change request?')) return
    
    setLoading(true)
    try {
      const updatedChanges = feature.changes.filter((_: any, i: number) => i !== changeIndex)
      await window.api.features.update(feature.id, { changes: updatedChanges })
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to delete change request:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, changeIndex, feature, setLoading, setShouldRefresh])

  if (isDraft) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={9} className="p-0">
          <Card className="m-4 ml-12 p-6 border-primary/10 bg-muted/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-medium">New Change Request</h4>
                <Badge variant="outline" className="ml-auto">
                  Draft
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`cr-title-${changeIndex}`} className="text-sm">
                    Title
                  </Label>
                  <Input
                    id={`cr-title-${changeIndex}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the change"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cr-desc-${changeIndex}`} className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id={`cr-desc-${changeIndex}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed explanation of what needs to be changed and why..."
                    className="min-h-[100px] resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {isAuthor && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!title.trim() || !description.trim() || isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Submit for Approval
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={9} className="p-0">
        <Card className="m-4 ml-12 p-6 border-muted">
          <div className="flex items-start gap-6">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs">
                {change.createdBy?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{change.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{change.createdBy}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dayjs(change.createdAt).format('MMM DD, YYYY')}
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={cn("gap-1", config.color)}
                >
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                  {change.description}
                </p>
              </div>

              {change.statusBy && (
                <div className="text-sm text-muted-foreground">
                  {change.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                  <span className="font-medium">{change.statusBy}</span> on{' '}
                  {dayjs(change.statusAt).format('MMM DD, YYYY')}
                </div>
              )}

              {isPending && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onStatusChange('approved')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange('rejected')}
                    disabled={loading}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>

            <WithPermission requiredAccess={2}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={loading}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </WithPermission>
          </div>
        </Card>
      </TableCell>
    </TableRow>
  )
})

ChangeRequestRow.displayName = 'ChangeRequestRow'

export default ChangeRequestRow