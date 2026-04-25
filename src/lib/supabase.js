import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bbfjfzmgzxolshvpcxjt.supabase.co'
const supabaseAnonKey = 'sb_publishable_n6bimE3-ZIWQjyqG3oYvMg_tAHcfHy_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
