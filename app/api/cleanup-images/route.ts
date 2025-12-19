import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This endpoint deletes food images older than 24 hours
// Keep the log records but remove the images to save storage costs
// Call this via Vercel Cron or any scheduler

// Security: Use a secret key to prevent unauthorized access
const CLEANUP_SECRET = process.env.CLEANUP_SECRET_KEY

export async function POST(req: Request) {
  try {
    // Verify secret key
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    
    if (CLEANUP_SECRET && secret !== CLEANUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate cutoff time (24 hours ago)
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 24)

    console.log('[Cleanup] Looking for images older than:', cutoffTime.toISOString())

    // Get logs with images older than 24 hours
    const { data: logsWithImages, error: fetchError } = await supabase
      .from('logs')
      .select('id, image_url, device_id, user_id')
      .not('image_url', 'is', null)
      .lt('created_at', cutoffTime.toISOString())

    if (fetchError) {
      console.error('[Cleanup] Fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!logsWithImages || logsWithImages.length === 0) {
      console.log('[Cleanup] No old images found')
      return NextResponse.json({ 
        success: true, 
        message: 'No images to clean up',
        deletedCount: 0 
      })
    }

    console.log(`[Cleanup] Found ${logsWithImages.length} old images to delete`)

    // Extract file paths from URLs and delete from storage
    const deletePromises = logsWithImages.map(async (log) => {
      if (!log.image_url) return null

      // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/food-images/path/file.jpg
      const urlParts = log.image_url.split('/food-images/')
      if (urlParts.length < 2) return null
      
      const filePath = urlParts[1]
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('food-images')
        .remove([filePath])

      if (deleteError) {
        console.error(`[Cleanup] Failed to delete ${filePath}:`, deleteError)
        return null
      }

      // Update log record to remove image_url reference
      await supabase
        .from('logs')
        .update({ image_url: null })
        .eq('id', log.id)

      return filePath
    })

    const results = await Promise.all(deletePromises)
    const deletedCount = results.filter(Boolean).length

    console.log(`[Cleanup] Successfully deleted ${deletedCount} images`)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} images`,
      deletedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Cleanup] Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also support GET for simple cron services
export async function GET(req: Request) {
  return POST(req)
}
