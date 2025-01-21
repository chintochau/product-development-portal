import { Leaf, Moon, Sun, Waves } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className={`h-6 w-6 rotate-0 scale-100 transition-all ${theme !== 'light' && 'scale-0 hidden'}`}
          />
          <Moon
            className={`absolute h-6 w-6  scale-0 transition-all ${theme === 'dark' && 'rotate-0 scale-100'}`}
          />
          <Leaf
            className={`absolute h-6 w-6  scale-0 transition-all ${theme === 'green' && 'rotate-0 scale-100'}`}
          />
          <Waves
            className={`absolute h-6 w-6  scale-0 transition-all ${theme === 'blue' && 'rotate-0 scale-100'}`}
          />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('green')}>Green</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('blue')}>Blue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
