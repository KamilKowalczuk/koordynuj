<!-- src/components/ui/CookieConsent.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  // === KONFIGURACJA ===
  const COOKIE_NAME = 'cc_cookie';
  const REVISION = 1; // Zwiększ aby wymusić ponowne pokazanie bannera

  // === TYPY ===
  type ConsentPreferences = {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };

  type StoredConsent = {
    stamp: string;
    necessary: boolean;
    categories: string[];
    rev: number;
  };

  // === STAN KOMPONENTU (bez $state) ===
  let isVisible = false;
  let showSettings = false;
  let cookiePreferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  };

  // === ZARZĄDZANIE COOKIES (SSR-safe) ===
  function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [key, ...valueParts] = cookie.split('=');
      if (key === name) {
        return decodeURIComponent(valueParts.join('='));
      }
    }
    return null;
  }

  function writeCookie(name: string, value: any, days = 180) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const serialized = encodeURIComponent(
      typeof value === 'string' ? value : JSON.stringify(value)
    );
    let cookie = `${name}=${serialized}; Expires=${expires}; Path=/; SameSite=Lax`;
    if (typeof location !== 'undefined' && location.protocol === 'https:') {
      cookie += '; Secure';
    }
    document.cookie = cookie;
  }

  function parseStoredConsent(): StoredConsent | null {
    try {
      const raw = readCookie(COOKIE_NAME);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // === GTM / GOOGLE CONSENT MODE V2 ===
  function ensureDataLayer(): any[] {
    if (typeof window === 'undefined') return [];
    const w = window as any;
    if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
    return w.dataLayer;
  }

  function gtagSafe(...args: any[]) {
    if (typeof window === 'undefined') return;
    const dl = ensureDataLayer();
    const gtag = (window as any).gtag ?? ((...a: any[]) => dl.push(a));
    gtag(...args);
  }

  function pushToDataLayer(obj: Record<string, any>) {
    if (typeof window === 'undefined') return;
    const dl = ensureDataLayer();
    dl.push(obj);
  }

  function updateConsentMode(analytics: boolean, marketing: boolean, functional = false) {
    // Google Consent Mode v2
    gtagSafe('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      functionality_storage: functional ? 'granted' : 'denied',
      personalization_storage: functional ? 'granted' : 'denied'
    });

    // Event do GTM
    pushToDataLayer({
      event: 'consent_update',
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied'
    });
  }

  function pushInitialSelection() {
    pushToDataLayer({ event: 'consent_initial_selection' });
  }

  // === ZAPISZ PREFERENCJE ===
  function savePreferences() {
    const categories = [
      ...(cookiePreferences.analytics ? ['analytics'] : []),
      ...(cookiePreferences.marketing ? ['marketing'] : []),
      ...(cookiePreferences.functional ? ['functional'] : [])
    ];

    const consent: StoredConsent = {
      stamp: new Date().toISOString(),
      necessary: true,
      categories,
      rev: REVISION
    };

    writeCookie(COOKIE_NAME, consent);
  }

  // === AKCJE UŻYTKOWNIKA ===
  function acceptAll() {
    cookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    savePreferences();
    updateConsentMode(true, true, true);
    pushInitialSelection();
    isVisible = false;
  }

  function acceptNecessary() {
    cookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    savePreferences();
    updateConsentMode(false, false, false);
    pushInitialSelection();
    isVisible = false;
  }

  function saveCustom() {
    savePreferences();
    updateConsentMode(
      cookiePreferences.analytics,
      cookiePreferences.marketing,
      cookiePreferences.functional
    );
    pushInitialSelection();
    isVisible = false;
    showSettings = false;
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }

  // === LIFECYCLE (pojedynczy onMount; bez duplikatów) ===
  onMount(() => {
    const existing = parseStoredConsent();

    if (!existing || existing.rev !== REVISION) {
      // Nowy użytkownik lub nowa wersja – pokaż banner z lekkim delayem
      setTimeout(() => {
        isVisible = true;
      }, 600);
    } else {
      // Wczytaj zapisane preferencje
      const cats = existing.categories || [];
      cookiePreferences = {
        necessary: true,
        analytics: cats.includes('analytics'),
        marketing: cats.includes('marketing'),
        functional: cats.includes('functional')
      };

      // Synchronizuj z GTM
      updateConsentMode(
        cookiePreferences.analytics,
        cookiePreferences.marketing,
        cookiePreferences.functional
      );

      isVisible = false;
    }

    // Udostępnij publiczną funkcję do ponownego otwarcia banneru
    if (typeof window !== 'undefined') {
      (window as any).showCookieBanner = showBanner;
    }
  });

  // === FUNKCJA PUBLICZNA ===
  export function showBanner() {
    isVisible = true;
    showSettings = false;
  }

  // === Pomocnicze klasy przełączników (żeby nie interpolować w atrybucie class) ===
  const switchBase = 'flex-shrink-0 w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300';
  const knob = 'w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300';
  const switchClass = (on: boolean) => `${switchBase} ${on ? 'bg-brand-blue justify-end' : 'bg-slate-300 justify-start'}`;
</script>

{#if isVisible}
  <!-- Overlay -->
  <div 
    class="fixed inset-0 z-[9998] bg-text-primary/10 backdrop-blur-sm transition-opacity duration-300"
    role="presentation"
  ></div>

  <!-- Cookie Banner -->
  <div class="fixed inset-0 z-[9999] pointer-events-none cookie-consent-component">
    <div class="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 lg:max-w-md lg:left-6 lg:right-auto pointer-events-auto">
      <div 
        class="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-slide-up"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
      >
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200/80">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 rounded-xl flex items-center justify-center">
              <span class="text-2xl" role="img" aria-label="Cookie">🍪</span>
            </div>
            <div class="flex-1">
              <h3 id="cookie-title" class="text-lg font-bold text-text-primary mb-2">
                Ustawienia prywatności
              </h3>
              <p id="cookie-description" class="text-sm text-text-muted leading-relaxed">
                Używamy ciasteczek aby zapewnić najlepsze doświadczenie. Część z nich jest niezbędna do działania serwisu.
              </p>
            </div>
          </div>
        </div>

        <!-- Settings Panel (rozwijany) -->
        {#if showSettings}
          <div class="p-6 bg-slate-50 border-b border-slate-200/80">
            <h4 class="text-base font-semibold text-text-primary mb-4">
              Zarządzaj zgodami
            </h4>

            <div class="space-y-4">
              <!-- Necessary (always on) -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">
                    Niezbędne
                  </div>
                  <div class="text-xs text-text-muted leading-relaxed">
                    Wymagane do podstawowego działania strony
                  </div>
                </div>
                <div 
                  class="flex-shrink-0 w-12 h-7 bg-brand-blue rounded-full flex items-center justify-end px-1"
                  role="switch"
                  aria-checked="true"
                  aria-disabled="true"
                  aria-label="Ciasteczka niezbędne - zawsze włączone"
                >
                  <div class="w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>

              <!-- Analytics -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">
                    Analityczne
                  </div>
                  <div class="text-xs text-text-muted leading-relaxed">
                    Pomagają zrozumieć, jak korzystasz ze strony
                  </div>
                </div>
                <button
                  type="button"
                  class={switchClass(cookiePreferences.analytics)}
                  on:click={() => (cookiePreferences.analytics = !cookiePreferences.analytics)}
                  role="switch"
                  aria-checked={cookiePreferences.analytics}
                  aria-label="Przełącz ciasteczka analityczne"
                >
                  <div class={knob}></div>
                </button>
              </div>

              <!-- Marketing -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">
                    Marketingowe
                  </div>
                  <div class="text-xs text-text-muted leading-relaxed">
                    Personalizacja reklam i komunikacji
                  </div>
                </div>
                <button
                  type="button"
                  class={switchClass(cookiePreferences.marketing)}
                  on:click={() => (cookiePreferences.marketing = !cookiePreferences.marketing)}
                  role="switch"
                  aria-checked={cookiePreferences.marketing}
                  aria-label="Przełącz ciasteczka marketingowe"
                >
                  <div class={knob}></div>
                </button>
              </div>

              <!-- Functional -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">
                    Funkcjonalne
                  </div>
                  <div class="text-xs text-text-muted leading-relaxed">
                    Zapamiętywanie Twoich preferencji
                  </div>
                </div>
                <button
                  type="button"
                  class={switchClass(cookiePreferences.functional)}
                  on:click={() => (cookiePreferences.functional = !cookiePreferences.functional)}
                  role="switch"
                  aria-checked={cookiePreferences.functional}
                  aria-label="Przełącz ciasteczka funkcjonalne"
                >
                  <div class={knob}></div>
                </button>
              </div>
            </div>
          </div>
        {/if}

        <!-- Actions -->
        <div class="p-6">
          {#if !showSettings}
            <!-- Main Actions -->
            <div class="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                type="button"
                on:click={acceptAll}
                class="btn-primary w-full sm:flex-1"
              >
                Akceptuj wszystkie
              </button>

              <button
                type="button"
                on:click={acceptNecessary}
                class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold bg-white text-text-primary border-2 border-slate-200 transition-all duration-300 hover:border-brand-blue hover:bg-slate-50 active:scale-95 w-full sm:flex-1"
              >
                Tylko niezbędne
              </button>
            </div>

            <!-- Footer Links -->
            <div class="flex items-center justify-between text-sm">
              <button
                type="button"
                on:click={toggleSettings}
                class="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dostosuj
              </button>

              <a 
                href="/dokumenty/polityka-prywatnosci"
                class="text-text-muted hover:text-brand-blue transition-colors"
              >
                Polityka prywatności
              </a>
            </div>
          {:else}
            <!-- Settings Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                on:click={saveCustom}
                class="btn-primary w-full sm:flex-1"
              >
                Zapisz ustawienia
              </button>

              <button
                type="button"
                on:click={toggleSettings}
                class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold bg-white text-text-primary border-2 border-slate-200 transition-all duration-300 hover:border-brand-blue hover:bg-slate-50 active:scale-95 w-full sm:flex-1"
              >
                Wróć
              </button>
            </div>
          {/if}
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  /* Animation */
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Ensure Inter font */
  :global(.cookie-consent-component *) {
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
  }
</style>
