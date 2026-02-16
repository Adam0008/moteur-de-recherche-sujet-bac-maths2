const SUPABASE_URL = "https://bmxonrzyrymmwlweykie.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qXghUgFuoBxwyJfs5Qg2vw_cbolYFvS";

// On crée un client propre
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// On le rend global sous un autre nom
window.supabaseClient = supabaseClient;

console.log("✅ Supabase connecté !");
