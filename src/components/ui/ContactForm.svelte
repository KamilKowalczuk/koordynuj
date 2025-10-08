<script lang="ts">
    import DOMPurify from 'isomorphic-dompurify';
    

    export let recipientEmail = 'docelowy@email.com'; 
    export let successMessageHTML = 'Dziękujemy za zgłoszenie! Skontaktujemy się z Tobą w ciągu 24h.';

    const MAX = { name: 120, email: 254, phone: 20, message: 2000, hp: 64 };

    let name = '';
    let email = '';
    let phone = '';
    let message = '';
    
    type Status = 'idle' | 'submitting' | 'success' | 'error';
    let status: Status = 'idle';
    let errorMsg: string | null = null;
    let errors: Record<string, string> = {};

    let hp = '';
    const startedAt = Date.now();

    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const clamp = (s: string, n: number) => (s ?? '').slice(0, n);

    function validate() {
        const next: typeof errors = {};
        if (name.trim().length < 2) next.name = 'Podaj imię i nazwisko.';
        if (!isEmail(email.trim())) next.email = 'Proszę podać poprawny adres email.';
        if (phone.trim().length < 9) next.phone = 'Podaj poprawny numer telefonu.';
        if (hp !== '') next.message = 'Błąd weryfikacji anty-spam.';
        
        errors = next;
        return Object.keys(next).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;

        status = 'submitting';
        errorMsg = null;

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: clamp(name.trim(), MAX.name),
                    email: clamp(email.trim().toLowerCase(), MAX.email),
                    phone: clamp(phone.trim(), MAX.phone),
                    message: clamp(message.trim(), MAX.message),
                    recipient: recipientEmail,
                    t: Date.now() - startedAt,
                    hp,
                }),
            });

            if (res.ok) {
                status = 'success';
                return;
            }
            
            const data = await res.json();
            throw new Error(data.message || 'Nie udało się wysłać wiadomości.');
        } catch (err) {
            errorMsg = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.';
            status = 'error';
        }
    }
</script>

{#if status === 'success'}
    <div class="bg-green-50 p-8 rounded-3xl text-center ring-1 ring-green-200" aria-live="polite">
        <h3 class="text-2xl font-bold text-green-800">Dziękujemy!</h3>
        <div class="strapi-content text-text-muted mt-2">
            {@html DOMPurify.sanitize(successMessageHTML)}
        </div>
    </div>
{:else}
    <form class="bg-background-light p-8 md:p-12 rounded-3xl shadow-lg space-y-6" on:submit|preventDefault={handleSubmit} novalidate>
        {#if status === 'error' && errorMsg}
            <div class="bg-red-50 p-4 rounded-xl ring-1 ring-red-200 text-red-700" aria-live="assertive">
                {errorMsg}
            </div>
        {/if}

        <input type="text" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" bind:value={hp} maxlength={MAX.hp}/>

        <div>
            <label for="name" class="sr-only">Imię i Nazwisko</label>
            <input id="name" type="text" placeholder="Imię i Nazwisko" required class="input" bind:value={name} on:input={() => errors.name = ''} aria-invalid={!!errors.name} />
            {#if errors.name}<p class="text-red-600 text-sm mt-1">{errors.name}</p>{/if}
        </div>

        <div>
            <label for="email" class="sr-only">E-mail</label>
            <input id="email" type="email" placeholder="E-mail" required class="input" bind:value={email} on:input={() => errors.email = ''} aria-invalid={!!errors.email} />
            {#if errors.email}<p class="text-red-600 text-sm mt-1">{errors.email}</p>{/if}
        </div>

        <div>
            <label for="phone" class="sr-only">Telefon</label>
            <input id="phone" type="tel" placeholder="Telefon" required class="input" bind:value={phone} on:input={() => errors.phone = ''} aria-invalid={!!errors.phone} />
            {#if errors.phone}<p class="text-red-600 text-sm mt-1">{errors.phone}</p>{/if}
        </div>

        <div>
            <label for="message" class="sr-only">Wiadomość</label>
            <textarea id="message" placeholder="Opisz krótko sytuację swojej placówki (opcjonalnie)" rows="4" class="input resize-none" bind:value={message} on:input={() => errors.message = ''} aria-invalid={!!errors.message}></textarea>
             {#if errors.message}<p class="text-red-600 text-sm mt-1">{errors.message}</p>{/if}
        </div>

        <button type="submit" disabled={status === 'submitting'} class="btn-primary w-full text-xl py-5 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="relative z-10 flex items-center justify-center">
                {#if status === 'submitting'}
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Wysyłanie...
                {:else}
                    Zacznijmy współpracę
                    <svg class="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                {/if}
            </span>
        </button>

        <div class="text-center pt-4">
             <div class="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-text-muted">
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Odpowiedź w 24h</span>
                </div>
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Bezpłatna konsultacja</span>
                </div>
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <span>100% poufność</span>
                </div>
            </div>
        </div>
    </form>
{/if}

