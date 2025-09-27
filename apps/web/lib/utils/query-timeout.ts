/**
 * Wraps a Supabase query with a timeout to prevent infinite loading
 * @param queryPromise The Supabase query promise
 * @param timeoutMs Timeout in milliseconds (default: 10000)
 * @returns The query result or throws timeout error
 */
export async function queryWithTimeout<T>(
  queryPromise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout - please check your connection')), timeoutMs)
  )

  try {
    const result = await Promise.race([queryPromise, timeoutPromise])
    return result
  } catch (error) {
    console.error('Query failed:', error)
    throw error
  }
}