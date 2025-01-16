import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import ProductDropdown from './ProductDropdown'
import { Label } from '../../../../components/ui/label'
import { createFeatureRequestIssue } from '../../services/gitlabServices'
import { useTickets } from '../../contexts/ticketsContext'
import { Loader2 } from 'lucide-react'

const NewFeatureRequest = () => {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [product, setProduct] = React.useState(null)
  const { setShouldRefresh, loading, setLoading } = useTickets()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setProduct('')
  }
  const addFeature = async (e) => {
    e.preventDefault()
    setLoading(true)
    const response = await createFeatureRequestIssue({
      title,
      description,
      product
    })
    setShouldRefresh(true)
    resetForm()
  }
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>New Feature</CardTitle>
        <CardDescription>Feature Request</CardDescription>
      </CardHeader>

      <CardContent>
        <Label>Product</Label>
        <ProductDropdown product={product} setProduct={setProduct} />
        <form onSubmit={addFeature} className="flex w-full flex-col gap-2 pt-4">
          <Label>Title</Label>
          <Input
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            value={title}
          />
          <Label>Description</Label>
          <Textarea
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
            value={description}
          />
          <div>
            <Button variant="outline">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default NewFeatureRequest
