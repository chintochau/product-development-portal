import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useProducts } from "../../contexts/productsContext"
import { useSingleProduct } from "../../contexts/singleProductContext"
import { useNavigate } from "react-router-dom"
import { cn } from "../../../../lib/utils"

export function DataTable({
    columns,
    data,
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const { loading, products, setShouldRefreshProducts } = useProducts()
    const { setProductLog } = useSingleProduct()
    const navigate = useNavigate()

    const handleProductClick = (productLog) => {
        if (!productLog?.iid) return
        setProductLog(productLog)
        navigate(`/dashboard/${productLog.iid}#${productLog.name}`)
    }

    return (
        <div >
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} style={{ width: header.column.columnDef.size }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={() => handleProductClick(row.original)}
                                className={cn(row.original?.iid && "cursor-pointer")}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
