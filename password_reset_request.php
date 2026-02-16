<?php
require __DIR__ . '/auth_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = read_json_body();
$email = trim($data['email'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // Réponse "OK" même si l'email est vide ou invalide, pour ne pas révéler si un compte existe
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// Cherche l'utilisateur
$stmt = $pdo->prepare('SELECT id, nom, prenom FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    // Même réponse si l'utilisateur n'existe pas
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)$user['id'];

// Génère un code de validation aléatoire à 6 caractères (chiffres + lettres sans ambiguïté)
$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
$code = '';
for ($i = 0; $i < 6; $i++) {
    $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
}

$codeHash = password_hash($code, PASSWORD_DEFAULT);
$expiresAt = (new DateTimeImmutable('+30 minutes'))->format('Y-m-d H:i:s');

// Supprime les anciens codes pour cet utilisateur
$pdo->prepare('DELETE FROM password_resets WHERE user_id = :uid')->execute(['uid' => $userId]);

// Enregistre le nouveau code
$stmt = $pdo->prepare(
    'INSERT INTO password_resets (user_id, code_hash, expires_at, created_at)
     VALUES (:uid, :hash, :expires_at, NOW())'
);
$stmt->execute([
    'uid' => $userId,
    'hash' => $codeHash,
    'expires_at' => $expiresAt,
]);

// Envoie le code par email (non bloquant)
$prenomSafe = $user['prenom'] ?? '';
$nomSafe = $user['nom'] ?? '';
$body = "Bonjour {$prenomSafe} {$nomSafe},\n\n"
    . "Vous avez demandé à réinitialiser votre mot de passe pour le site Sujets Bac Maths.\n"
    . "Votre code de validation est : {$code}\n\n"
    . "Ce code est valable 30 minutes.\n\n"
    . "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.";
app_send_mail($email, 'Réinitialisation de votre mot de passe', $body);

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);

