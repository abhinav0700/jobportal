"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name: string
  role: "employer" | "job_seeker" | "admin"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (name: string, email: string, password: string, role: "employer" | "job_seeker") => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession()

        if (session?.user) {
          const { data: userData, error } = await supabaseBrowser
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("Error fetching user data:", error)
            setUser(null)
            setLoading(false)
            return
          }

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
            })
          }
        }
      } catch (error) {
        console.error("Error in getUser:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const { data: userData, error } = await supabaseBrowser
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("Error fetching user data:", error)
            setUser(null)
            setLoading(false)
            return
          }

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setUser(null)
      } finally {
        setLoading(false)
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (name: string, email: string, password: string, role: "employer" | "job_seeker") => {
    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        const { error: insertError } = await supabaseBrowser.from("users").insert([
          {
            id: data.user.id,
            name,
            email,
            role,
          },
        ])

        if (insertError) {
          return { error: insertError }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
