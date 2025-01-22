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
import { useProducts } from '../../contexts/productsContext'

const BluOSFeatureRequest = ({ productIssueId, children }) => {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [product, setProduct] = React.useState(productIssueId)
  const { setShouldRefresh, loading, setLoading } = useTickets()
  const { findProductsById } = useProducts()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setProduct(productIssueId)
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
        <CardTitle>BluOS Planning</CardTitle>
        <CardDescription>BluOS Feature Requests</CardDescription>
      </CardHeader>

      <CardContent>
        <div className=" rounded-md overflow-hidden shadow">
          <div className="w-full bg-secondary/20 px-2 py-2 text-sm text-secondary-foreground font-semibold">Create a Feature Request</div>
          <div className='p-2'>
            <Label>Product</Label>
            {productIssueId ? (
              <p>{findProductsById(productIssueId)}</p>
            ) : (
              <ProductDropdown product={product} setProduct={setProduct} />
            )}
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
                <Button>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
      <CardFooter>{children}</CardFooter>
    </Card>
  )
}

export default BluOSFeatureRequest
