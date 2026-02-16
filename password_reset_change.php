<?php
require __DIR__ . '/auth_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['reset_user_id'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'no_reset_session'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = read_json_body();
$password = $data['password'] ?? '';

if ($password === '' || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'password_too_short'], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)$_SESSION['reset_user_id'];

// Met à jour le mot de passe
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
$stmt->execute([
    'hash' => $hash,
    'id'   => $userId,
]);

// On supprime les codes de reset de cet utilisateur
$pdo->prepare('DELETE FROM password_resets WHERE user_id = :uid')->execute(['uid' => $userId]);

// On connecte l'utilisateur et on supprime la session de reset
unset($_SESSION['reset_user_id']);
$_SESSION['user_id'] = $userId;

// Renvoie les infos utilisateur (comme pour login)
$stmt = $pdo->prepare('SELECT id, nom, prenom, email FROM users WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['ok' => true, 'user' => null], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'user' => [
        'id' => (int)$user['id'],
        'nom' => $user['nom'],
        'prenom' => $user['prenom'],
        'email' => $user['email'],
    ],
], JSON_UNESCAPED_UNICODE);

