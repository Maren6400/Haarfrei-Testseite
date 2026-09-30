<?php
// Formuliert aus den Antworten der Bewertungsseite einen Textvorschlag
// über die Anthropic Messages API. Keine Speicherung, keine Inhalts-Logs.
require __DIR__ . '/_schutz.php';

$config = lade_config();
pruefe_anfrage($config);
rate_limit('text', 10, 3600);

$apiKey = $config['anthropic_api_key'] ?? '';
if (!$apiKey || strpos($apiKey, 'HIER-EINTRAGEN') !== false) {
    antwort(503, ['ok' => false, 'fehler' => 'KI nicht konfiguriert']);
}

$d = lies_json();
if (($d['ki_einwilligung'] ?? false) !== true) antwort(400, ['ok' => false, 'fehler' => 'Einwilligung fehlt']);
$a = is_array($d['answers'] ?? null) ? $d['answers'] : [];

// Antworten säubern und kürzen
$erlaubteZonen = ['Achseln', 'Beine', 'Bikinizone', 'Gesicht', 'Arme', 'Rücken', 'Brust', 'Andere'];
$zone = [];
foreach ((is_array($a['zone'] ?? null) ? $a['zone'] : []) as $z) {
    if (in_array($z, $erlaubteZonen, true) && !in_array($z, $zone, true)) $zone[] = $z;
}
$felder = ['vorher', 'beratung', 'behandlung', 'veraenderung', 'wer', 'zoegern', 'besser'];
foreach ($felder as $k) $a[$k] = kuerze($a[$k] ?? '', 1000);
$besserScope = ($a['besserScope'] ?? 'review') === 'intern' ? 'intern' : 'review';

// Prompt – wörtlich aus buildPrompt() des Prototyps
$lines = [];
if (count($zone)) $lines[] = 'Behandelte Zone(n): ' . implode(', ', $zone);
$map = [
    'vorher'       => 'Was vorher gestört hat',
    'beratung'     => 'Beratung',
    'behandlung'   => 'Behandlung (Schmerz, Dauer, Atmosphäre)',
    'veraenderung' => 'Veränderung bisher',
    'wer'          => 'Behandelt von',
    'zoegern'      => 'Rat an Zögernde',
];
foreach ($map as $k => $label) if ($a[$k] !== '') $lines[] = "$label: {$a[$k]}";
if ($a['besser'] !== '' && $besserScope === 'review') $lines[] = "Verbesserungsvorschlag: {$a['besser']}";

if (count($lines) === 0) antwort(400, ['ok' => false, 'fehler' => 'Keine Antworten']);

$system = 'Du formulierst aus den Antworten einer Kundin oder eines Kunden eine Google-Bewertung für Haarfrei-Trier, ein Studio für dauerhafte Haarentfernung per Laser in Trier. Die Person hat 4 Behandlungen hinter sich.

Strenge Regeln:
- Verwende ausschließlich Inhalte aus den Antworten. Erfinde keine Fakten, Details, Zahlen oder Wertungen.
- Übernimm die Tonalität und Wortwahl der Person. Keine Superlative, die die Person nicht selbst benutzt hat.
- Kurze Antworten ergeben eine kurze Bewertung. Höchstens 130 Wörter.
- Ich-Form, natürliches Deutsch, wie ein echter Mensch schreibt. Keine Werbesprache, keine Keywords wie "beste Laser-Haarentfernung in Trier", keine Emojis, keine Hashtags, keine Überschrift, keine Sternangabe.
- Füge keine eigenen Aussagen, Gefühle, Lob, Fazits oder Zusammenfassungen hinzu, die nicht in den Antworten stehen (z. B. kein "ich bin wirklich zufrieden", "es lohnt sich", "sehr professionell", "gehört der Vergangenheit an", "hilft, sich sicherer zu fühlen"). Du darfst Antworten sprachlich glätten und verbinden, aber keinen Inhalt ergänzen.
- Enthält eine Antwort Kritik, bleibt sie sachlich im Text.
- Nenne einen Mitarbeiternamen nur, wenn er in den Antworten steht. Steht er dort, muss er im Text vorkommen, und zwar nur als Tatsache (z. B. "Behandelt hat mich Anna."), ohne ihn zu bewerten, außer die Person hat selbst etwas über die Mitarbeiterin geschrieben.
- Gib nur den Bewertungstext aus, ohne Einleitung oder Anmerkung.';

$userPrompt = "Antworten:\n" . implode("\n", $lines);

function frage_ki($apiKey, $system, array $messages) {
    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 25,
        CURLOPT_HTTPHEADER     => [
            'content-type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'model'      => 'claude-haiku-4-5-20251001',
            'max_tokens' => 400,
            'system'     => $system,
            'messages'   => $messages,
        ], JSON_UNESCAPED_UNICODE),
    ]);
    $roh = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $res = json_decode($roh ?: '', true);
    if ($status !== 200 || !is_array($res)) {
        // Nur Statuscode loggen, niemals Inhalte
        error_log('bewertung-text: Anthropic-Status ' . $status);
        return ['status' => $status];
    }
    $text = '';
    foreach (($res['content'] ?? []) as $block) {
        if (($block['type'] ?? '') === 'text') $text .= $block['text'];
    }
    return ['status' => 200, 'text' => trim($text), 'truncated' => ($res['stop_reason'] ?? '') === 'max_tokens'];
}

$r = frage_ki($apiKey, $system, [['role' => 'user', 'content' => $userPrompt]]);
if ($r['status'] !== 200 || $r['text'] === '') {
    antwort(502, ['ok' => false, 'fehler' => $r['status'] === 429 ? 'rate_limited' : 'ki_fehler']);
}

antwort(200, [
    'ok'        => true,
    'text'      => $r['text'],
    'truncated' => $r['truncated'],
]);
