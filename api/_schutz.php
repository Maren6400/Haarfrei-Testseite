<?php
// Gemeinsame Schutzfunktionen für die Bewertungs-Endpunkte.
// Speichert keine Inhalte – nur gehashte IP + Zeitstempel fürs Rate-Limit.

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function antwort($status, array $daten) {
    http_response_code($status);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE);
    exit;
}

// Konfiguration: bevorzugt außerhalb des Webroots, sonst api/.bewertung-config.php
function lade_config() {
    $pfade = [
        dirname(__DIR__, 2) . '/bewertung-config.php', // FTP-Wurzel, neben /haarfrei-trier.de/
        __DIR__ . '/.bewertung-config.php',            // Fallback, per .htaccess gesperrt
    ];
    foreach ($pfade as $p) {
        if (is_readable($p)) {
            $c = require $p;
            if (is_array($c)) return $c;
        }
    }
    return [];
}

function erlaubte_hosts(array $config) {
    $hosts = ['haarfrei-trier.de', 'www.haarfrei-trier.de'];
    foreach (($config['zusaetzliche_hosts'] ?? []) as $h) $hosts[] = strtolower($h);
    return $hosts;
}

function pruefe_anfrage(array $config) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        antwort(405, ['ok' => false, 'fehler' => 'Nur POST erlaubt']);
    }

    // Herkunft: Origin, ersatzweise Referer
    $quelle = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
    $host = strtolower((string) parse_url($quelle, PHP_URL_HOST));
    if (!$host || !in_array($host, erlaubte_hosts($config), true)) {
        antwort(403, ['ok' => false, 'fehler' => 'Herkunft nicht erlaubt']);
    }
}

function lies_json() {
    $roh = file_get_contents('php://input', false, null, 0, 20000);
    $daten = json_decode($roh ?: '', true);
    if (!is_array($daten)) antwort(400, ['ok' => false, 'fehler' => 'Ungültige Anfrage']);
    return $daten;
}

// Text säubern und auf max. Zeichen kürzen
function kuerze($wert, $max = 1000) {
    if (!is_string($wert) && !is_numeric($wert)) return '';
    $t = trim(strip_tags((string) $wert));
    $t = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $t);
    return mb_substr($t, 0, $max, 'UTF-8');
}

// Datei-basiertes Rate-Limit pro IP (gehasht), z. B. 10 Anfragen pro Stunde
function rate_limit($topf, $max = 10, $fenster = 3600) {
    $basis = dirname(__DIR__, 2) . '/bewertung-ratelimit';
    if (!is_dir($basis) && !@mkdir($basis, 0700, true)) {
        $basis = sys_get_temp_dir() . '/haarfrei-bewertung-ratelimit';
        if (!is_dir($basis)) @mkdir($basis, 0700, true);
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unbekannt';
    $datei = $basis . '/' . $topf . '-' . hash('sha256', $ip . '|haarfrei') . '.json';

    $fh = @fopen($datei, 'c+');
    if (!$fh) return; // Rate-Limit nicht verfügbar – Anfrage nicht blockieren
    flock($fh, LOCK_EX);
    $jetzt = time();
    $zeiten = json_decode(stream_get_contents($fh) ?: '[]', true) ?: [];
    $zeiten = array_values(array_filter($zeiten, function ($t) use ($jetzt, $fenster) {
        return is_int($t) && $t > $jetzt - $fenster;
    }));
    if (count($zeiten) >= $max) {
        flock($fh, LOCK_UN);
        fclose($fh);
        antwort(429, ['ok' => false, 'fehler' => 'Zu viele Anfragen. Bitte später erneut versuchen.']);
    }
    $zeiten[] = $jetzt;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($zeiten));
    flock($fh, LOCK_UN);
    fclose($fh);
}
