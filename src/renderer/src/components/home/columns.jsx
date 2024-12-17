import { cn, daysFromToday } from '@/lib/utils'

export const columns = [
  {
    accessorKey: 'iid',
    header: 'No.'
  },
  {
    accessorKey: 'projectName',
    header: 'Project Name'
  },
  {
    accessorKey: 'model',
    header: 'Model#'
  },
  {
    accessorKey: 'description',
    header: 'Description'
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
    header: 'MP1',
    cell: ({ row }) => {
      const { mp1Date } = row.original || {}
      return (
        <div>
          <p className=' text-primary'>{mp1Date}</p>
          <p className='text-muted-foreground text-xs'> {daysFromToday(mp1Date)}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'launch',
    header: 'Launch Date',
    cell: ({ row }) => {
      const { launch } = row.original || {}
      return (
        <div>
          <p className=' text-primary'>{launch}</p>
          <p className='text-muted-foreground text-xs'> {daysFromToday(launch)}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'epicId',
    header: 'Epic',
    cell: ({ row }) => {
      const { epicId } = row.original || {}
      return (
        <a
          href={'https://gitlab.com/groups/lenbrook/sovi/-/epics/' + epicId}
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          className={cn(epicId ? '' : 'hidden', 'hover:underline')}
        >
          tickets
        </a>
      )
    }
  },
  {
    id: 'web_url',
    header: 'Link',
    cell: ({ row }) => (
      <a
        href={row.original.web_url}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        className="hover:underline"
      >
        link
      </a>
    )
  }
]
