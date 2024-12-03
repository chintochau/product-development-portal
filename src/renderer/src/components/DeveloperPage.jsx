import React from 'react'

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

const DeveloperPage = () => {
  const {
    developers,
    isSelected,
    selectDeveloper,
    selectedDevelopers,
    tickets,
    getTicketsForSelectedDevelopers,
    loading
  } = useDevelopers()
  const [showStatusBar, setShowStatusBar] = React.useState(false)
  console.log(tickets)

  return (
    <div>
      <DropdownMenu open={showStatusBar} onOpenChange={setShowStatusBar}>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-col">
            <h1 className="px-4 text-2xl">Developers</h1>
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
        </DropdownMenuTrigger>
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
          <Button onClick={() => getTicketsForSelectedDevelopers()} disabled={loading}>
            Submit {loading && <Loader2 className="animate-spin" />}
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

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
                  <Avatar
                    key={dev.id + index}
                    className={cn(`absolute top-1 bg-background`, `left-${index * 2}`)}
                  >
                    <AvatarImage src={dev.avatar_url} />
                    <AvatarFallback>{dev.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DeveloperPage
