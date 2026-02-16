// =====================================================
// CONFIGURATION SUPABASE
// =====================================================

const SUPABASE_URL = "https://bmxonrzyrymmwlweykie.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qXghUgFuoBxwyJfs5Qg2vw_cbolYFvS";

// On récupère createClient depuis la librairie CDN
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// On le rend global
window.supabaseClient = supabaseClient;
