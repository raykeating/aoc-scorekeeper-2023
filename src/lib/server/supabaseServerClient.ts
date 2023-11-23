import { SERVICE_TOKEN } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_TOKEN);
