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
import { Check, Cross, Edit, Loader2, PlusCircle, ThumbsUp, Trash, Trash2, X } from 'lucide-react'
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
      <TableRow
        onClick={async (e) => {
          e.stopPropagation()
        }}
      >
        <TableCell>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex flex-col">
                <Textarea
                  defaultValue={title}
                  className="min-h-60"
                  onChange={(e) => {
                    e.target.style.height = '1em'
                    e.target.style.height = e.target.scrollHeight + 'px'
                    setTitle(e.target.value)
                  }}
                />
                <Textarea
                  className="min-h-60"
                  defaultValue={description}
                  onChange={(e) => {
                    e.target.style.height = '1em'
                    e.target.style.height = e.target.scrollHeight + 'px'
                    setDescription(e.target.value)
                  }}
                />

                <div className="flex gap-2 px-2">
                  <div className="">
                    <Check
                      className="size-8 cursor-pointer hover:text-green-500 duration-300 transition-all"
                      onClick={saveEditing}
                    />
                  </div>
                  <div className="">
                    <X
                      className="size-8 cursor-pointer hover:text-red-500 duration-300 transition-all"
                      onClick={() => cancelEditing()}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className=" w-64 flex flex-col gap-1">
                  <p className=' capitalize font-medium'>{title}</p>
                  <p className="text-sm  text-muted-foreground line-clamp-3">{description}</p>
                  {hasChanges && (
                    <div
                      className="flex gap-1 items-center cursor-pointer group w-fit"
                      onClick={() => setOpenChangeList(!openChangeList)}
                    >
                      <Badge className="hover:bg-secondary bg-secondary">Changes</Badge>
                      <div className="flex items-center gap-2 group-hover:underline font-semibold">
                        {approvedChange > 0 && (
                          <span className="text-green-500 ">{approvedChange}</span>
                        )}
                        {pendingChange > 0 && (
                          <span className="text-[hsl(var(--alternative))]  ">{pendingChange}</span>
                        )}
                        {rejectedChange > 0 && (
                          <span className="text-red-500 ">{rejectedChange}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="size-5">
                  <Edit
                    className="cursor-pointer text-secondary hover:text-primary  duration-300 transition-all"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </div>
              </>
            )}
          </div>
        </TableCell>
        {!isAdhoc && (
          <TableCell className="font-medium">
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
        <TableCell className="font-medium">
          <EstimateSlider
            days={feature?.estimate}
            setDays={handleEstimateChange}
            startDate={feature?.startDate}
            setStartDate={handleDateChange}
          />
        </TableCell>
        {!isAdhoc && (
          <TableCell className="font-medium">
            <PriorityDropdown priority={priority} setPriority={handlePriorityChange} />
          </TableCell>
        )}
        <TableCell>
          <FeatureTypeSelector type={type} handleTypeChange={handleTypeChange} rowIndex={index} />
        </TableCell>
        <TableCell className="font-medium break-all w-20">
          {feature.ticket && !isEditing ? (
            <p
              className="text-primary hover:underline  cursor-pointer "
              onClick={() => window.open(feature.ticket, '_blank')}
            >
              #{feature.ticket && feature.ticket.split('/').pop()}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleTicketChange(ticketUrl)
              }}
              className="flex gap-1"
            >
              <Input
                className="w-20"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="gitlab"
              />
              <Button className="bg-transparent" variant="outline" size="icon">
                <Check className="size-4" />
              </Button>
            </form>
          )}
        </TableCell>

        {!isAdhoc && (
          <TableCell className="font-medium">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-blue-600 hover:bg-blue-50"
              onClick={createChangeRequest}
              disabled={loading}
            >
              Create
            </Button>
          </TableCell>
        )}

        <TableCell className="font-medium">
          <WithPermission requiredAccess={2}>
            <Trash2
              className="cursor-pointer size-4 duration-300 transition-all hover:text-red-500 text-muted-foreground"
              onClick={handleDeleteTicket}
            />
          </WithPermission>
        </TableCell>
      </TableRow>
      {hasChanges &&
        openChangeList &&
        feature?.changes?.map((change, index) => (
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
  const statusColor = {
    pending: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600'
  }[change.status]

  const [title, setTitle] = useState(change.title)
  const [description, setDescription] = useState(change.description)
  const { id, isAdhoc } = feature || {}
  const { loading, setLoading, setShouldRefresh } = useTickets()

  const { user } = useUser()
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
    <TableRow className="bg-muted/50">
      <TableCell colSpan={9} className="pl-12">
        <div className="flex items-center justify-between">
          {isDraft ? (
            <div className="flex flex-col gap-1">
              <Label>Change Request Draft - {user?.name}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Change Request Title"
                className="w-96"
                disabled={loading}
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Change Request Description"
                className="w-96"
                disabled={loading}
              />
              {isAuthor && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-green-600 hover:bg-green-50"
                    onClick={() => submitChangeRequest()}
                    disabled={loading}
                  >
                    <Check className="mr-2 h-3 w-3" />
                    Submit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-red-600 hover:bg-red-50"
                    onClick={() => handleChangeRequestDelete()}
                    disabled={loading}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium capitalize">Change</span>
                <span className="text-xs text-muted-foreground">
                  {dayjs(change.createdAt).format("MMM DD, YYYY")} - {change.createdBy}
                </span>
              </div>
              <span className=" text-primary font-semibold w-72 capitalize">{change.title}</span>
              <Textarea
                readOnly
                className=" w-[600px] h-28 text-sm text-muted-foreground max-w-[600px] max-h-[400px] overflow-auto"
              >
                {change.description}
              </Textarea>
              <span className={`text-sm font-medium ${statusColor}`}>
                {change.status} 
                {change.statusBy && (
                  <span className="text-xs text-muted-foreground/80">
                    {" "}By {change.statusBy} {change.statusAt}
                  </span>
                )}
              </span>
            </div>
          )}
          {isPending && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-green-600 hover:bg-green-50"
                onClick={() => onChangeStatus('approved')}
                disabled={loading}
              >
                <Check className="mr-2 h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-red-600 hover:bg-red-50"
                onClick={() => onChangeStatus('rejected')}
                disabled={loading}
              >
                <X className="mr-2 h-3 w-3" />
                Reject
              </Button>
            </div>
          )}
          <WithPermission requiredAccess={2}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 px-3 text-red-600 hover:bg-red-50"
              onClick={() => handleChangeRequestDelete()}
              disabled={loading}
            >
              <Trash className="mr-2 h-3 w-3" />
            </Button>
          </WithPermission>
        </div>
      </TableCell>
    </TableRow>
  )
}
