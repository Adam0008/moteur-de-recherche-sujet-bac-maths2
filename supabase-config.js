// Configuration Supabase
// ⚠️ REMPLACE CES VALEURS PAR TES CLÉS !

const SUPABASE_URL = "https://bmxonrzyrymmwlweykie.supabase.co"; // Copie ton URL ici
const SUPABASE_ANON_KEY = "sb_publishable_qXghUgFuoBxwyJfs5Qg2vw_cbolYFvS"; // Copie ta clé publique ici

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporte supabase pour l'utiliser dans les autres fichiers
window.supabase = supabase;
