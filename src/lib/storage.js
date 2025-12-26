import { supabase } from './supabase'

/**
 * Upload a doctor profile image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} doctorId - Optional doctor ID for naming the file
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadDoctorImage(file, doctorId = null) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB')
    }

    // Check if storage bucket exists
    let bucketExists = false
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      
      if (bucketError) {
        console.warn('Could not list buckets (this might be a permissions issue):', bucketError)
        // Continue anyway - the upload will fail with a better error if bucket doesn't exist
        console.log('Attempting upload anyway - will get specific error if bucket is missing')
      } else {
        // Check if bucket exists (case-insensitive check)
        bucketExists = buckets?.some(bucket => 
          bucket.name.toLowerCase() === 'doctor-images'.toLowerCase()
        )
        
        if (!bucketExists && buckets && buckets.length > 0) {
          console.log('Available buckets:', buckets.map(b => b.name).join(', '))
          throw new Error(
            `Storage bucket "doctor-images" not found. Available buckets: ${buckets.map(b => b.name).join(', ')}. Please create "doctor-images" bucket in Supabase dashboard.`
          )
        }
      }
    } catch (checkError) {
      // If it's our custom error, re-throw it
      if (checkError.message?.includes('not found')) {
        throw checkError
      }
      // Otherwise, log and continue - upload will fail with specific error
      console.warn('Bucket check failed, continuing with upload attempt:', checkError)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = doctorId 
      ? `${doctorId}-${Date.now()}.${fileExt}`
      : `doctor-${Date.now()}.${fileExt}`
    const filePath = `doctor-images/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('doctor-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      // Provide more specific error messages
      console.error('Upload error details:', error)
      
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        throw new Error(
          'Storage bucket "doctor-images" not found.\n\n' +
          'Please create it in Supabase:\n' +
          '1. Go to Storage in Supabase Dashboard\n' +
          '2. Click "New bucket"\n' +
          '3. Name it exactly: doctor-images\n' +
          '4. Make it Public\n' +
          '5. Click "Create bucket"'
        )
      } else if (error.message?.includes('new row violates row-level security') || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
        throw new Error(
          'Permission denied. Please:\n' +
          '1. Make sure you\'re logged in as admin\n' +
          '2. Run the SQL from setup-storage.sql to set up storage policies\n' +
          '3. Or make the bucket public in Storage settings'
        )
      } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        throw new Error('File already exists. Please try again with a different image.')
      } else if (error.statusCode === 413 || error.message?.includes('too large')) {
        throw new Error('File is too large. Maximum size is 5MB.')
      }
      
      // Generic error with the actual error message
      throw new Error(
        `Upload failed: ${error.message || 'Unknown error'}\n\n` +
        'Please check:\n' +
        '1. Storage bucket "doctor-images" exists and is public\n' +
        '2. You are logged in as admin\n' +
        '3. Storage policies are set up correctly'
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('doctor-images')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get image URL after upload.')
    }

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    // Re-throw with user-friendly message if it's not already a user-friendly error
    if (error.message && !error.message.includes('must be') && !error.message.includes('Please')) {
      throw new Error('Failed to upload image. Please check your storage configuration and try again.')
    }
    throw error
  }
}

/**
 * Delete a doctor profile image from Supabase Storage
 * @param {string} imageUrl - The URL of the image to delete
 */
export async function deleteDoctorImage(imageUrl) {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/doctor-images/')
    if (urlParts.length < 2) {
      console.warn('Invalid image URL format')
      return
    }

    const filePath = `doctor-images/${urlParts[1]}`

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('doctor-images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

