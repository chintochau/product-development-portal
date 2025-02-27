import React from 'react'
import { ModeToggle } from '../../../../components/mode-toggle'
import { Label } from '../../../../components/ui/label'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CloudDownload, Download, Rocket } from 'lucide-react'

const SettingsPage = () => {
  const appVersion = '2.1.4'
  const changelog = [
    {
      version: '2.1.4',
      date: '2024-03-15',
      changes: [
        'Added dark mode support',
        'Improved search performance',
        'Fixed login authentication issue'
      ]
    },
    {
      version: '2.1.3',
      date: '2024-03-10',
      changes: ['Updated documentation', 'Enhanced security features', 'Minor UI improvements']
    }
  ]

  const handleUpdate = async () => {
    // Simulate update process
    console.log('Updating application...')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('Update complete!')
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">App Settings</h1>

        <Card className="p-6">

        <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <ModeToggle />
        </Card>

        {/* Version Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Current Version</h2>
              <p className="text-muted-foreground mt-1">You're running version {appVersion}</p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              v{appVersion}
            </Badge>
          </div>
        </Card>

        {/* Changelog Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-6">
              {changelog.map((release, index) => (
                <div key={index} className="border-l-2 pl-4 border-primary">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{release.version}</span>
                    <span className="text-sm text-muted-foreground">{release.date}</span>
                  </div>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-muted-foreground [&:not(:first-child)]:mt-1">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Update Available Alert */}
        <Alert>
          <Rocket className="h-4 w-4" />
          <AlertTitle>New Update Available!</AlertTitle>
          <AlertDescription>
            Version 2.2.0 is ready to install. Contains new features and improvements.
          </AlertDescription>
          <Button size="sm" className="mt-4" onClick={handleUpdate}>
            <CloudDownload className="mr-2 h-4 w-4" />
            Update Now
          </Button>
        </Alert>

        {/* Feature Request Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Request a Feature</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Feature Title</label>
              <Input placeholder="Describe your feature request" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea placeholder="Tell us more about your feature request..." rows={4} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Download className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
