import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mufcgrckuitzxyyxmsjh.supabase.co';
const supabaseAnonKey = 'sb_publishable_tInAev0NeIEBH9S8GqHe1Q_Li7osMs4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);