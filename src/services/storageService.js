import { supabase } from '../config/supabase'

export async function uploadImage(dataUrl, path, bucketName = 'public') {
  // Convert Data URL to Blob
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path)

  return publicUrlData.publicUrl
}
