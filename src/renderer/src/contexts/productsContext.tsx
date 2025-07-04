import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, ProductCreateInput, ProductUpdateInput } from '@/types/models';
import type { ApiListResponse, ApiResponse } from '@/types/api';

interface ProductsContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  productsDict: Record<string, Product>;
  createProduct: (product: ProductCreateInput) => Promise<Product>;
  updateProduct: (id: string, updates: ProductUpdateInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  findProductById: (id: string) => Product | undefined;
  findProductByName: (name: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// API configuration - can be made configurable via environment variables
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:3000/api'  // Update this for production
  : 'http://localhost:3000/api';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsDict, setProductsDict] = useState<Record<string, Product>>({});

  // Load products from PostgreSQL API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data: ApiListResponse<Product> = await response.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
        
        // Create dictionary for quick lookup
        const dict: Record<string, Product> = {};
        data.data.forEach(product => {
          dict[product.id] = product;
        });
        setProductsDict(dict);
      } else {
        console.error('Failed to load products:', data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new product
  const createProduct = async (productData: ProductCreateInput): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data: ApiResponse<Product> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create product');
    }

    // Refresh products list
    await loadProducts();
    
    return data.data;
  };

  // Update a product
  const updateProduct = async (id: string, updates: ProductUpdateInput): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data: ApiResponse<Product> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update product');
    }

    // Refresh products list
    await loadProducts();
    
    return data.data;
  };

  // Delete a product
  const deleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete product');
    }

    // Refresh products list
    await loadProducts();
  };

  // Refresh products
  const refreshProducts = async () => {
    await loadProducts();
  };

  // Find product by ID
  const findProductById = (id: string): Product | undefined => {
    return productsDict[id];
  };

  // Find product by name
  const findProductByName = (name: string): Product | undefined => {
    return products.find(p => p.name.toLowerCase() === name.toLowerCase());
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const value: ProductsContextType = {
    loading,
    setLoading,
    products,
    setProducts,
    productsDict,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    findProductById,
    findProductByName,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

// Hook to use products context
export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
}

// Export context for direct access if needed
export { ProductsContext };