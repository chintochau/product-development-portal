import React, { useEffect, useState } from 'react'
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
import { Calendar, Check, CheckCircle, Clock, Cross, DraftingCompass, Edit, Loader2, PlusCircle, ThumbsUp, Trash, Trash2, X, XCircle } from 'lucide-react'
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

function FeatureRow({ feature, index }) {
  const { developers } = useDevelopers()
  const { setShouldRefresh, setLoading,loading } = useTickets()
  const [showStatusBar, setShowStatusBar] = useState(false)
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [ticketUrl, setTicketUrl] = useState(feature?.ticket || '')

  const { isAdhoc, changes } = feature || {}
  const hasChanges = changes?.length > 0
  const [openChangeList, setOpenChangeList] = useState(false)

  const { assignee_ids, id } = feature || {}
  const [title, setTitle] = useState(feature?.title)
  const [description, setDescription] = useState(feature?.description)

  const [product, setProduct] = useState(feature?.product)
  const [priority, setPriority] = useState(feature?.priority)
  const [type, setType] = useState(feature?.type)

  const { user } = useUser()

  const isSelected = (id) => {
    return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
  }

  const updateAssignees = async () => {
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        assignee_ids: selectedDevelopers.map((dev) => dev.id)
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }
  const handleDeleteTicket = async () => {
    setLoading(true)
    const response = await deleteFeatureRequestIssue(id, isAdhoc ? 3 : 1)
    setShouldRefresh(true)
  }

  const handleEstimateChange = async (value) => {
    setLoading(true)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        estimate: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const developersList = developers.filter((dev) =>
    assignee_ids?.find((assignee) => assignee === dev.id)
  )

  const handleDateChange = async (value) => {
    setLoading(true)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        startDate: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const saveEditing = async () => {
    setIsEditing(!isEditing)
    setLoading(true)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        title,
        description
      },
      isAdhoc ? 3 : 1
    )
    setLoading(false)
  }

  const cancelEditing = () => {
    setIsEditing(!isEditing)
    setTitle(feature?.title)
    setDescription(feature?.description)
  }

  const handleTicketChange = async (value) => {
    setLoading(true)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        ticket: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const handleProductChange = async (value) => {
    setLoading(true)
    setProduct(value)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        product: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const handlePriorityChange = async (value) => {
    setLoading(true)
    setPriority(value)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        priority: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const handleTypeChange = async (value) => {
    setLoading(true)
    setType(value)
    const response = await updateFeatureRequestIssue(
      id,
      {
        ...feature,
        type: value
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  const handleChangeRequestStatus = async (changeIndex, newStatus) => {
    setLoading(true)
    const updatedChanges = feature.changes.map((change, index) =>
      index === changeIndex
        ? { ...change, status: newStatus, statusBy: user?.name, statusAt: dayjs().format("MMM DD, YYYY") }
        : change
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
  }

  const createChangeRequest = async () => {
    setLoading(true)
    setOpenChangeList(true)
    const response = await updateFeatureRequestIssue(
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
            createdBy: user?.name // Replace with actual user context
          }
        ]
      },
      isAdhoc ? 3 : 1
    )
    setShouldRefresh(true)
  }

  let pendingChange = 0,
    approvedChange = 0,
    rejectedChange = 0

  if (feature?.changes && feature.changes.length > 0) {
    feature.changes.forEach((change) => {
      if (change.status === 'pending') {
        pendingChange++
      } else if (change.status === 'approved') {
        approvedChange++
      } else if (change.status === 'rejected') {
        rejectedChange++
      }
    })
  }

  
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
                  >
                    <Check className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    className="gap-2 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-primary/90 capitalize">{title}</h3>
                  {description &&<p className="text-sm text-muted-foreground line-clamp-2">
                    {description }
                  </p>}
                  
                  {hasChanges && (
                    <div 
                      className="flex items-center gap-2 mt-2 w-fit hover:bg-muted/50 rounded-full px-3 py-1 transition-colors cursor-pointer"
                      onClick={() => setOpenChangeList(!openChangeList)}
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
                  onClick={() => setIsEditing(!isEditing)}
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
            selectedDevelopers={developers.filter((dev) =>
              assignee_ids?.find((assignee) => assignee.id === dev.id)
            )}
            selectDeveloper={(id) => {
              if (isSelected(id)) {
                setSelectedDevelopers(selectedDevelopers.filter((dev) => dev.id !== id))
              } else {
                setSelectedDevelopers([
                  ...selectedDevelopers,
                  developers.find((dev) => dev.id === id)
                ])
              }
            }}
            isSelected={isSelected}
            onClick={() => {
              updateAssignees()
            }}
            loading={false}
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
          <FeatureTypeSelector 
            type={type} 
            handleTypeChange={handleTypeChange} 
            rowIndex={index} 
          />
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
            <form onSubmit={(e) => { e.preventDefault(); handleTicketChange(ticketUrl) }}>
              <div className="flex gap-2">
                <Input
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="Ticket URL"
                  className="flex-1"
                />
                <Button size="icon" className="shrink-0">
                  <Check className="h-4 w-4" />
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
              + Change
            </Button>
          </TableCell>
        )}

        <TableCell>
          <WithPermission requiredAccess={2}>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:bg-red-50"
              onClick={handleDeleteTicket}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </WithPermission>
        </TableCell>
      </TableRow>

      {/* Change Request Rows */}
      {hasChanges && openChangeList && feature?.changes?.map((change, index) => (
        <ChangeRequestRow
          key={index}
          change={change}
          onChangeStatus={(status) => handleChangeRequestStatus(index, status)}
          changeIndex={index}
          feature={feature}
        />
      ))}
    </>
  )
}

export default FeatureRow

// ChangeRequestRow Component


const ChangeRequestRow = ({ change, onChangeStatus, feature, changeIndex }) => {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
    approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    draft: { color: 'bg-slate-100 text-slate-800', icon: DraftingCompass }
  }[change.status];

  const [title, setTitle] = useState(change.title);
  const [description, setDescription] = useState(change.description);
  const { id, isAdhoc } = feature || {};
  const { loading, setLoading, setShouldRefresh } = useTickets();
  const { user } = useUser();

  const handleChangeRequestUpdate = async (data) => {

    setLoading(true)
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
  }

  const submitChangeRequest = async () => {
    await handleChangeRequestUpdate({
      title,
      description,
      status: 'pending'
    })
  }

  const handleChangeRequestDelete = async () => {
    setLoading(true)
    const updatedChanges = feature.changes.filter((_, index) => index !== changeIndex)
    await updateFeatureRequestIssue(id, { ...feature, changes: updatedChanges }, isAdhoc ? 3 : 1)
    setShouldRefresh(true)
  }

  const isDraft = change.status === 'draft'
  const isPending = change.status === 'pending'
  const isAuthor = change.createdBy === user?.name

  return (
    <TableRow className="group hover:bg-muted/20 transition-colors border-b border-muted">
      <TableCell colSpan={9} className="py-4 pl-12">
        <div className="flex flex-col gap-4">
          {isDraft ? (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <statusConfig.icon className="h-5 w-5 text-slate-500" />
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
                      <Check className="h-4 w-4" />
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
                      {dayjs(change.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <span className="text-sm font-medium block mt-1">
                    {change.createdBy}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-primary/90">{change.title}</h4>
                  <div className="prose prose-sm max-w-none max-h-40 overflow-y-auto bg-muted/30 rounded-lg p-4">
                    {change.description}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`${statusConfig.color} inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm`}>
                    <statusConfig.icon className="h-4 w-4" />
                    <span className="capitalize">{change.status}</span>
                  </div>
                  {change.statusBy && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>By {change.statusBy}</p>
                      <p>{dayjs(change.statusAt).format("MMM DD, YYYY")}</p>
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
                    <Check className="h-4 w-4" />
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
}