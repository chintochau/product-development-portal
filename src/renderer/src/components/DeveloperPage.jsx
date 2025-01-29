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
import { Input } from '../../../components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area'
import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../lib/utils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../../components/ui/hover-card'
import { useTickets } from '../contexts/ticketsContext'
import { useProducts } from '../contexts/productsContext'
import BarChartComponent from './BarChartComponent'

const DeveloperPage = () => {
  const {
    isSelected,
    selectDeveloper,
    selectedDevelopers,
    tickets,
    getTicketsForSelectedDevelopers,
    loading
  } = useDevelopers()
  const { featuersByDevelopers } = useTickets()
  const [showStatusBar, setShowStatusBar] = React.useState(false)
  const { findProductsById } = useProducts()

  return (
    <div className="flex flex-col px-4 gap-4 pb-4">
      <h1 className="text-2xl">Developers</h1>
      <BarChartComponent chartData={featuersByDevelopers} developerChart />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-96">Developer</TableHead>
            <TableHead>Counts</TableHead>
            <TableHead>Feature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {featuersByDevelopers?.map((developer) => (
            <TableRow key={developer.developer?.id}>
              <TableCell className="font-medium align-top flex items-center gap-2">
                <img src={developer.developer?.avatar_url} className="w-8 h-8 rounded-full" />
                {developer.developer?.name}
              </TableCell>
              <TableCell className="font-medium w-[100px] align-top">
                {developer.features?.length}
              </TableCell>
              <TableCell className="font-medium align-top">
                {developer.features?.length > 0 && (
                  <>
                    {developer.features?.map((feature, idx) => (
                      <div className="flex gap-2" key={feature.id + idx}>
                        <p>{findProductsById(feature.product)}</p>
                        <p> {feature.title}</p>
                      </div>
                    ))}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AdHocTasksTable />
    </div>
  )
}

const AdHocTasksTable = () => {
  const {adhocTickets} = useTickets()
  return (
    <>
      <h3 className="text-2xl"> Ad Hoc Tasks</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-96">Developer</TableHead>
            <TableHead>Counts</TableHead>
            <TableHead>Feature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium align-top">1</TableCell>
            <TableCell className="font-medium w-[100px] align-top">1</TableCell>
            <TableCell className="font-medium align-top">1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
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
