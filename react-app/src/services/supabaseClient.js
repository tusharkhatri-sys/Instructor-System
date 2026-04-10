import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wqjtvgndhcktvcgjmryc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxanR2Z25kaGNrdHZjZ2ptcnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjA3NjIsImV4cCI6MjA5MTAzNjc2Mn0.xYcitwb5c8jJQ7I3tS_8-wiBr4b0DhOfvBUVYEn-ha8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
