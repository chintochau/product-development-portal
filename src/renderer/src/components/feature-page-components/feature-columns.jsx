import { cn, daysFromToday } from '@/lib/utils'
import { useProducts } from '../../contexts/productsContext'

export const featureColumns = [
    {
        accessorKey: 'title',
        header: 'Title',
        size: 100,
        cell: ({ row }) => {
            const {title,description} = row.original || {}
            return (
                <div>
                    <p className='text-primary'>{title}</p>
                    <p className='text-muted-foreground text-xs'>{description}</p>
                </div>
            )
        }
    },
    {
        accessorKey: 'product',
        header: 'Product',
        size: 150,
        cell: ({ row }) => {
            const {products} = useProducts()
            const { product } = row.original || {}
            
            const mapProduct = (productId) => {
                const product = products.find(product => product.iid === productId)
                return product?.projectName
            }

            return (
                <span className={cn(product ? '' : 'hidden', 'hover:underline')}>
                    {product && mapProduct(product)}
                </span>
            )
        }
    },
    {
        accessorKey: 'projectName',
        header: 'Title'
    },
]
