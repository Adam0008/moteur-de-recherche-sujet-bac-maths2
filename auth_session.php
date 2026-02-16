<?php
require __DIR__ . '/auth_bootstrap.php';

// Vérifie si la session est active et si l'utilisateur est connecté
if (session_status() !== PHP_SESSION_ACTIVE || !isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => true, 'logged_in' => false, 'user' => null], JSON_UNESCAPED_UNICODE);
    exit;
}

// Récupère les informations de l'utilisateur
$stmt = $pdo->prepare('SELECT id, nom, prenom, email FROM users WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Si l'utilisateur n'existe pas en base
if (!$user) {
    echo json_encode(['ok' => true, 'logged_in' => false, 'user' => null], JSON_UNESCAPED_UNICODE);
    exit;
}

// Réponse JSON avec les infos utilisateur
echo json_encode([
    'ok' => true,
    'logged_in' => true,
    'user' => [
        'id' => (int)$user['id'],
        'nom' => $user['nom'],
        'prenom' => $user['prenom'],
        'email' => $user['email'],
    ],
], JSON_UNESCAPED_UNICODE);

exit;
