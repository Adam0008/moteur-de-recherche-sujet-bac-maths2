<?php
require __DIR__ . '/auth_bootstrap.php';

// Vérifie que l'utilisateur est connecté
$userId = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupère toute la progression de l'utilisateur
    $stmt = $pdo->prepare(
        'SELECT annee, sujet_nom, exo_num, fait, appreciation, themes_json
         FROM user_progress
         WHERE user_id = :uid'
    );
    $stmt->execute(['uid' => $userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'ok' => true,
        'items' => array_map(function ($r) {
            return [
                'annee' => $r['annee'],
                'sujet_nom' => $r['sujet_nom'],
                'exo_num' => (int)$r['exo_num'],
                'fait' => (int)$r['fait'],
                'appreciation' => $r['appreciation'],
                'themes_json' => $r['themes_json'],
            ];
        }, $rows),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = read_json_body();

    $annee = trim($data['annee'] ?? '');
    $sujetNom = trim($data['sujet_nom'] ?? '');
    $exoNum = isset($data['exo_num']) ? (int)$data['exo_num'] : 0;

    if ($annee === '' || $sujetNom === '' || $exoNum <= 0) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'missing_or_invalid_fields'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $fait = !empty($data['fait']) ? 1 : 0;
    $appreciation = isset($data['appreciation']) ? trim((string)$data['appreciation']) : '';
    $themes = null;
    if (isset($data['themes']) && is_array($data['themes'])) {
        $themes = json_encode(array_values($data['themes']), JSON_UNESCAPED_UNICODE);
    }

    // Insert ou update pour ce triplet (user, année, sujet, exo)
    $stmt = $pdo->prepare(
        'INSERT INTO user_progress (user_id, annee, sujet_nom, exo_num, fait, appreciation, themes_json, updated_at)
         VALUES (:uid, :annee, :sujet, :exo, :fait, :app, :themes, NOW())
         ON DUPLICATE KEY UPDATE
           fait = VALUES(fait),
           appreciation = VALUES(appreciation),
           themes_json = VALUES(themes_json),
           updated_at = NOW()'
    );

    $stmt->execute([
        'uid' => $userId,
        'annee' => $annee,
        'sujet' => $sujetNom,
        'exo' => $exoNum,
        'fait' => $fait,
        'app' => $appreciation,
        'themes' => $themes,
    ]);

    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// Méthode non autorisée
http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
exit;
