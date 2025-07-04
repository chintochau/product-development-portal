import React, { memo, useState, useCallback } from 'react'
import { TableCell, TableRow } from '../../../../components/ui/table'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { Label } from '../../../../components/ui/label'
import { Card } from '../../../../components/ui/card'
import { Check, X, Loader2 } from 'lucide-react'
import { useTickets } from '../../contexts/ticketsContext'
import { cn } from '../../../../lib/utils'

interface FeatureEditRowProps {
  feature: any
  onCancel: () => void
  onSave: () => void
}

export const FeatureEditRow = memo<FeatureEditRowProps>(({ 
  feature, 
  onCancel,
  onSave 
}) => {
  const { loading, setLoading, setShouldRefresh } = useTickets()
  
  const [title, setTitle] = useState(feature.title)
  const [description, setDescription] = useState(feature.description || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!title.trim() || isSaving) return
    
    setIsSaving(true)
    setLoading(true)
    
    try {
      await window.api.features.update(feature.id, {
        title: title.trim(),
        description: description.trim()
      })
      setShouldRefresh(true)
      onSave()
    } catch (error) {
      console.error('Failed to save feature:', error)
    } finally {
      setIsSaving(false)
      setLoading(false)
    }
  }, [feature.id, title, description, isSaving, setLoading, setShouldRefresh, onSave])

  const handleCancel = useCallback(() => {
    if (!isSaving) {
      onCancel()
    }
  }, [isSaving, onCancel])

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={9} className="p-0">
        <Card className="m-4 p-6 border-primary/20 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Feature Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter feature title"
                className={cn(
                  "font-medium",
                  "focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature in detail..."
                className={cn(
                  "min-h-[120px] resize-none",
                  "focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!title.trim() || isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </TableCell>
    </TableRow>
  )
})

FeatureEditRow.displayName = 'FeatureEditRow'

export default FeatureEditRow