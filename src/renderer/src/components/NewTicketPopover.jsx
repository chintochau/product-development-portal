import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { createFeatureTicket, getChatCompletion } from '../services/aelixaiServices'
import { Button } from '../../../components/ui/button'
import { Sparkles } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '../../../components/ui/dialog'
import { createGitlabIssue } from '../services/gitlabServices'
import { useProjects } from '../contexts/projectsContext'
import { Badge } from '../../../components/ui/badge'
import { useSingleProduct } from '../contexts/singleProductContext'
import { useProducts } from '../contexts/productsContext'
import ProductDropdown from './feature-page-components/ProductDropdown'
import { toInteger } from 'lodash'
import { WithPermission } from '../contexts/permissionContext'

// The main popover component
const NewTicketPopover = ({ context = {}, onCreated }) => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(context.title || '')
  const [description, setDescription] = useState(context.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedEpicId, setSelectedEpicId] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(context.productId)

  const resetFormAndClose = () => {
    setTitle('')
    setDescription('')
    setSelectedProject(null)
    setSelectedEpicId(null)
    setSelectedProductId(context.productId)
    setLoading(false)
    setError('')
    setSuccess(false)
    setOpen(false)
  }

  const { projects, projectDict } = useProjects()
  const { epics } = useSingleProduct()
  const { productsDict } = useProducts()
  const handleGenerateFeatureRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const aiDescription = await createFeatureTicket({
        title,
        description,
        product: productsDict[selectedProductId]?.projectName
      })
      setDescription(aiDescription)
    } catch (err) {
      console.log(err)
      setError('Failed to generate description.')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ticket = await createGitlabIssue(
      {
        title,
        description,
        epic_id: selectedEpicId,
        labels: projectDict[selectedProject]?.labels || []
      },
      selectedProject
    )
    setSuccess(true)
    if (ticket?.web_url && onCreated) {
      onCreated(ticket.web_url)
    }
    resetFormAndClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="xs" className="px-1">
          <Sparkles className="h-4 w-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[60vw] min-w-[60vw] min-h-[60vh] h-[60vh] flex flex-col gap-2 overflow-y-auto">
        <DialogTitle>New Ticket</DialogTitle>
        <form onSubmit={handleSubmit}>
          <div>
            <Label>Product</Label>
            <ProductDropdown
              product={toInteger(selectedProductId)}
              setProduct={setSelectedProductId}
            />
          </div>
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ticket title"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or feature..."
              rows={4}
              className="w-full p-2 border rounded min-h-[250px]"
            />
            <WithPermission requiredAccess={2}>
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleGenerateFeatureRequest}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Generate Feature Request'}
              </Button>
            </WithPermission>
          </div>

          <div>
            <Label>Project</Label>
            <select
              value={selectedProject?.projectId}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
                marginTop: 4
              }}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name} - {project.projectId}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 py-1 ">
            {projectDict[selectedProject]?.labels?.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
          <div>
            <Label>Epic</Label>
            <select
              value={selectedEpicId}
              onChange={(e) => setSelectedEpicId(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
                marginTop: 4
              }}
            >
              <option value="">Select an epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.title}
                </option>
              ))}
            </select>
          </div>
          {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: 13 }}>Ticket created!</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button type="submit" disabled={loading || !title || !description || !selectedProject}>
              Create
            </Button>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: '#e5e7eb', color: '#111827' }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

NewTicketPopover.propTypes = {
  context: PropTypes.object
}

export default NewTicketPopover
