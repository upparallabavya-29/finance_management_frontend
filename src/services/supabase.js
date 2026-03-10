import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ykfnzvkcqelxopnhndjw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZm56dmtjcWVseG9wbmhuZGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODIyMzIsImV4cCI6MjA4NzQ1ODIzMn0.ftYAbj3kQ8hlG73PQjzVpc8BZAQK2CU5udpBf_3XTDs'

export const supabase = createClient(supabaseUrl, supabaseKey)
