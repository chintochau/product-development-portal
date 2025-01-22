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

      <DeveloperDropdown
        showStatusBar={showStatusBar}
        setShowStatusBar={setShowStatusBar}
        selectedDevelopers={selectedDevelopers}
        selectDeveloper={selectDeveloper}
        isSelected={isSelected}
        onClick={getTicketsForSelectedDevelopers}
        loading={loading}
      >
        <div className="flex flex-col">
          <h1 className="text-2xl">Gitlab Tickets</h1>
          <div className="flex items-center">
            <div className="flex flex-col justify-start items-start">
              <Button variant="link">
                select {selectedDevelopers.length ? selectedDevelopers.length : null}
              </Button>
              <Badge className="bg-blue-500 text-white w-fit ml-4 mr-2">Workflow::Doing</Badge>
            </div>
            {selectedDevelopers.length !== 0 && (
              <ScrollArea className="w-fit max-w-96 whitespace-nowrap rounded-md border">
                <div className="flex w-max space-x-2 py-1 px-2">
                  {selectedDevelopers.length !== 0 &&
                    selectedDevelopers.map((dev) => (
                      <Avatar key={dev.id}>
                        <AvatarImage src={dev.avatar_url} />
                        <AvatarFallback>{dev.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </div>
      </DeveloperDropdown>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Assignees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticket) => (
            <TableRow key={ticket.iid}>
              <TableHead className="w-[170px]">{ticket.references?.relative}</TableHead>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell className="font-medium relative">
                <div className="min-h-8"></div>
                {ticket.assignees?.map((dev, index) => (
                  <HoverCard key={dev.id + index}>
                    <HoverCardTrigger>
                      <Avatar
                        key={dev.id + index}
                        className={cn(`absolute top-1 bg-background`)}
                        style={{
                          left: index * 20
                        }}
                      >
                        <AvatarImage src={dev.avatar_url} />
                        <AvatarFallback>{dev.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="rounded-xl flex flex-col gap-2">
                      {ticket.assignees?.map((dev) => (
                        <div className="flex items-center gap-1" key={dev.id + index + dev.name}>
                          <Avatar>
                            <AvatarImage src={dev.avatar_url} />
                            <AvatarFallback>{dev.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <div>{dev.name}</div>
                        </div>
                      ))}
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </TableCell>
            </TableRow>
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
