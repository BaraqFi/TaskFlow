/**
 * Client-side API Request Utilities
 * 
 * Provides authenticated request helpers for client-side API calls.
 * Automatically handles JWT token extraction and authentication headers
 * for seamless communication with protected API endpoints.
 * 
 * @fileoverview Client-side authenticated request utilities
 * @author TaskFlow Team
 * @version 2.1.0
 */

import { supabase } from './supabase'

/**
 * Makes an authenticated request to API endpoints with automatic JWT token handling
 * 
 * This function automatically extracts the user's session token and includes it
 * in the request headers for authentication. It handles common error scenarios
 * and provides consistent error handling across the application.
 * 
 * @param url - The API endpoint URL to make the request to
 * @param options - Optional fetch options (method, body, headers, etc.)
 * @returns Promise resolving to the JSON response data
 * @throws {Error} When user is not authenticated
 * @throws {Error} When the API request fails or returns an error
 * 
 * @example
 * ```typescript
 * // GET request
 * const tasks = await makeAuthenticatedRequest('/api/tasks')
 * 
 * // POST request with data
 * const newTask = await makeAuthenticatedRequest('/api/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'New Task', status: 'todo' })
 * })
 * ```
 */
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Ensure user is authenticated
  if (!session) {
    throw new Error('No active session')
  }

  // Prepare headers with authentication token
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  }

  // Make the authenticated request
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle response errors with proper error messages
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}
