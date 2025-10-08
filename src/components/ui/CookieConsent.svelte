<!-- src/components/ui/CookieConsent.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  export let forceShow = false; // <- opcjonalny „wytrych” na dev/staging

  const COOKIE_NAME = 'cc_cookie';
  const REVISION = 2; // <- PODBITE, żeby wymusić wyświetlenie

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

  let isVisible = false;
  let showSettings = false;
  let cookiePreferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  };

  function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const eq = cookie.indexOf('=');
      const key = eq > -1 ? cookie.slice(0, eq) : cookie;
      if (key === name) return decodeURIComponent(eq > -1 ? cookie.slice(eq + 1) : '');
    }
    return null;
  }

  function writeCookie(name: string, value: any, days = 180) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const serialized = encodeURIComponent(typeof value === 'string' ? value : JSON.stringify(value));
    let cookie = `${name}=${serialized}; Expires=${expires}; Path=/; SameSite=Lax`;
    if (typeof location !== 'undefined' && location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
  }

  function parseStoredConsent(): StoredConsent | null {
    try {
      const raw = readCookie(COOKIE_NAME);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[CookieConsent] Nieprawidłowy JSON w cookie', e);
      return null;
    }
  }

  function ensureDL(): any[] {
    if (typeof window === 'undefined') return [];
    const w = window as any;
    if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
    return w.dataLayer;
  }
  function gtagSafe(...args: any[]) {
    if (typeof window === 'undefined') return;
    const dl = ensureDL();
    const gtag = (window as any).gtag ?? ((...a: any[]) => dl.push(a));
    gtag(...args);
  }
  function pushDL(obj: Record<string, any>) {
    if (typeof window === 'undefined') return;
    ensureDL().push(obj);
  }
  function updateConsentMode(a: boolean, m: boolean, f = false) {
    gtagSafe('consent', 'update', {
      analytics_storage: a ? 'granted' : 'denied',
      ad_storage: m ? 'granted' : 'denied',
      ad_user_data: m ? 'granted' : 'denied',
      ad_personalization: m ? 'granted' : 'denied',
      functionality_storage: f ? 'granted' : 'denied',
      personalization_storage: f ? 'granted' : 'denied'
    });
    pushDL({
      event: 'consent_update',
      analytics_storage: a ? 'granted' : 'denied',
      ad_storage: m ? 'granted' : 'denied',
      ad_user_data: m ? 'granted' : 'denied',
      ad_personalization: m ? 'granted' : 'denied'
    });
  }
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

  function acceptAll() {
    cookiePreferences = { necessary: true, analytics: true, marketing: true, functional: true };
    savePreferences();
    updateConsentMode(true, true, true);
    pushDL({ event: 'consent_initial_selection' });
    isVisible = false;
  }
  function acceptNecessary() {
    cookiePreferences = { necessary: true, analytics: false, marketing: false, functional: false };
    savePreferences();
    updateConsentMode(false, false, false);
    pushDL({ event: 'consent_initial_selection' });
    isVisible = false;
  }
  function saveCustom() {
    savePreferences();
    updateConsentMode(cookiePreferences.analytics, cookiePreferences.marketing, cookiePreferences.functional);
    pushDL({ event: 'consent_initial_selection' });
    isVisible = false;
    showSettings = false;
  }
  function toggleSettings() { showSettings = !showSettings; }

  // public
  export function showBanner() { isVisible = true; showSettings = false; }

  onMount(() => {
    if (typeof window !== 'undefined' && (window as any).__cookie_banner_init) {
      // zabezpieczenie przed dublem (HMR/duplikat w layoucie)
      console.debug('[CookieConsent] Już zainicjalizowany — pomijam drugi mount');
      return;
    }
    if (typeof window !== 'undefined') (window as any).__cookie_banner_init = true;

    if (typeof window !== 'undefined') (window as any).showCookieBanner = showBanner;

    const existing = parseStoredConsent();
    console.debug('[CookieConsent] existing cookie =', existing, 'forceShow=', forceShow);

    if (forceShow) {
      isVisible = true;
      return;
    }

    if (!existing || existing.rev !== REVISION) {
      setTimeout(() => { isVisible = true; console.debug('[CookieConsent] Pokazuję banner'); }, 400);
    } else {
      const cats = existing.categories || [];
      cookiePreferences = {
        necessary: true,
        analytics: cats.includes('analytics'),
        marketing: cats.includes('marketing'),
        functional: cats.includes('functional')
      };
      updateConsentMode(cookiePreferences.analytics, cookiePreferences.marketing, cookiePreferences.functional);
      isVisible = false;
      console.debug('[CookieConsent] Istniejące preferencje — banner ukryty');
    }
  });

  const switchBase = 'flex-shrink-0 w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300';
  const knob = 'w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300';
  const switchClass = (on: boolean) => `${switchBase} ${on ? 'bg-brand-blue justify-end' : 'bg-slate-300 justify-start'}`;
</script>

{#if isVisible}
  <div class="fixed inset-0 z-[10000] pointer-events-none">
    <div class="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 lg:max-w-md lg:left-6 lg:right-auto pointer-events-auto">
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-slide-up">
        <div class="p-6 border-b border-slate-200/80">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 rounded-xl flex items-center justify-center">
              <span class="text-2xl" role="img" aria-label="Cookie">🍪</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-text-primary mb-2">Ustawienia prywatności</h3>
              <p class="text-sm text-text-muted leading-relaxed">
                Używamy ciasteczek aby zapewnić najlepsze doświadczenie. Część z nich jest niezbędna do działania serwisu.
              </p>
            </div>
          </div>
        </div>

        {#if showSettings}
          <div class="p-6 bg-slate-50 border-b border-slate-200/80">
            <h4 class="text-base font-semibold text-text-primary mb-4">Zarządzaj zgodami</h4>
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">Niezbędne</div>
                  <div class="text-xs text-text-muted leading-relaxed">Wymagane do podstawowego działania strony</div>
                </div>
                <div class="flex-shrink-0 w-12 h-7 bg-brand-blue rounded-full flex items-center justify-end px-1" role="switch" aria-checked="true" aria-disabled="true" aria-label="Ciasteczka niezbędne - zawsze włączone">
                  <div class="w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>

              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">Analityczne</div>
                  <div class="text-xs text-text-muted leading-relaxed">Pomagają zrozumieć, jak korzystasz ze strony</div>
                </div>
                <button type="button" class={switchClass(cookiePreferences.analytics)} on:click={() => (cookiePreferences.analytics = !cookiePreferences.analytics)} role="switch" aria-checked={cookiePreferences.analytics} aria-label="Przełącz ciasteczka analityczne">
                  <div class={knob}></div>
                </button>
              </div>

              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">Marketingowe</div>
                  <div class="text-xs text-text-muted leading-relaxed">Personalizacja reklam i komunikacji</div>
                </div>
                <button type="button" class={switchClass(cookiePreferences.marketing)} on:click={() => (cookiePreferences.marketing = !cookiePreferences.marketing)} role="switch" aria-checked={cookiePreferences.marketing} aria-label="Przełącz ciasteczka marketingowe">
                  <div class={knob}></div>
                </button>
              </div>

              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="font-semibold text-text-primary text-sm mb-1">Funkcjonalne</div>
                  <div class="text-xs text-text-muted leading-relaxed">Zapamiętywanie Twoich preferencji</div>
                </div>
                <button type="button" class={switchClass(cookiePreferences.functional)} on:click={() => (cookiePreferences.functional = !cookiePreferences.functional)} role="switch" aria-checked={cookiePreferences.functional} aria-label="Przełącz ciasteczka funkcjonalne">
                  <div class={knob}></div>
                </button>
              </div>
            </div>
          </div>
        {/if}

        <div class="p-6">
          {#if !showSettings}
            <div class="flex flex-col sm:flex-row gap-3 mb-4">
              <button type="button" on:click={acceptAll} class="btn-primary w-full sm:flex-1">Akceptuj wszystkie</button>
              <button type="button" on:click={acceptNecessary} class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold bg-white text-text-primary border-2 border-slate-200 transition-all duration-300 hover:border-brand-blue hover:bg-slate-50 active:scale-95 w-full sm:flex-1">Tylko niezbędne</button>
            </div>
            <div class="flex items-center justify-between text-sm">
              <button type="button" on:click={toggleSettings} class="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors flex items-center gap-1">
                ⚙️ Dostosuj
              </button>
              <a href="/dokumenty/polityka-prywatnosci" class="text-text-muted hover:text-brand-blue transition-colors">Polityka prywatności</a>
            </div>
          {:else}
            <div class="flex flex-col sm:flex-row gap-3">
              <button type="button" on:click={saveCustom} class="btn-primary w-full sm:flex-1">Zapisz ustawienia</button>
              <button type="button" on:click={toggleSettings} class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold bg-white text-text-primary border-2 border-slate-200 transition-all duration-300 hover:border-brand-blue hover:bg-slate-50 active:scale-95 w-full sm:flex-1">Wróć</button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up { from { opacity: 0; transform: translateY(2rem);} to { opacity: 1; transform: translateY(0);} }
  .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.4,0,0.2,1); }
</style>