import React, { useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

import { Check, Cross, Edit, Loader2, ThumbsUp, Trash2, X } from 'lucide-react'
import { useDevelopers } from '../../contexts/developerContext'
import { useTickets } from '../../contexts/ticketsContext'
import { DeveloperDropdown } from '../DeveloperPage'
import { deleteFeatureRequestIssue, updateFeatureRequestIssue } from '../../services/gitlabServices'
import ProductDropdown from './ProductDropdown'
import EstimateSlider from './EstimateSlider'
import { DataTable } from '../home/data-table'
import { featureColumns } from './feature-columns'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'


function FeatureRow({ feature }) {
    const { developers } = useDevelopers()
    const { setShouldRefresh, setLoading } = useTickets()
    const [showStatusBar, setShowStatusBar] = useState(false)
    const [selectedDevelopers, setSelectedDevelopers] = useState([])
  
    const [isEditing, setIsEditing] = useState(false)
  
    const isSelected = (id) => {
      return selectedDevelopers.findIndex((dev) => dev.id === id) !== -1
    }
  
    const updateAssignees = async () => {
      const response = await updateFeatureRequestIssue(id, {
        ...feature,
        assignee_ids: selectedDevelopers.map((dev) => dev.id)
      })
      setShouldRefresh(true)
    }
  
    const { assignee_ids, id } = feature || {}
  
    const [title, setTitle] = useState(feature?.title)
    const [description, setDescription] = useState(feature?.description)
  
    const [product, setProduct] = useState(feature?.product)
  
    const handleDeleteTicket = async () => {
      setLoading(true)
      const response = await deleteFeatureRequestIssue(id)
      setShouldRefresh(true)
    }
  
    const handleEstimateChange = async (value) => {
      setLoading(true)
      const response = await updateFeatureRequestIssue(id, {
        ...feature,
        estimate: value
      })
      setShouldRefresh(true)
    }
  
    const developersList = developers.filter((dev) =>
      assignee_ids?.find((assignee) => assignee === dev.id)
    )
  
    const handleDateChange = async (value) => {
      setLoading(true)
      const response = await updateFeatureRequestIssue(id, {
        ...feature,
        startDate: value
      })
      setShouldRefresh(true)
    }
  
    const saveEditing = async () => {
      setIsEditing(!isEditing)
      setLoading(true)
      const response = await updateFeatureRequestIssue(id, {
        ...feature,
        title,
        description
      })
      setLoading(false)
    }
  
    const cancelEditing = () => {
      setIsEditing(!isEditing)
      setTitle(feature?.title)
      setDescription(feature?.description)
    }
  
    return (
      <TableRow
        onClick={async (e) => {
          e.stopPropagation()
        }}
      >
        <TableCell className="font-medium min-w-60">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Textarea
                defaultValue={title}
                className="min-h-40"
                onChange={(e) => {
                  e.target.style.height = '1em'
                  e.target.style.height = e.target.scrollHeight + 'px'
                  setTitle(e.target.value)
                }}
              />
            ) : (
              <p>{title}</p>
            )}
            <>
              {isEditing ? (
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
              ) : (
                <div className="size-5">
                  <Edit className="cursor-pointer" onClick={() => setIsEditing(!isEditing)} />
                </div>
              )}
            </>
          </div>
        </TableCell>
        <TableCell className="font-medium">
          {isEditing ? (
            <Textarea
              className="min-h-40"
              defaultValue={description}
              onChange={(e) => {
                e.target.style.height = '1em'
                e.target.style.height = e.target.scrollHeight + 'px'
                setDescription(e.target.value)
              }}
            />
          ) : (
            description
          )}
        </TableCell>
        <TableCell className="font-medium">
          <ProductDropdown product={product} setProduct={setProduct} />
        </TableCell>
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
        <TableCell className="font-medium"></TableCell>
        <TableCell className="font-medium"></TableCell>
  
        <TableCell className="font-medium">
          <Trash2
            className="cursor-pointer size-4 duration-300 transition-all hover:text-red-500 text-muted-foreground"
            onClick={handleDeleteTicket}
          />
        </TableCell>
      </TableRow>
    )
  }
  
export default FeatureRow
  