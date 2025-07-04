import React, { useEffect, useState, useCallback, useMemo, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Cross,
  DraftingCompass,
  Edit,
  Loader2,
  PlusCircle,
  ThumbsUp,
  Trash,
  Trash2,
  X,
  XCircle
} from 'lucide-react'
import { useDevelopers } from '../../contexts/developerContext'
import { useTickets } from '../../contexts/ticketsContext'
import { DeveloperDropdown } from '../DeveloperPage'
import { deleteFeatureRequestIssue, updateFeatureRequestIssue } from '../../services/gitlabServices'
import ProductDropdown from './ProductDropdown'
import EstimateSlider from './EstimateSlider'
import { Textarea } from '../../../../components/ui/textarea'
import { Input } from '../../../../components/ui/input'
import PriorityDropdown from './PriorityDropdown'
import FeatureTypeSelector from './FeatureTypeSelector'
import { Badge } from '../../../../components/ui/badge'
import { usePermissions, WithPermission } from '../../contexts/permissionContext'
import { useUser } from '../../contexts/userContext'
import { Label } from '../../../../components/ui/label'
import dayjs from 'dayjs'
import NewTicketPopover from '../NewTicketPopover'
import { useNavigate } from 'react-router-dom'

const FeatureRow = memo(({ feature, index }) => {
  const { developers } = useDevelopers()
  const { setShouldRefresh, setLoading, loading, setSelectedTicket } = useTickets()
  const [showStatusBar, setShowStatusBar] = useState(false)
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [ticketUrl, setTicketUrl] = useState(feature?.ticket || '')
  const navigate = useNavigate()

  const {
    isAdhoc,
    changes,
    assignee_ids,
    id,
    product: initialProduct,
    priority: initialPriority,
    type: initialType
  } = feature || {}
  const hasChanges = changes?.length > 0
  const [openChangeList, setOpenChangeList] = useState(false)

  const [title, setTitle] = useState(feature?.title)
  const [description, setDescription] = useState(feature?.description)
  const [product, setProduct] = useState(initialProduct)
  const [priority, setPriority] = useState(initialPriority)
  const [type, setType] = useState(initialType)

  const { user } = useUser()

  // Memoize expensive calculations
  const developersList = useMemo(
    () => developers.filter((dev) => assignee_ids?.find((assignee) => assignee === dev.id)),
    [developers, assignee_ids]
  )

  const changeStats = useMemo(() => {
    let pendingChange = 0,
      approvedChange = 0,
      rejectedChange = 0

    if (changes && changes.length > 0) {
      changes.forEach((change) => {
        if (change.status === 'pending') pendingChange++
        else if (change.status === 'approved') approvedChange++
        else if (change.status === 'rejected') rejectedChange++
      })
    }

    return { pendingChange, approvedChange, rejectedChange }
  }, [changes])

  const isSelected = useCallback(
    (id) => {
      return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
    },
    [selectedDevelopers]
  )

  const updateAssignees = useCallback(async () => {
    if (selectedDevelopers.length === 0) return

    setLoading(true)
    try {
      await updateFeatureRequestIssue(
        id,
        {
          ...feature,
          assignee_ids: selectedDevelopers.map((dev) => dev.id)
        },
        isAdhoc ? 3 : 1
      )
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to update assignees:', error)
    } finally {
      setLoading(false)
    }
  }, [id, feature, selectedDevelopers, isAdhoc, setLoading, setShouldRefresh])

  const handleDeleteTicket = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await deleteFeatureRequestIssue(id, isAdhoc ? 3 : 1)
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to delete ticket:', error)
    }
  }, [id, isAdhoc, loading, setLoading, setShouldRefresh])

  const handleClosingTicket = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await updateFeatureRequestIssue(id, { ...feature, archived: true }, isAdhoc ? 3 : 1)
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to close ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [id, feature, isAdhoc, loading, setLoading, setShouldRefresh])

  const handleEstimateChange = useCallback(
    async (value) => {
      if (loading) return

      setLoading(true)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            estimate: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update estimate:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const handleDateChange = useCallback(
    async (value) => {
      if (loading) return

      setLoading(true)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            startDate: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update date:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const saveEditing = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      await updateFeatureRequestIssue(
        id,
        {
          ...feature,
          title,
          description
        },
        isAdhoc ? 3 : 1
      )
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save edits:', error)
    } finally {
      setLoading(false)
    }
  }, [id, feature, title, description, isAdhoc, loading, setLoading])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setTitle(feature?.title)
    setDescription(feature?.description)
  }, [feature])

  const handleTicketChange = useCallback(
    async (value) => {
      if (loading || !value) return

      setLoading(true)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            ticket: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update ticket:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const handleProductChange = useCallback(
    async (value) => {
      if (loading) return

      setLoading(true)
      setProduct(value)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            product: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update product:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const handlePriorityChange = useCallback(
    async (value) => {
      if (loading) return

      setLoading(true)
      setPriority(value)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            priority: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update priority:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const handleTypeChange = useCallback(
    async (value) => {
      if (loading) return

      setLoading(true)
      setType(value)
      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            type: value
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update type:', error)
      }
    },
    [id, feature, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const handleChangeRequestStatus = useCallback(
    async (changeIndex, newStatus) => {
      if (loading) return

      setLoading(true)
      const updatedChanges = feature.changes.map((change, index) =>
        index === changeIndex
          ? {
              ...change,
              status: newStatus,
              statusBy: user?.name,
              statusAt: dayjs().format('MMM DD, YYYY')
            }
          : change
      )

      try {
        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            changes: updatedChanges
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update change request status:', error)
      }
    },
    [id, feature, user, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const createChangeRequest = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setOpenChangeList(true)
    try {
      await updateFeatureRequestIssue(
        id,
        {
          ...feature,
          changes: [
            ...(feature.changes || []),
            {
              type: 'change',
              id: Date.now(),
              status: 'draft',
              createdAt: new Date().toISOString(),
              createdBy: user?.name
            }
          ]
        },
        isAdhoc ? 3 : 1
      )
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to create change request:', error)
    }
  }, [id, feature, user, isAdhoc, loading, setLoading, setShouldRefresh])

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev)
  }, [])

  const toggleChangeList = useCallback(() => {
    setOpenChangeList((prev) => !prev)
  }, [])

  const handleDeveloperSelect = useCallback(
    (id) => {
      setSelectedDevelopers((prev) => {
        if (prev.findIndex((dev) => dev.id === id) !== -1) {
          return prev.filter((dev) => dev.id !== id)
        } else {
          return [...prev, developers.find((dev) => dev.id === id)]
        }
      })
    },
    [developers]
  )

  const { pendingChange, approvedChange, rejectedChange } = changeStats

  return (
    <>
      <TableRow className="group hover:bg-muted/10 transition-colors border-b border-muted">
        <TableCell className="py-4">
          <div className="flex items-center justify-between gap-4">
            {isEditing ? (
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full resize-none font-medium focus:ring-2 focus:ring-primary rounded-lg p-3"
                    autoHeight
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[100px] resize-none focus:ring-2 focus:ring-primary rounded-lg p-3"
                    autoHeight
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={saveEditing}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    className="gap-2 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-2">
                  {feature.archived && (
                    <p className="text-sm text-muted-foreground">
                      Archived : {dayjs(feature.updatedAt).format('MMM DD, YYYY')}
                    </p>
                  )}
                  <h3 
                    className="font-semibold text-primary/90 capitalize cursor-pointer hover:text-primary hover:underline"
                    onClick={() => {
                      setSelectedTicket(feature)
                      navigate(`/features/${feature.id || feature.iid}`)
                    }}
                  >
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                  )}

                  {hasChanges && (
                    <div
                      className="flex items-center gap-2 mt-2 w-fit hover:bg-muted/50 rounded-full px-3 py-1 transition-colors cursor-pointer"
                      onClick={toggleChangeList}
                    >
                      <Badge variant="outline" className="border-muted-foreground/30">
                        Change Requests
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm">
                        {approvedChange > 0 && (
                          <span className="text-emerald-600">{approvedChange} Approved</span>
                        )}
                        {pendingChange > 0 && (
                          <span className="text-amber-600">{pendingChange} Pending</span>
                        )}
                        {rejectedChange > 0 && (
                          <span className="text-red-600">{rejectedChange} Rejected</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleEditing}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>

        {/* Product Column */}
        {!isAdhoc && (
          <TableCell>
            <ProductDropdown product={product} setProduct={handleProductChange} />
          </TableCell>
        )}
        <TableCell className="font-medium">
          <DeveloperDropdown
            showStatusBar={showStatusBar}
            setShowStatusBar={setShowStatusBar}
            selectedDevelopers={developersList}
            selectDeveloper={handleDeveloperSelect}
            isSelected={isSelected}
            onClick={updateAssignees}
            loading={loading}
          >
            <div className="cursor-pointer hover:underline flex-col flex">
              {assignee_ids && assignee_ids.length ? (
                developersList.map((dev) => <p key={dev.id}>{dev.name}</p>)
              ) : (
                <p className="text-gray-500">Select</p>
              )}
            </div>
          </DeveloperDropdown>
        </TableCell>

        {/* Estimate Column */}
        <TableCell>
          <EstimateSlider
            days={feature?.estimate}
            setDays={handleEstimateChange}
            startDate={feature?.startDate}
            setStartDate={handleDateChange}
          />
        </TableCell>

        {/* Priority Column */}
        {!isAdhoc && (
          <TableCell>
            <PriorityDropdown priority={priority} setPriority={handlePriorityChange} />
          </TableCell>
        )}

        {/* Type Column */}
        <TableCell>
          <FeatureTypeSelector type={type} handleTypeChange={handleTypeChange} rowIndex={index} />
        </TableCell>

        {/* Ticket Column */}
        <TableCell className="w-40">
          {feature.ticket && !isEditing ? (
            <Button
              variant="link"
              className="text-primary hover:no-underline px-0"
              onClick={() => window.open(feature.ticket, '_blank')}
            >
              #{feature.ticket.split('/').pop()}
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleTicketChange(ticketUrl)
              }}
            >
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <Input
                    value={ticketUrl}
                    onChange={(e) => setTicketUrl(e.target.value)}
                    placeholder="Ticket URL"
                    className="flex-1"
                  />
                  <NewTicketPopover
                    context={{
                      title: feature.title,
                      description: description,
                      priority: feature.priority,
                      productId: feature.product
                    }}
                    onCreated={(ticketUrl) => {
                      console.log('onCreated', ticketUrl)
                      setTicketUrl(ticketUrl)
                      handleTicketChange(ticketUrl)
                    }}
                  />
                </div>
                <Button size="icon" className="shrink-0" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          )}
        </TableCell>

        {/* Actions Column */}
        {!isAdhoc && (
          <TableCell>
            <Button
              variant="outline"
              className="text-primary border-primary/50 hover:border-primary hover:text-primary"
              onClick={createChangeRequest}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '+ Change'}
            </Button>
          </TableCell>
        )}

        <TableCell>
          <WithPermission requiredAccess={2}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-600 hover:bg-green-50"
                  onClick={handleClosingTicket}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleDeleteTicket}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </WithPermission>
        </TableCell>
      </TableRow>

      {/* Change Request Rows */}
      {hasChanges &&
        openChangeList &&
        feature?.changes?.map((change, index) => (
          <ChangeRequestRow
            key={`change-${index}-${id}`}
            change={change}
            onChangeStatus={(status) => handleChangeRequestStatus(index, status)}
            changeIndex={index}
            feature={feature}
          />
        ))}
    </>
  )
})

// Memoize the ChangeRequestRow component to prevent unnecessary re-renders
const ChangeRequestRow = memo(({ change, onChangeStatus, feature, changeIndex }) => {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
    approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    draft: { color: 'bg-slate-100 text-slate-800', icon: DraftingCompass }
  }[change.status]

  const [title, setTitle] = useState(change.title || '')
  const [description, setDescription] = useState(change.description || '')
  const { id, isAdhoc } = feature || {}
  const { loading, setLoading, setShouldRefresh } = useTickets()
  const { user } = useUser()

  const StatusIcon = statusConfig.icon
  const isDraft = change.status === 'draft'
  const isPending = change.status === 'pending'
  const isAuthor = change.createdBy === user?.name

  const handleChangeRequestUpdate = useCallback(
    async (data) => {
      if (loading) return

      setLoading(true)
      try {
        const updatedChanges = feature.changes.map((change, index) =>
          index === changeIndex ? { ...change, ...data } : change
        )

        await updateFeatureRequestIssue(
          id,
          {
            ...feature,
            changes: updatedChanges
          },
          isAdhoc ? 3 : 1
        )
        setShouldRefresh(true)
      } catch (error) {
        console.error('Failed to update change request:', error)
      }
    },
    [id, feature, changeIndex, isAdhoc, loading, setLoading, setShouldRefresh]
  )

  const submitChangeRequest = useCallback(async () => {
    await handleChangeRequestUpdate({
      title,
      description,
      status: 'pending'
    })
  }, [handleChangeRequestUpdate, title, description])

  const handleChangeRequestDelete = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const updatedChanges = feature.changes.filter((_, index) => index !== changeIndex)
      await updateFeatureRequestIssue(id, { ...feature, changes: updatedChanges }, isAdhoc ? 3 : 1)
      setShouldRefresh(true)
    } catch (error) {
      console.error('Failed to delete change request:', error)
    }
  }, [id, feature, changeIndex, isAdhoc, loading, setLoading, setShouldRefresh])

  return (
    <TableRow className="group hover:bg-muted/20 transition-colors border-b border-muted">
      <TableCell colSpan={9} className="py-4 pl-12">
        <div className="flex flex-col gap-4">
          {isDraft ? (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-lg">Change Request Draft</h3>
                <span className="text-sm text-muted-foreground">by {user?.name}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter change request title"
                    className="w-full focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the requested changes"
                    className="w-full min-h-[100px] focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                {isAuthor && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={submitChangeRequest}
                      disabled={loading}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Submit for Approval
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleChangeRequestDelete}
                      disabled={loading}
                      className="gap-2 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Discard Draft
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-6">
              <div className="flex-1 grid grid-cols-[140px_1fr_160px] gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {dayjs(change.createdAt).format('MMM DD, YYYY')}
                    </span>
                  </div>
                  <span className="text-sm font-medium block mt-1">{change.createdBy}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-primary/90">{change.title}</h4>
                  <div className="prose prose-sm max-w-none max-h-40 overflow-y-auto bg-muted/30 rounded-lg p-4">
                    {change.description}
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className={`${statusConfig.color} inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    <span className="capitalize">{change.status}</span>
                  </div>
                  {change.statusBy && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>By {change.statusBy}</p>
                      <p>{dayjs(change.statusAt).format('MMM DD, YYYY')}</p>
                    </div>
                  )}
                </div>
              </div>

              {isPending && (
                <div className="flex flex-col gap-2 min-w-[160px]">
                  <Button
                    onClick={() => onChangeStatus('approved')}
                    disabled={loading}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onChangeStatus('rejected')}
                    disabled={loading}
                    className="gap-2 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              <WithPermission requiredAccess={2}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleChangeRequestDelete}
                  disabled={loading}
                  className="text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </WithPermission>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
})

FeatureRow.displayName = 'FeatureRow'
ChangeRequestRow.displayName = 'ChangeRequestRow'

export default FeatureRow
