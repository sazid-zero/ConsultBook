"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import type { UserData } from "./types"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  refreshUserData: (uid?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Fetch user data from PostgreSQL via Server Action
        try {
          // Dynamic import to avoid server-action-in-client-component issues if any, 
          // but we can import normally if configured correctly.
          const { getUserProfile } = await import("@/app/actions/user")
          const profile = await getUserProfile(user.uid)
          
          if (profile) {
            console.log("[AuthContext] Profile loaded:", profile.role);
            setUserData(profile as UserData)
          } else {
             console.log("[AuthContext] Profile load failed or returned null");
             setUserData(null)
          }
        } catch (err) {
            console.error("Failed to fetch user profile:", err)
            setUserData(null)
        }
      } else {
        console.log("[AuthContext] No Firebase user");
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshUserData = async (uid?: string) => {
    const targetUid = uid || user?.uid
    if (!targetUid) {
      console.log("[AuthContext] No UID available for refresh")
      return
    }
    try {
      // Dynamic import to avoid server-action-in-client-component issues
      const { getUserProfile } = await import("@/app/actions/user")
      console.log("[AuthContext] Forcing user profile refresh for:", targetUid)
      const profile = await getUserProfile(targetUid)
      
      if (profile) {
        console.log("[AuthContext] Profile refreshed:", profile.role)
        setUserData(profile as UserData)
      } else {
        console.log("[AuthContext] Refresh failed, profile not found")
        setUserData(null)
      }
    } catch (error) {
       console.error("Error refreshing user data:", error)
    }
  }

  return <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>{children}</AuthContext.Provider>
}
