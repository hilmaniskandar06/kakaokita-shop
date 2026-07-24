import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krpqmngiitfwferlzqjl.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtMsAYpoNZS-ovcAVFn64Q_m-VJL5vY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
