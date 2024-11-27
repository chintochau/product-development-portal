import React from 'react'
import { ModeToggle } from '../../../../components/mode-toggle'
import { Label } from '../../../../components/ui/label'

const SettingsPage = () => {
  return (
    <div className="px-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Settings</h1>
      </div>
      <Label>Theme</Label>
      <ModeToggle />
    </div>
  )
}

export default SettingsPage
