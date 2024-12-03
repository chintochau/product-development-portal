import { cn } from "@/lib/utils"

export const columns = [
    {
        accessorKey: "iid",
        header: "No.",
    },
    {
        accessorKey: "projectName",
        header: "Project Name",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "mp1Date",
        header: "MP1",
    },
    {
        accessorKey: "launch",
        header: "Launch Date",
    },
    {
        accessorKey: "epicId",
        header: "Epic",
        cell: ({ row }) => {
            const { epicId } = row.original || {}
            return <a href={'https://gitlab.com/groups/lenbrook/sovi/-/epics/' + epicId} onClick={(e) => e.stopPropagation()} target="_blank" className={cn(epicId ? '' : 'hidden', "hover:underline")}>tickets</a>
        },
    },
    {
        id: "web_url",
        header: "Link",
        cell: ({ row }) => <a href={row.original.web_url} target="_blank" onClick={(e) => e.stopPropagation()} className="hover:underline">link</a>,
    },
]
