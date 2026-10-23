<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(bool $ok, string $message = '', int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Methode nicht erlaubt.', 405);
}

// Honeypot-Feld: für Menschen unsichtbar, Bots füllen es oft trotzdem aus
if (trim($_POST['website'] ?? '') !== '') {
    respond(true); // so tun, als wäre alles gut, aber nichts verschicken
}

$name       = trim($_POST['name'] ?? '');
$email      = trim($_POST['email'] ?? '');
$telefon    = trim($_POST['telefon'] ?? '');
$kontaktweg = trim($_POST['kontaktweg'] ?? '');
$anliegen   = trim($_POST['anliegen'] ?? '');
$nachricht  = trim($_POST['nachricht'] ?? '');

if ($name === '' || $nachricht === '') {
    respond(false, 'Bitte alle Pflichtfelder ausfüllen.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Bitte eine gültige E-Mail-Adresse angeben.', 400);
}

// Zeilenumbrüche aus Kopfzeilen-Feldern entfernen (Header-Injection verhindern)
$clean = static fn(string $s): string => str_replace(["\r", "\n"], ' ', $s);
$name       = $clean($name);
$email      = $clean($email);
$telefon    = $clean($telefon);
$kontaktweg = $clean($kontaktweg);
$anliegen   = $clean($anliegen);

$empfaenger = 'info@haarfrei-trier.de';
$encode = static fn(string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';

// --- Mail an HaarFrei ---
$bodyIntern = "Neue Nachricht über das Kontaktformular auf haarfrei-trier.de\n\n"
    . "Name: {$name}\n"
    . "E-Mail: {$email}\n"
    . "Telefon: " . ($telefon !== '' ? $telefon : '-') . "\n"
    . "Gewünschter Kontaktweg: " . ($kontaktweg !== '' ? $kontaktweg : '-') . "\n"
    . "Anliegen: " . ($anliegen !== '' ? $anliegen : '-') . "\n\n"
    . "Nachricht:\n{$nachricht}\n";

$headersIntern = "From: HaarFrei Website <info@haarfrei-trier.de>\r\n"
    . "Reply-To: {$name} <{$email}>\r\n"
    . "Content-Type: text/plain; charset=UTF-8";

$okIntern = mail($empfaenger, $encode("Neue Kontaktanfrage von {$name}"), $bodyIntern, $headersIntern);

// --- Bestätigungsmail an den Absender ---
$bodyBestaetigung = "Hallo {$name},\n\n"
    . "vielen Dank für Ihre Nachricht über unsere Website. Wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich bei Ihnen zurück.\n\n"
    . "Ihre Nachricht:\n{$nachricht}\n\n"
    . "Viele Grüße\n"
    . "Ihr HaarFrei-Team\n"
    . "https://haarfrei-trier.de";

$headersBestaetigung = "From: HaarFrei Trier <info@haarfrei-trier.de>\r\n"
    . "Content-Type: text/plain; charset=UTF-8";

mail($email, $encode('Ihre Nachricht an HaarFrei Trier ist angekommen'), $bodyBestaetigung, $headersBestaetigung);

if ($okIntern) {
    respond(true, 'Vielen Dank für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen.');
}
respond(false, 'Beim Versand ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 500);
