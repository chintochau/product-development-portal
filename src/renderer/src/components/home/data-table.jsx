import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useProducts } from '../../contexts/productsContext'
import { useSingleProduct } from '../../contexts/singleProductContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../../../lib/utils'
import { useState } from 'react'
import { Input } from '../../../../components/ui/input'
import { Sheet } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { defaultBrands } from '../../constant'

export function DataTable({ columns, data }) {
  const [sorting, setSorting] = useState([
    {
      id: 'mp1Date',
      desc: false
    }
  ])

  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString', // built-in filter function
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  })

  const { setIid,setLoading } = useSingleProduct()
  const navigate = useNavigate()

  const handleProductClick = (iid) => {
    if (!iid) return
    setIid(iid)
    setLoading(true)
    navigate(`/dashboard/${iid}`)
  }

  const BrandFilter = () => {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className={cn('text-sm', !table.getColumn('brand')?.getFilterValue() && 'bg-muted')}
          onClick={() => table.getColumn('brand')?.setFilterValue(undefined)}
        >
          All
        </Button>
        {defaultBrands.map((brand) => (
          <Button
            key={brand.value}
            variant="outline"
            className={cn(
              'text-sm',
              brand.value === table.getColumn('brand')?.getFilterValue() && 'bg-muted'
            )}
            onClick={() => table.getColumn('brand')?.setFilterValue(brand.value)}
          >
            {brand.name}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <BrandFilter />
        <div className=" flex items-center gap-1">
          <Input
            placeholder="Search..."
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.open(import.meta.env.VITE_ROADMAP_PATH)}
          >
            <Sheet />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                    className={cn(header.column.columnDef.headerClassName)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => handleProductClick(row.original.iid)}
                className={cn(row.original?.iid && 'cursor-pointer')}
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
