<?php
// Versendet Website-Bewertungen (zur manuellen Freigabe) und interne Hinweise
// per E-Mail an info@haarfrei-trier.de. Keine Speicherung auf dem Server.
require __DIR__ . '/_schutz.php';

$config = lade_config();
pruefe_anfrage($config);
rate_limit('senden', 10, 3600);

$d = lies_json();

// Honeypot gegen Bots
if (!empty($d['website'])) antwort(200, ['ok' => true]);

$art = ($d['art'] ?? '') === 'intern' ? 'intern' : 'bewertung';
$text = kuerze($d['text'] ?? '', 1000);
if ($text === '') antwort(400, ['ok' => false, 'fehler' => 'Text fehlt']);

$datum = (new DateTime('now', new DateTimeZone('Europe/Berlin')))->format('d.m.Y, H:i') . ' Uhr';

if ($art === 'bewertung') {
    $sterne = (int) ($d['sterne'] ?? 0);
    $name = kuerze($d['anzeigename'] ?? '', 60);
    if ($sterne < 1 || $sterne > 5) antwort(400, ['ok' => false, 'fehler' => 'Bitte Sterne wählen']);
    if ($name === '') antwort(400, ['ok' => false, 'fehler' => 'Anzeigename fehlt']);
    if (($d['einwilligung'] ?? false) !== true) antwort(400, ['ok' => false, 'fehler' => 'Einwilligung fehlt']);

    $erlaubteZonen = ['Achseln', 'Beine', 'Bikinizone', 'Gesicht', 'Arme', 'Rücken', 'Brust', 'Andere'];
    $zonen = array_values(array_intersect($erlaubteZonen, array_filter(is_array($d['zone'] ?? null) ? $d['zone'] : [], 'is_string')));
    $zoneText = count($zonen) ? implode(', ', $zonen) : '(nicht angegeben)';

    $betreff = 'Neue Website-Bewertung';
    $inhalt = "Neue Bewertung zur Veröffentlichung auf haarfrei-trier.de\n"
            . "(Einwilligung zur Veröffentlichung wurde erteilt. Bitte manuell prüfen und freigeben.)\n\n"
            . "Sterne: " . str_repeat('★', $sterne) . str_repeat('☆', 5 - $sterne) . " ($sterne von 5)\n"
            . "Anzeigename: $name\n"
            . "Behandelte Zone: $zoneText\n"
            . "Datum: $datum\n\n"
            . "Text:\n$text\n";
} else {
    $betreff = 'Interner Hinweis aus Bewertung';
    $inhalt = "Interner Verbesserungsvorschlag aus der Bewertungsseite\n"
            . "(Nur für das Studio – NICHT zur Veröffentlichung.)\n\n"
            . "Datum: $datum\n\n"
            . "Text:\n$text\n";
}

$headers = "From: noreply@haarfrei-trier.de\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "Content-Transfer-Encoding: 8bit\r\n";

$ok = mail('info@haarfrei-trier.de', '=?UTF-8?B?' . base64_encode($betreff) . '?=', $inhalt, $headers);

if ($ok) antwort(200, ['ok' => true]);
antwort(500, ['ok' => false, 'fehler' => 'Senden fehlgeschlagen']);
