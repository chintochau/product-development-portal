import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useDevelopers } from '../contexts/developerContext'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import { Checkbox } from '../../../components/ui/checkbox'
import { Loader2, Search } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useTickets } from '../contexts/ticketsContext'
import { useProducts } from '../contexts/productsContext'
import BarChartComponent from './BarChartComponent'
import { createFeatureRequestIssue } from '../services/gitlabServices'
import FeatureRow from './feature-page-components/FeatureRow'
import FrameWraper from './frameWarper'
// import { useRoadmap } from '../contexts/roadmapContext' // Removed during migration

const DeveloperPage = () => {
  const { findProductById } = useProducts()
  // const { featuersByDevelopers } = useRoadmap() // Removed during migration
  const featuersByDevelopers = [] // Temporary empty data

  return (
    <FrameWraper>
      <div className="flex flex-col px-4 gap-4 pb-4">
        <h1 className="text-2xl">Developers</h1>
        <BarChartComponent chartData={featuersByDevelopers} developerChart />
        <Table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-96 py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Developer
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Task Count
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Features
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Ad Hoc Tasks
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {featuersByDevelopers?.map((developer) => (
              <TableRow
                key={developer.developer?.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="py-4 px-4 align-top">
                  <div className="flex items-center gap-3">
                    <img
                      src={developer.developer?.avatar_url}
                      alt={developer.developer?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-900">{developer.developer?.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4 align-top text-gray-700">
                  {developer.features?.length + developer.adhoc?.length}
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  {developer.features?.length > 0 ? (
                    developer.features.map((feature, idx) => (
                      <div key={feature.id + idx} className="flex flex-col gap-1 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {findProductById(feature.product)?.name || feature.product}
                        </span>
                        <span className="text-sm text-gray-600">{feature.title}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No features assigned</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  {developer.adhoc?.length > 0 ? (
                    developer.adhoc.map((task, idx) => (
                      <div key={task.id + idx} className="flex flex-col gap-1 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {findProductById(task.product)?.name || task.product}
                        </span>
                        <span className="text-sm text-gray-600">{task.title}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No ad hoc tasks</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-4 align-top">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AdHocTasksTable />
      </div>
    </FrameWraper>
  )
}

const AdHocTasksTable = () => {
  const { adhocTickets, setShouldRefresh, loading, setLoading } = useTickets()
  const createAdHocTask = async () => {
    setLoading(true)
    const response = await createFeatureRequestIssue(
      {
        isAdhoc: true
      },
      3
    )
    setShouldRefresh(true)
  }
  return (
    <div className=" space-y-2">
      <h3 className="text-2xl"> Ad Hoc Tasks</h3>
      <Button onClick={createAdHocTask} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-96">Task</TableHead>
            <TableHead>Developers</TableHead>
            <TableHead>Estimate</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Gitlab</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adhocTickets?.map((ticket, index) => (
            <FeatureRow key={ticket.id} feature={ticket} index={index} adhoc />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DeveloperDropdown({
  showStatusBar,
  setShowStatusBar,
  selectDeveloper,
  isSelected,
  onClick,
  loading,
  children
}) {
  const { developers } = useDevelopers()
  return (
    <DropdownMenu open={showStatusBar} onOpenChange={setShowStatusBar}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <Command>
          <CommandInput placeholder="Type a name or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Developers">
              {developers?.map((developer) => (
                <CommandItem
                  key={developer.id}
                  onSelect={() => {
                    selectDeveloper(developer.id)
                  }}
                >
                  <Checkbox
                    checked={isSelected(developer.id)}
                    onCheckedChange={() => selectDeveloper(developer.id)}
                  />
                  {developer.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <Button onClick={onClick} disabled={loading}>
          Submit {loading && <Loader2 className="animate-spin" />}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DeveloperPage
export { DeveloperDropdown }
