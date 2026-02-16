<?php
// auth_bootstrap.php
// Configuration commune : connexion MySQL + session + réponse JSON

session_start();

header('Content-Type: application/json; charset=utf-8');

// TODO : REMPLACER CES VALEURS PAR CELLES DE VOTRE HÉBERGEUR
$DB_HOST = 'sql112.yzz.me';
$DB_NAME = 'yzzme_41172026_sujet_bac';
$DB_USER = 'yzzme_41172026';
$DB_PASS = 'XSrmxJzbHt1k';

// Adresse email utilisée comme expéditeur des mails automatiques
// ➜ À PERSONNALISER avec votre propre adresse (même domaine que l’hébergement si possible)
$APP_MAIL_FROM = 'adam.benslama02@gmail.com';
$APP_MAIL_FROM_NAME = 'Sujets Bac Maths';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // fetch en tableau associatif par défaut
        ]
    );
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'db_connection_failed',
        'message' => $e->getMessage(), // utile pour debug, à retirer en production
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Envoie un email texte simple. En cas d’erreur, on ignore (on ne bloque pas l’action).
 */
function app_send_mail(string $to, string $subject, string $body): void
{
    global $APP_MAIL_FROM, $APP_MAIL_FROM_NAME;

    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return;
    }

    $from = $APP_MAIL_FROM ?: 'no-reply@exemple.com';
    $fromName = $APP_MAIL_FROM_NAME ?: 'Sujets Bac Maths';

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers =
        'From: ' . $fromName . ' <' . $from . ">\r\n" .
        "MIME-Version: 1.0\r\n" .
        "Content-Type: text/plain; charset=utf-8\r\n";

    @mail($to, $encodedSubject, $body, $headers);
}

/**
 * Lit le corps JSON de la requête et renvoie un tableau associatif.
 */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    try {
        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        return is_array($data) ? $data : [];
    } catch (JsonException $e) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'error' => 'invalid_json',
            'message' => $e->getMessage(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Vérifie que l'utilisateur est connecté, sinon renvoie 401.
 * Renvoie l'id utilisateur (int).
 */
function require_login(): int
{
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'ok' => false,
            'error' => 'not_logged_in',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return (int)$_SESSION['user_id'];
}
