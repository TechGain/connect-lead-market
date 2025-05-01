
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the values from src/integrations/supabase/client.ts which has the correct credentials
const supabaseUrl = "https://bfmxxuarnqmxqqnpxqjf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbXh4dWFybnFteHFxbnB4cWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTc4ODMsImV4cCI6MjA2MTY5Mzg4M30.MAQZ7I3pshciBJANhlPThK6XBxGemIPgflsMDz3OB_4";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
