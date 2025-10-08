// src/pages/api/smart-webhook.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// --- Konfiguracja ---
// Pobieramy zmienne środowiskowe. Pamiętaj o ich dodaniu w Netlify!
const NETLIFY_BUILD_HOOK = import.meta.env.NETLIFY_BUILD_HOOK_URL;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || 'kontakt@koordynuj-zdrowie.pl'; // Ustaw swój email
const WEBHOOK_SECRET = import.meta.env.STRAPI_WEBHOOK_SECRET; // Opcjonalny sekret dla bezpieczeństwa

/**
 * Lista modeli danych (API ID ze Strapi), których zmiana
 * POWINNA wywołać przebudowę strony.
 */
const REBUILD_TRIGGERS = [
  // Single Types (Ustawienia i kluczowe sekcje)
  'global-setting', // Zmieniono z 'global-settings' na poprawny slug
  'hero-section',
  'case-study',
  'contact-form', // Zmiana w treści strony kontaktowej, nie w wysłanych wiadomościach

  // Collection Types (Treści dynamiczne)
  'problem',
  'service',
  'process-step',
  'blog-post',
  'blog-category',
  'legal-document',
];

/**
 * Lista modeli danych, których zmiana (np. utworzenie nowego wpisu)
 * NIE POWINNA wywoływać przebudowy strony.
 */
const NO_REBUILD_TYPES = [
  'contact', // API ID dla wiadomości z formularza kontaktowego
];

// Interfejs dla danych przychodzących ze Strapi
interface StrapiWebhookPayload {
  event: string;
  createdAt: string;
  model: string;
  entry: {
    id: number;
    [key: string]: any;
  };
}

// Funkcja pomocnicza do pobierania IP klienta
function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// Funkcja wywołująca przebudowę w Netlify
async function triggerNetlifyBuild(): Promise<boolean> {
  if (!NETLIFY_BUILD_HOOK) {
    console.error('[SMART WEBHOOK] Błąd: Brak skonfigurowanej zmiennej NETLIFY_BUILD_HOOK_URL');
    return false;
  }

  try {
    const response = await fetch(NETLIFY_BUILD_HOOK, { method: 'POST' });
    if (response.ok) {
      console.log('[SMART WEBHOOK] ✅ Pomyślnie uruchomiono przebudowę w Netlify.');
      return true;
    } else {
      console.error(`[SMART WEBHOOK] ❌ Nie udało się uruchomić przebudowy w Netlify: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('[SMART WEBHOOK] ❌ Krytyczny błąd podczas próby uruchomienia przebudowy:', error);
    return false;
  }
}

// Główna funkcja obsługująca żądanie POST od Strapi
export const POST: APIRoute = async ({ request }) => {
  try {
    // Sprawdzenie bezpieczeństwa: walidacja sekretu
    if (WEBHOOK_SECRET) {
      const receivedSecret = request.headers.get('x-strapi-signature');
      if (receivedSecret !== WEBHOOK_SECRET) {
        console.warn(`[SMART WEBHOOK] ❌ Nieprawidłowy sekret webhooka. IP: ${getClientIP(request)}`);
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const payload: StrapiWebhookPayload = await request.json();
    const { model } = payload;

    console.log(`[SMART WEBHOOK] Otrzymano żądanie dla modelu: "${model}"`);

    // --- LOGIKA DECYZYJNA ---

    // 1. Model na liście ignorowanych?
    if (NO_REBUILD_TYPES.includes(model)) {
      console.log(`[SMART WEBHOOK] 📬 Otrzymano wiadomość kontaktową. Przebudowa pominięta.`);
      // Tutaj w przyszłości można dodać logikę wysyłania powiadomień email
      return new Response(JSON.stringify({ status: 'processed', rebuild: false, message: 'Wiadomość kontaktowa przetworzona, przebudowa nie jest wymagana.' }), { status: 200 });
    }

    // 2. Model na liście do przebudowy?
    if (REBUILD_TRIGGERS.includes(model)) {
      console.log(`[SMART WEBHOOK] 🚀 Wykryto zmianę w "${model}". Uruchamiam przebudowę...`);
      const rebuildSuccess = await triggerNetlifyBuild();
      return new Response(JSON.stringify({ status: 'processed', rebuild: true, success: rebuildSuccess }), { status: rebuildSuccess ? 200 : 500 });
    }

    // 3. Nieznany model - dla bezpieczeństwa uruchamiamy przebudowę
    console.warn(`[SMART WEBHOOK] ⚠️ Wykryto zmianę w nieznanym modelu: "${model}". Uruchamiam przebudowę profilaktycznie.`);
    const rebuildSuccess = await triggerNetlifyBuild();
    return new Response(JSON.stringify({ status: 'processed', rebuild: true, success: rebuildSuccess, warning: `Nieznany model: ${model}` }), { status: 200 });

  } catch (error) {
    console.error('[SMART WEBHOOK] ❌ Błąd krytyczny podczas przetwarzania webhooka:', error);
    return new Response(JSON.stringify({ status: 'error', message: 'Błąd serwera wewnętrznego.' }), { status: 500 });
  }
};

// Funkcja do weryfikacji, czy endpoint działa (health check)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    service: 'Koordynuj - Smart Webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};