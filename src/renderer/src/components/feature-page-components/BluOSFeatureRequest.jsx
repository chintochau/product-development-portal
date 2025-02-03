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
import { cn } from '../../../../lib/utils'

const BluOSFeatureRequest = ({ productIssueId, children, className }) => {
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
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>BluOS</CardTitle>
        <CardDescription>BluOS Feature Requests</CardDescription>
      </CardHeader>

      <CardContent className={productIssueId ? 'flex gap-3 flex-wrap w-full' : ''}>
        <div className="rounded-lg shadow p-4 min-w-60 flex-1">
          <h3 className="text-lg font-medium text-gray-800">Create a Feature Request</h3>
          <div className="mt-4">
            <Label className="block font-semibold text-gray-700">Product</Label>
            {productIssueId ? (
              <p className="mt-1 text-sm text-gray-600">{findProductsById(productIssueId)}</p>
            ) : (
              <ProductDropdown product={product} setProduct={setProduct} />
            )}
            <form onSubmit={addFeature} className="space-y-4 mt-4">
              <div>
                <Label className="block font-semibold text-gray-700">Title</Label>
                <Input
                  placeholder="Enter feature title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 rounded-md"
                />
              </div>
              <div>
                <Label className="block font-semibold text-gray-700">Description</Label>
                <Textarea
                  placeholder="Enter feature description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
        {children}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default BluOSFeatureRequest
