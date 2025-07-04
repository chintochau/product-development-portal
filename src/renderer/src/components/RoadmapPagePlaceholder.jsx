import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import FrameWraper from './frameWarper'

const RoadmapPagePlaceholder = () => {
  return (
    <FrameWraper>
      <div className="flex items-center justify-center min-h-[600px] p-8">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle>Roadmap Temporarily Unavailable</CardTitle>
            </div>
            <CardDescription>
              The roadmap feature is being migrated to PostgreSQL and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We're updating our data infrastructure to provide better performance and reliability.
              The roadmap functionality will be restored once the migration is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    </FrameWraper>
  )
}

export default RoadmapPagePlaceholder