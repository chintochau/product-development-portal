import { ColumnDef } from '@tanstack/react-table'
import { cn, daysFromToday } from '../../../../lib/utils'
import { getBrandName } from '../../constant'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import type { Product } from '../../../../@types/models/product.types'

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: 'No.',
    size: 50,
    cell: ({ row, table }) => {
      // Display row number instead of UUID
      const rowIndex = table.getRowModel().rows.indexOf(row) + 1
      return (
        <div className="text-center">
          <span className="text-primary font-medium">{rowIndex}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'brand',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Brand
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      )
    },
    size: 120,
    cell: ({ row }) => {
      const brand = row.getValue('brand') as string
      return <span>{getBrandName(brand)}</span>
    }
  },
  {
    accessorKey: 'name',
    header: 'Project Name',
    size: 200,
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div>
          <p className="font-semibold text-primary hover:underline cursor-pointer">
            {name}
          </p>
        </div>
      )
    }
  },
  {
    accessorKey: 'model',
    header: 'Model#',
    size: 100
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 300,
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || 'No description'}
        </p>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      
      const statusConfig = {
        'Concept': { color: 'bg-blue-100 text-blue-700', label: 'Concept' },
        'Concept Approved': { color: 'bg-yellow-100 text-yellow-700', label: 'Approved' },
        'Greenlight': { color: 'bg-emerald-100 text-emerald-700', label: 'Greenlight' },
        'Complete': { color: 'bg-gray-100 text-gray-700', label: 'Complete' },
        'On Hold': { color: 'bg-orange-100 text-orange-700', label: 'On Hold' },
        'Cancelled': { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
      }
      
      const config = statusConfig[status as keyof typeof statusConfig] || {
        color: 'bg-gray-100 text-gray-700',
        label: status
      }
      
      return (
        <Badge variant="secondary" className={cn("text-xs", config.color)}>
          {config.label}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'mp1_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          MP1 Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      )
    },
    size: 120,
    cell: ({ row }) => {
      const mp1Date = row.getValue('mp1_date') as string
      const mp1ActualDate = row.original.mp1_actual_date
      
      if (!mp1Date) return <span className="text-muted-foreground">-</span>
      
      const formattedDate = new Date(mp1Date).toLocaleDateString()
      const days = daysFromToday(mp1Date)
      const isOverdue = mp1ActualDate && new Date(mp1ActualDate) > new Date(mp1Date)
      
      return (
        <div>
          <p className={cn("font-medium", isOverdue && "text-red-600")}>
            {formattedDate}
          </p>
          <p className="text-xs text-muted-foreground">{days}</p>
          {mp1ActualDate && (
            <p className="text-xs text-muted-foreground">
              Actual: {new Date(mp1ActualDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'launch_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Launch Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      )
    },
    size: 120,
    cell: ({ row }) => {
      const launchDate = row.getValue('launch_date') as string
      
      if (!launchDate) return <span className="text-muted-foreground">-</span>
      
      const formattedDate = new Date(launchDate).toLocaleDateString()
      const days = daysFromToday(launchDate)
      
      return (
        <div>
          <p className="font-medium">{formattedDate}</p>
          <p className="text-xs text-muted-foreground">{days}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'show_location',
    header: 'Show',
    size: 100,
    cell: ({ row }) => {
      const show = row.getValue('show_location') as string
      return <span className="text-sm">{show || '-'}</span>
    }
  },
  {
    accessorKey: 'gitlab_epic_id',
    header: 'GitLab',
    size: 80,
    cell: ({ row }) => {
      const epicId = row.getValue('gitlab_epic_id') as number | null
      
      if (!epicId) return null
      
      const epicUrl = `https://gitlab.com/groups/lenbrook/sovi/-/epics/${epicId}`
      
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation()
            window.open(epicUrl, '_blank')
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Open
        </Button>
      )
    }
  },
  {
    id: 'gitlab_issue',
    header: '',
    size: 50,
    cell: ({ row }) => {
      const issueId = row.original.gitlab_issue_id
      const projectId = row.original.gitlab_project_id || 61440508
      
      if (!issueId) return null
      
      const issueUrl = `https://gitlab.com/lenbrook/sovi/products/-/issues/${issueId}`
      
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            window.open(issueUrl, '_blank')
          }}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )
    }
  }
]