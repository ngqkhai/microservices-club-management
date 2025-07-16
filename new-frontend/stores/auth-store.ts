"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock successful login
        const mockUser = {
          id: "user123",
          name: "Nguyễn Văn An",
          email: email,
          phone: "+84 123 456 789",
          avatar_url: "/placeholder.svg?height=100&width=100",
        }

        const mockToken = "mock-jwt-token-" + Date.now()

        set({
          user: mockUser,
          token: mockToken,
          isLoading: false,
        })

        return true
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true })

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock successful signup
        const mockUser = {
          id: "user123",
          name: name,
          email: email,
          avatar_url: "/placeholder.svg?height=100&width=100",
        }

        const mockToken = "mock-jwt-token-" + Date.now()

        set({
          user: mockUser,
          token: mockToken,
          isLoading: false,
        })

        return true
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return false

        set({ isLoading: true })

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const updatedUser = { ...user, ...data }
        set({ user: updatedUser, isLoading: false })

        return true
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
)
