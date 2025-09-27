<script lang="ts">
    import { onMount } from 'svelte';

    let isScrolled = false;
    let isOpen = false;

    const navLinks = [
        { href: '#problemy', label: 'Diagnoza' },
        { href: '#oferta', label: 'Oferta' },
        { href: '#dowod', label: 'Rezultaty' },
        { href: '#proces', label: 'Proces' },
    ];

    function handleScroll() {
        isScrolled = window.scrollY > 50;
    }

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function closeMenu() {
        isOpen = false;
    }

    onMount(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Czysta funkcja do czyszczenia po odmontowaniu komponentu
        return () => {
            window.removeEventListener('scroll', handleScroll);
            // Upewniamy się, że scroll jest odblokowany, jeśli komponent zniknie
            document.body.style.overflow = '';
        };
    });

    // Reaktywna instrukcja, która blokuje przewijanie body, gdy menu jest otwarte
    $: if (typeof document !== 'undefined') {
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
</script>

<header 
    class="fixed top-0 left-0 w-full z-40
           transform-gpu
           bg-background-light
           transition-[padding-top,padding-bottom,box-shadow] 
           duration-300 ease-out"
    class:shadow-md={isScrolled}
    class:py-4={isScrolled}
    class:py-6={!isScrolled}
    data-scrolled={isScrolled}
>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[var(--header-h-mobile,80px)] md:h-auto">
        <div class="flex-shrink-0">
            <slot name="logo" />
        </div>

        <nav class="hidden md:flex items-center space-x-8">
            {#each navLinks as link}
                <a href={link.href} class="font-medium text-text-muted hover:text-brand-blue transition-colors">
                    {link.label}
                </a>
            {/each}
            <a href="#kontakt" class="btn-primary !px-6 !py-2 !text-base">
                Kontakt
            </a>
        </nav>

        <div class="md:hidden">
            <button on:click={toggleMenu} class="text-text-primary focus:outline-none p-2 -mr-2" aria-label="Otwórz menu">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {#if !isOpen}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                    {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    {/if}
                </svg>
            </button>
        </div>
    </div>
</header>

{#if isOpen}
    <div 
        class="md:hidden fixed inset-0 bg-background-light z-30 flex flex-col items-center justify-center space-y-8 pt-[var(--header-h-mobile,80px)]"
        role="dialog"
        aria-modal="true"
    >
        {#each navLinks as link}
            <a href={link.href} class="text-3xl font-bold text-text-primary hover:text-brand-blue transition-colors" on:click={closeMenu}>
                {link.label}
            </a>
        {/each}
        <a href="#kontakt" class="btn-primary !text-2xl !px-10 !py-4" on:click={closeMenu}>
            Kontakt
        </a>
    </div>
{/if}