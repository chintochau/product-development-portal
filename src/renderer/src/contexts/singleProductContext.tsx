import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useProducts } from './productsContext'
import type { Product, Feature } from '../../../@types/models'
import type { Comment } from '../../../@types/models/comment.types'

interface SingleProductContextType {
  loading: boolean
  setLoading: (loading: boolean) => void
  productData: Product | null
  productId: string | null
  setProductId: (id: string | null) => void
  features: Feature[]
  featuresLoading: boolean
  comments: Comment[]
  commentsLoading: boolean
  refreshProduct: () => Promise<void>
  refreshFeatures: () => Promise<void>
  refreshComments: () => Promise<void>
  // Legacy GitLab fields - to be removed
  iid: string | null
  setIid: (iid: string | null) => void
  notes: any
  pifs: any
  hardware: any
  software: any
  epics: any[]
  milestones: any[]
  tickets: any[]
  setTickets: (tickets: any[]) => void
  selectedEpicId: string | null
  setSelectedEpicId: (id: string | null) => void
  shouldRefreshProductData: boolean
  setShouldRefreshProductData: (value: boolean) => void
}

const SingleProductContext = createContext<SingleProductContextType | undefined>(undefined)

export const useSingleProduct = () => {
  const context = useContext(SingleProductContext)
  if (!context) {
    throw new Error('useSingleProduct must be used within SingleProductProvider')
  }
  return context
}

export const SingleProductProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [productData, setProductData] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  
  // Legacy GitLab state - to be phased out
  const [iid, setIid] = useState<string | null>(null)
  const [notes, setNotes] = useState(null)
  const [pifs, setPifs] = useState(null)
  const [hardware, setHardware] = useState(null)
  const [software, setSoftware] = useState(null)
  const [epics, setEpics] = useState([])
  const [milestones, setMilestones] = useState([])
  const [tickets, setTickets] = useState([])
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null)
  const [shouldRefreshProductData, setShouldRefreshProductData] = useState(false)

  // Load product data from PostgreSQL when productId changes
  useEffect(() => {
    if (!productId) {
      setProductData(null)
      setFeatures([])
      setComments([])
      return
    }

    loadProductData(productId)
  }, [productId])

  // Load product data
  const loadProductData = async (id: string) => {
    setLoading(true)
    try {
      // Fetch from PostgreSQL
      const response = await window.api.products.getById(id)
      if (response.success && response.data) {
        setProductData(response.data)
        if (response.data.gitlab_issue_iid) {
          setIid(response.data.gitlab_issue_iid.toString())
        }
      }

      // Load features and comments in parallel
      await Promise.all([
        loadFeatures(id),
        loadComments(id)
      ])
    } catch (error) {
      console.error('Error loading product data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load features for the product
  const loadFeatures = async (productId: string) => {
    setFeaturesLoading(true)
    try {
      const response = await window.api.features.getByProduct(productId)
      if (response.success && response.data) {
        setFeatures(response.data)
      }
    } catch (error) {
      console.error('Error loading features:', error)
    } finally {
      setFeaturesLoading(false)
    }
  }

  // Load comments for the product
  const loadComments = async (productId: string) => {
    setCommentsLoading(true)
    try {
      const response = await window.api.comments.getByEntity('product', productId)
      if (response.success && response.data) {
        setComments(response.data)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // Refresh functions
  const refreshProduct = async () => {
    if (productId) {
      await loadProductData(productId)
    }
  }

  const refreshFeatures = async () => {
    if (productId) {
      await loadFeatures(productId)
    }
  }

  const refreshComments = async () => {
    if (productId) {
      await loadComments(productId)
    }
  }

  // Handle legacy iid changes (for backward compatibility)
  useEffect(() => {
    // When iid is set but we don't have a productId, try to find the product
    if (iid && !productId) {
      // This is a temporary solution - we need to look up the product by GitLab IID
      console.warn('Legacy iid used:', iid, '- need to migrate to PostgreSQL ID')
    }
  }, [iid, productId])

  const value: SingleProductContextType = {
    loading,
    setLoading,
    productData,
    productId,
    setProductId,
    features,
    featuresLoading,
    comments,
    commentsLoading,
    refreshProduct,
    refreshFeatures,
    refreshComments,
    // Legacy fields
    iid,
    setIid,
    notes,
    pifs,
    hardware,
    software,
    epics,
    milestones,
    tickets,
    setTickets,
    selectedEpicId,
    setSelectedEpicId,
    shouldRefreshProductData,
    setShouldRefreshProductData
  }

  return (
    <SingleProductContext.Provider value={value}>
      {children}
    </SingleProductContext.Provider>
  )
}