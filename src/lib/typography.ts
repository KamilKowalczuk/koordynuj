// src/lib/typography.ts

/**
 * Funkcja, która zapobiega pozostawianiu jednoliterowych "sierot" na końcu linii.
 * Znajduje jednoliterowe słowa (i, w, z, o, u, a) i zamienia następującą po nich spację
 * na twardą spację (&nbsp;), aby "przykleić" je do następnego wyrazu.
 * @param text Tekst do przetworzenia.
 * @returns Tekst z poprawioną typografią.
 */
export function fixOrphans(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  // Używamy wyrażenia regularnego, aby znaleźć wszystkie wystąpienia
  // jednoliterowych słów otoczonych spacjami.
  return text.replace(/(\s)(i|w|z|o|u|a)(\s)/gi, '$1$2&nbsp;');
}