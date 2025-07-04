import React, { memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../components/ui/table'
import { Button } from '../../../../components/ui/button'
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { useTickets } from '../../contexts/ticketsContext'
import FeatureRow from './FeatureRow'
import { cn } from '../../../../lib/utils'

interface AllFeaturesProps {
  features: any[]
  className?: string
}

export const AllFeatures = memo<AllFeaturesProps>(({ features, className }) => {
  const { loading } = useTickets()

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50">
              <TableHead className="w-[35%]">
                <div className="flex items-center gap-2 font-medium">
                  Title
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead className="w-[15%]">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Product
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[12%]">Developers</TableHead>
              <TableHead className="w-[12%]">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Time Estimate
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[8%]">Priority</TableHead>
              <TableHead className="w-[8%]">Type</TableHead>
              <TableHead className="w-[8%]">GitLab</TableHead>
              <TableHead className="w-[2%] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length > 0 ? (
              features.map((feature, index) => (
                <FeatureRow 
                  key={feature.id || feature.iid || index} 
                  feature={feature} 
                  index={index} 
                />
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={8} 
                  className="h-32 text-center text-muted-foreground"
                >
                  No features found. Create your first feature to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})

AllFeatures.displayName = 'AllFeatures'

export default AllFeatures