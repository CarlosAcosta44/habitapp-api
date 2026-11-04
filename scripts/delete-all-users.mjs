import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function deleteAll() {
  console.log('Fetching users...')
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    console.error('Error fetching users:', error)
    return
  }

  console.log(`Found ${users.length} users. Deleting...`)
  for (const user of users) {
    const { error: delError } = await supabase.auth.admin.deleteUser(user.id)
    if (delError) {
      console.error(`Failed to delete ${user.email}:`, delError.message)
    } else {
      console.log(`Deleted ${user.email}`)
    }
  }
  console.log('Done clearing auth.users!')
}
void deleteAll();
