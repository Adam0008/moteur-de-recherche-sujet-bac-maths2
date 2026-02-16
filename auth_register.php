<?php
require __DIR__ . '/auth_bootstrap.php';

// Vérifie que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = read_json_body();

$nom = trim($data['nom'] ?? '');
$prenom = trim($data['prenom'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Vérifications des champs
if ($nom === '' || $prenom === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing_fields'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!preg_match("/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/u", $nom) || !preg_match("/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/u", $prenom)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_name'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_email'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'password_too_short'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Vérifier si l'email existe déjà
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'email_exists'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Hash du mot de passe
$hash = password_hash($password, PASSWORD_DEFAULT);

// Insertion dans la base
$stmt = $pdo->prepare(
    'INSERT INTO users (nom, prenom, email, password_hash, created_at)
     VALUES (:nom, :prenom, :email, :hash, NOW())'
);
$stmt->execute([
    'nom' => $nom,
    'prenom' => $prenom,
    'email' => $email,
    'hash' => $hash,
]);

// Connexion automatique après création
$userId = (int)$pdo->lastInsertId();
$_SESSION['user_id'] = $userId;

// Envoi d'un email de bienvenue (non bloquant)
$prenomSafe = $prenom !== '' ? $prenom : '';
$nomSafe = $nom !== '' ? $nom : '';
$body = "Bonjour {$prenomSafe} {$nomSafe},\n\n"
    . "Votre compte sur le site Sujets Bac Maths a bien été créé.\n"
    . "Vous pouvez maintenant vous connecter et retrouver votre progression.\n\n"
    . "Bon travail !";
app_send_mail($email, 'Bienvenue sur Sujets Bac Maths', $body);

// Réponse JSON
echo json_encode([
    'ok' => true,
    'user' => [
        'id' => $userId,
        'nom' => $nom,
        'prenom' => $prenom,
        'email' => $email,
    ],
], JSON_UNESCAPED_UNICODE);

exit;
