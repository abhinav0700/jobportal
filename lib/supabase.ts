import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string || "https://qytluveckuaexnyshywz.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dGx1dmVja3VhZXhueXNoeXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MDI4MTksImV4cCI6MjA2MDE3ODgxOX0.DvBEEEEe9UTi3ZrVu-ebqT1UHjlcpsfVIG4vZHlYuko"

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create a single supabase client for server components
const createServerClient = () => {
  // Only create server client if we're in a server environment
  if (typeof window !== 'undefined') {
    return null
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Environment Variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' : undefined
  })

  if (!supabaseUrl) {
    throw new Error('Supabase URL is required. Please set either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your environment variables.')
  }

  if (!supabaseServiceKey) {
    throw new Error('Supabase service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export const supabaseBrowser = createBrowserClient()
export const supabaseServer = createServerClient()
