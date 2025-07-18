"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Auth Provider to initialize user state on app start
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore(state => state.loadUser)

  useEffect(() => {
    // Load user on app initialization
    loadUser()
  }, [loadUser])

  return <>{children}</>
}

export default AuthProvider
