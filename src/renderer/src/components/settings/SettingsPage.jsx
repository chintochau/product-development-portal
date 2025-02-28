import React, { useEffect, useState } from 'react'
import { ModeToggle } from '../../../../components/mode-toggle'
import { Label } from '../../../../components/ui/label'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CloudDownload, Download, Loader2, Rocket } from 'lucide-react'
import ReactMarkdown from "react-markdown";

const SettingsPage = () => {
  const [appVersion, setAppVersion] = useState('')

  const changelog = [
    {
      version: '1.0.1',
      date: '2025-02-27',
      changes: ['Home Page added', 'In-App Update support added']
    }
  ]

  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateObject, setUpdateObject] = useState(null)
  const [downloadMessage, setDownloadMessage] = useState('')

  const checkForUpdate = async () => {
    const updateCheck = await window.api.checkForAppUpdate()
    setUpdateObject(updateCheck)
    setUpdateAvailable(updateCheck.updateAvailable)
  }

  const handleUpdate = async () => {
    setDownloadMessage("Download in progress...")
    const handleUpdate = await window.api.performAppUpdate()
  }

  const getAppVersion = async () => {
    const version = await window.api.getAppVersion()
    setAppVersion(version)
  }

  useEffect(() => {
    getAppVersion()
    checkForUpdate()
  }, [])

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
          <ScrollArea className=" pr-4">
            <div className="max-h-64 space-y-6">
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
        {updateAvailable && (
          <Alert>
            <Rocket className="h-4 w-4" />
            <AlertTitle>New Update Available!</AlertTitle>
            <AlertDescription>{updateObject?.message}</AlertDescription>
            <div>
              <Button size="sm" className="mt-4" onClick={handleUpdate}>
                {downloadMessage ? <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {downloadMessage}</> :
                  <>
                  <CloudDownload className="mr-2 h-4 w-4" />
                  <p>Update Now</p>
                  </>
                }
              </Button>
            </div>
            {
              updateObject?.releaseNotes && (
                <div className='mt-4 bg-accent/20 rounded-md p-4 prose'>
                  <ReactMarkdown >
                    {updateObject?.releaseNotes}
                  </ReactMarkdown>
                </div >
              )
            }
          </Alert>
        )}

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
