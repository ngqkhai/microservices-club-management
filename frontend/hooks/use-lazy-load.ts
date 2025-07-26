import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

interface LazyLoadState<T> {
  data: T | null
  loading: boolean
  error: string | null
  loaded: boolean
}

interface UseLazyLoadOptions {
  onError?: (error: string) => void
}

export function useLazyLoad<T>(options?: UseLazyLoadOptions) {
  const { toast } = useToast()
  
  const [states, setStates] = useState<Record<string, LazyLoadState<T>>>({})

  const loadData = useCallback(async (
    key: string,
    fetchFn: () => Promise<{ success: boolean; data?: T; message?: string }>
  ) => {
    // If already loaded or loading, don't reload
    if (states[key]?.loaded || states[key]?.loading) {
      return states[key]?.data
    }

    // Set loading state
    setStates(prev => ({
      ...prev,
      [key]: {
        data: null,
        loading: true,
        error: null,
        loaded: false
      }
    }))

    try {
      const response = await fetchFn()
      
      if (response.success && response.data) {
        setStates(prev => ({
          ...prev,
          [key]: {
            data: response.data!,
            loading: false,
            error: null,
            loaded: true
          }
        }))
        return response.data
      } else {
        throw new Error(response.message || 'Failed to load data')
      }
    } catch (error: any) {
      const errorMsg = error.message || 'An error occurred'
      
      setStates(prev => ({
        ...prev,
        [key]: {
          data: null,
          loading: false,
          error: errorMsg,
          loaded: false
        }
      }))

      if (options?.onError) {
        options.onError(errorMsg)
      } else {
        toast({
          title: "Lỗi",
          description: errorMsg,
          variant: "destructive",
        })
      }
      
      return null
    }
  }, [states, toast, options])

  const getState = useCallback((key: string): LazyLoadState<T> => {
    return states[key] || {
      data: null,
      loading: false,
      error: null,
      loaded: false
    }
  }, [states])

  const resetState = useCallback((key?: string) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: {
          data: null,
          loading: false,
          error: null,
          loaded: false
        }
      }))
    } else {
      setStates({})
    }
  }, [])

  const updateData = useCallback((key: string, data: T) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        data,
        loading: false,
        error: null,
        loaded: true
      }
    }))
  }, [])

  return {
    loadData,
    getState,
    resetState,
    updateData
  }
}
