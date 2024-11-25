import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect } from 'react'
import { createNewProductTicket, getProductsLog } from '../services/gitlabServices'
import { Button } from '@/components/ui/button'


const HomePage = () => {

  const [epics, setEpics] = React.useState([])

  const [products, setProducts] = React.useState([])
  const loadTickets = async () => {
    const data = await getProductsLog();
    console.log(data);
    setProducts(data)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  return (
    <div className='px-4'>
      <h1 className='text-2xl'>Dashboard</h1>
      <Select >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Select Epic" />
        </SelectTrigger>
        <SelectContent>
          {epics.map((epic) => (
            <SelectItem key={epic.id} value={epic.id}>
              {epic.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='bg-accent w-full rounded-xl'>
        {
          products.map((product) => (
            <div key={product.id}>{product.title}</div>
          ))
        }
      </div>
      <Button
        onClick={() => {
          createNewProductTicket()
        }}
      >
        Create Sample Issue
      </Button>
    </div>
  )
}

export default HomePage