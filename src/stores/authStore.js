import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, getProfile, upsertProfile } from '../lib/supabase'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      initialized: false,

      setUser:    (user)    => set({ user }),
      // ── Sign in with Password ────────────────────────────────
      signIn: async (email, password) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) throw error
          if (data.user) {
            let profile = await getProfile(data.user.id)
            set({ user: data.user, profile })
          }
          return data
        } finally {
          set({ loading: false })
        }
      },

      // ── Sign up with Password ────────────────────────────────
      signUp: async (email, password, name) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              }
            }
          })
          if (error) throw error
          
          // If session is present, they are fully logged in (Email Confirmations disabled)
          if (data.session) {
            let profile = await getProfile(data.user.id)
            set({ user: data.user, profile })
          }
          // If session is null, they need to confirm their email. We do not set the user in state.
          return data
        } finally {
          set({ loading: false })
        }
      },

      // ── Initialise session on app boot ────────────────────────
      initialize: async () => {
        if (get().initialized) return
        set({ loading: true })

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          set({ user: session.user })
          try {
            const profile = await getProfile(session.user.id)
            set({ profile })
          } catch {}
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            set({ user: session.user })
            try {
              let profile = await getProfile(session.user.id)
              if (!profile) {
                profile = await upsertProfile({
                  id:         session.user.id,
                  name:       session.user.user_metadata?.full_name ||
                              session.user.email?.split('@')[0] || 'Student',
                  email:      session.user.email,
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                })
              }
              set({ profile })
            } catch {}
          } else {
            set({ user: null, profile: null })
          }
        })

        set({ loading: false, initialized: true })
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'findit-auth',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)

export default useAuthStore
