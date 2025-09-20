/**
 * API Authentication Utilities
 * 
 * Provides server-side authentication helpers for Next.js API routes.
 * Handles JWT token validation and Supabase client creation with proper
 * authentication context.
 * 
 * @fileoverview Server-side authentication utilities for API routes
 * @author TaskFlow Team
 * @version 2.1.0
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Authenticates a user from the request headers and returns user data with Supabase client
 * 
 * This function extracts the JWT token from the Authorization header, creates a
 * Supabase client with the token, and validates the user's authentication status.
 * 
 * @param request - The Next.js request object containing headers
 * @returns Promise resolving to an object containing the authenticated user and Supabase client
 * @throws {Error} When no authorization header is present
 * @throws {Error} When user authentication fails or user is not found
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   try {
 *     const { user, supabase } = await getAuthenticatedUser(request)
 *     // Use authenticated user and supabase client
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 * }
 * ```
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // Extract authorization header from request
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  // Create Supabase client with authentication token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  )

  // Validate user authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabase }
}
