<?php
require __DIR__ . '/auth_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = read_json_body();
$email = trim($data['email'] ?? '');
$code = trim($data['code'] ?? '');

if ($email === '' || $code === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'missing_fields'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Récupère l'utilisateur + le code de reset
$stmt = $pdo->prepare(
    'SELECT u.id, u.nom, u.prenom, pr.code_hash, pr.expires_at
     FROM users u
     INNER JOIN password_resets pr ON pr.user_id = u.id
     WHERE u.email = :email
     LIMIT 1'
);
$stmt->execute(['email' => $email]);
$row = $stmt->fetch();

if (!$row) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_code'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Vérifie expiration
$now = new DateTimeImmutable();
$expiresAt = new DateTimeImmutable($row['expires_at']);
if ($now > $expiresAt) {
    // Code expiré, on le supprime
    $pdo->prepare('DELETE FROM password_resets WHERE user_id = :uid')->execute(['uid' => $row['id']]);
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'code_expired'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Vérifie le code
if (!password_verify($code, $row['code_hash'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_code'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Code correct : on enregistre dans la session l'utilisateur autorisé à changer son mot de passe
$_SESSION['reset_user_id'] = (int)$row['id'];

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);

