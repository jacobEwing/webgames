#!/usr/bin/env php
<?php
/**
 * convert-words.php
 *
 * Reads a text file of 5-letter words (one per line) and writes a JS file
 * containing a fixed-length string of lowercase words, plus a small loader.
 *
 * Usage:
 *     php convert-words.php [input] [output] [PREFIX]
 *
 * Defaults:
 *     input  = words.txt
 *     output = words.js
 *     prefix = WORD
 *
 * Examples:
 *     php convert-words.php words.txt  words.js  WORD
 *     php convert-words.php common.txt common.js COMMON
 */

declare(strict_types=1);

$inputPath  = $argv[1] ?? 'words.txt';
$outputPath = $argv[2] ?? 'words.js';
$prefix     = $argv[3] ?? 'WORD';

if (!preg_match('/^[A-Z][A-Z0-9_]*$/', $prefix)) {
    fwrite(STDERR, "Error: prefix must match /^[A-Z][A-Z0-9_]*$/\n");
    exit(1);
}

if (!is_readable($inputPath)) {
    fwrite(STDERR, "Error: cannot read input file: {$inputPath}\n");
    exit(1);
}

$raw = file_get_contents($inputPath);
if ($raw === false) {
    fwrite(STDERR, "Error: failed to read input file: {$inputPath}\n");
    exit(1);
}

$lines = preg_split('/\r\n|\r|\n/', $raw);

$words = [];
$seen  = [];

foreach ($lines as $line) {
    $word = strtolower(trim($line));
    if ($word === '') continue;

    if (!preg_match('/^[a-z]{5}$/', $word)) {
        fwrite(STDERR, "Warning: skipping non-5-letter line: '{$line}'\n");
        continue;
    }
    if (isset($seen[$word])) {
        fwrite(STDERR, "Warning: skipping duplicate word: '{$word}'\n");
        continue;
    }
    $seen[$word] = true;
    $words[] = $word;
}

if (count($words) === 0) {
    fwrite(STDERR, "Error: no valid 5-letter words found in {$inputPath}\n");
    exit(1);
}

sort($words, SORT_STRING);

$blob = implode('', $words);

$js  = "// Generated from " . basename($inputPath) . " — do not edit by hand.\n";
$js .= "// Words: " . count($words) . "\n";
$js .= "const {$prefix}_BLOB = " . json_encode($blob, JSON_UNESCAPED_SLASHES) . ";\n";
$js .= "\n";
$js .= "const {$prefix}_WORDS = [];\n";
$js .= "for (let i = 0; i < {$prefix}_BLOB.length; i += 5) {\n";
$js .= "  {$prefix}_WORDS.push({$prefix}_BLOB.slice(i, i + 5));\n";
$js .= "}\n";
$js .= "\n";
$js .= "const {$prefix}_SET = new Set({$prefix}_WORDS);\n";

if (file_put_contents($outputPath, $js) === false) {
    fwrite(STDERR, "Error: failed to write output file: {$outputPath}\n");
    exit(1);
}

fwrite(STDOUT, sprintf(
    "Wrote %d words to %s (prefix %s, %d bytes in, %d bytes out).\n",
    count($words), $outputPath, $prefix, filesize($inputPath), filesize($outputPath)
));
