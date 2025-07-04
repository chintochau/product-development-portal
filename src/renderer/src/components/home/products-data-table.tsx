import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../components/ui/table'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../../../lib/utils'
import { Input } from '../../../../components/ui/input'
import { Sheet, Loader2 } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { defaultBrands } from '../../constant'
import { WithPermission } from '../../contexts/permissionContext'
import type { Product } from '../../../../@types/models/product.types'

interface ProductsDataTableProps {
  columns: ColumnDef<Product>[]
  data: Product[]
  loading?: boolean
}

export function ProductsDataTable({ columns, data, loading }: ProductsDataTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState([
    {
      id: 'mp1_date',
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
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  })

  const handleProductClick = (product: Product) => {
    if (!product.id) return
    navigate(`/dashboard/${product.id}`)
  }

  const BrandFilter = () => {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'text-sm',
            !table.getColumn('brand')?.getFilterValue() && 'bg-muted'
          )}
          onClick={() => table.getColumn('brand')?.setFilterValue(undefined)}
        >
          All
        </Button>
        {defaultBrands.map((brand) => (
          <Button
            key={brand.value}
            variant="outline"
            size="sm"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <WithPermission requiredAccess={2}>
          <BrandFilter />
        </WithPermission>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search products..."
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm pr-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const roadmapPath = (import.meta as any).env?.VITE_ROADMAP_PATH
              if (roadmapPath) window.open(roadmapPath)
            }}
          >
            <Sheet className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(header.column.columnDef.meta?.headerClassName)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleProductClick(row.original)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    'hover:bg-muted/50'
                  )}
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}