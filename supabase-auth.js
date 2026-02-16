// =====================================================
// AUTHENTIFICATION AVEC SUPABASE (VERSION SÉCURISÉE)
// =====================================================


// ===== INSCRIPTION =====
async function registerUser(email, password, fullName = "") {
  try {
    // 1️⃣ Création du compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (authError) {
      alert("Erreur d'inscription : " + authError.message);
      return null;
    }

    if (!authData.user) {
      alert("Erreur : utilisateur non créé.");
      return null;
    }

    // 2️⃣ Création du profil dans la table public.users
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName
        }
      ]);

    if (userError) {
      alert("Erreur création profil : " + userError.message);
      return null;
    }

    alert("✅ Inscription réussie ! Vérifie ton email.");
    return authData.user;

  } catch (error) {
    alert("Erreur : " + error.message);
    return null;
  }
}


// ===== CONNEXION =====
async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("Erreur de connexion : " + error.message);
      return null;
    }

    if (!data.user) {
      alert("Utilisateur introuvable.");
      return null;
    }

    // Stocke infos utilisateur localement
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userEmail', data.user.email);

    console.log("✅ Connecté !");

    // Charger la progression
    await loadUserProgress(data.user.id);

    return data.user;

  } catch (error) {
    alert("Erreur : " + error.message);
    return null;
  }
}


// ===== DÉCONNEXION =====
async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Erreur de déconnexion : " + error.message);
      return;
    }

    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProgress');

    console.log("✅ Déconnecté !");
    location.reload();

  } catch (error) {
    alert("Erreur : " + error.message);
  }
}


// ===== CHARGER LA PROGRESSION =====
async function loadUserProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Erreur chargement progression :", error.message);
      return null;
    }

    if (data) {
      localStorage.setItem('userProgress', JSON.stringify(data));
      console.log("📊 Progression chargée");
      return data;
    }

    // Si aucune progression → en créer une
    return await createUserProgress(userId);

  } catch (error) {
    console.error("Erreur :", error.message);
    return null;
  }
}


// ===== CRÉER PROGRESSION INITIALE =====
async function createUserProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          sujets_traites: [],
          sujets_corriges: [],
          score: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur création progression :", error.message);
      return null;
    }

    localStorage.setItem('userProgress', JSON.stringify(data));
    console.log("✅ Progression créée");
    return data;

  } catch (error) {
    console.error("Erreur :", error.message);
    return null;
  }
}


// ===== SAUVEGARDER PROGRESSION =====
async function saveUserProgress(userId, progressData) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        sujets_traites: progressData.sujets_traites || [],
        sujets_corriges: progressData.sujets_corriges || [],
        score: progressData.score || 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("Erreur sauvegarde :", error.message);
      return null;
    }

    localStorage.setItem('userProgress', JSON.stringify(data));
    console.log("✅ Progression sauvegardée");
    return data;

  } catch (error) {
    console.error("Erreur :", error.message);
    return null;
  }
}


// ===== AJOUTER UN SUJET CONSULTÉ =====
async function markSubjectAsViewed(userId, subjectId, type = 'sujets_traites') {
  try {
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const subjects = progress[type] || [];

    if (!subjects.includes(subjectId)) {
      subjects.push(subjectId);
    }

    progress[type] = subjects;

    return await saveUserProgress(userId, progress);

  } catch (error) {
    console.error("Erreur :", error.message);
    return null;
  }
}


// ===== UTILITAIRES =====
function isUserLoggedIn() {
  return localStorage.getItem('userId') !== null;
}

function getCurrentUserId() {
  return localStorage.getItem('userId');
}

function getCurrentUserEmail() {
  return localStorage.getItem('userEmail');
}
