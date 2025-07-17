"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authService, setToken, removeToken, type User } from "@/services"
import { getUserClubRoles } from "@/lib/api"
import { getToken } from "@/lib/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  loadUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.login({ email, password, rememberMe })

          if (response.success) {
            const { user, accessToken } = response.data

            // Store token in localStorage
            setToken(accessToken)

            set({
              user,
              token: accessToken,
              isLoading: false,
              error: null,
            })

            return true
          } else {
            set({
              isLoading: false,
              error: response.message || "Login failed",
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
          })
          return false
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.register({
            full_name: name, // Theo API documentation
            email,
            password,
          })

          if (response.success) {
            // Registration thành công - không tự động login
            // User cần verify email trước
            set({
              isLoading: false,
              error: null,
            })
            return true
          } else {
            set({
              isLoading: false,
              error: response.message || "Registration failed",
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Registration failed",
          })
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          // Call logout API
          await authService.logout()
        } catch (error) {
          console.warn("Logout API call failed:", error)
        } finally {
          // Always clear local state
          removeToken()
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null })

        try {
          // Note: You may need to implement updateProfile in authService
          // For now, we'll just update local state
          const currentUser = get().user
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data }
            set({
              user: updatedUser,
              isLoading: false,
            })
            return true
          }

          set({
            isLoading: false,
            error: "No user to update",
          })
          return false
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Update failed",
          })
          return false
        }
      },

      loadUser: async () => {
        const token = getToken();
        if (!token) return

        set({ isLoading: true, error: null })

        try {
          const profileResponse = await authService.getProfile();
          const userId = profileResponse?.data?.id;
          const clubRolesResponse = await getUserClubRoles(userId, token);

          if (profileResponse.success) {
            const user = {
              ...profileResponse.data,
              club_roles: Array.isArray(clubRolesResponse.data) ? clubRolesResponse.data : [],
            }

            set({
              user,
              token: token ? "existing" : null,
              isLoading: false,
              error: null,
            })
          } else {
            // Token might be invalid, clear it
            removeToken()
            set({
              user: null,
              token: null,
              isLoading: false,
              error: null,
            })
          }
        } catch (error: any) {
          // Token might be invalid, clear it
          removeToken()
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          })
        }
      },

      clearError: () => {
        set({ error: null })
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
