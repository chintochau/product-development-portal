import { cn, daysFromToday } from '@/lib/utils'
import { getBrandName } from '../../constant'
import { ArrowUpDown, Gitlab, Link } from 'lucide-react'
import { Button } from '../../../../components/ui/button'

export const columns = [
  {
    accessorKey: 'iid',
    header: 'No.',
    headerClassName: 'max-w-10',
    cell: ({ row }) => {
      const { iid } = row.original || {}
      return (
        <div className="">
          <p className=" text-primary">{iid}</p>
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
          className="pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Brand
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { brand } = row.original || {}
      return (
        <div className="">
          <p className="">{getBrandName(brand)}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'projectName',
    header: 'Project Name',
    cell: ({ row }) => {
      const { projectName } = row.original || {}
      return (
        <div className="">
          <p className=" text-primary font-semibold">{projectName}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'model',
    header: 'Model#',
    headerClassName: 'max-w-20'
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 300
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { status } = row.original || {}
      let color = 'text-gray-600'
      switch (status) {
        case 'Concept Approved':
          color = 'text-yellow-600'
          break
        case 'Greenlight':
          color = 'text-green-600'
          break
        case 'Concept':
          color = 'text-blue-600'
          break
        case 'Complete':
          color = 'text-muted-foreground'
          break
      }
      return <span className={color}>{status}</span>
    }
  },
  {
    accessorKey: 'mp1Date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          MP1 Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { mp1Date } = row.original || {}
      return (
        <div>
          <p className=" text-primary">{mp1Date}</p>
          <p className="text-muted-foreground text-xs"> {daysFromToday(mp1Date)}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'launch',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Launch Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { launch } = row.original || {}
      return (
        <div>
          <p className=" text-primary">{launch}</p>
          <p className="text-muted-foreground text-xs"> {daysFromToday(launch)}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'show',
    header: 'Show'
  },
  {
    accessorKey: 'epicId',
    header: 'Gitlab',
    size: 50,
    cell: ({ row }) => {
      const { epicId } = row.original || {}
      return (
        <a
          href={'https://gitlab.com/groups/lenbrook/sovi/-/epics/' + epicId}
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          className={cn(
            epicId ? 'flex items-center justify-center' : 'hidden',
            'duration-300  transition-all hover:underline '
          )}
          rel="noreferrer"
        >
          Open
        </a>
      )
    }
  },
  {
    id: 'web_url',
    size: 50,
    cell: ({ row }) => (
      <a
        href={row.original.web_url}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center"
        rel="noreferrer"
      >
        <Link className="h-4 w-4 text-secondary" />
      </a>
    )
  }
]
