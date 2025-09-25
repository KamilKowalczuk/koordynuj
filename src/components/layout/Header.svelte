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
  function toggleMenu() { isOpen = !isOpen; }
  function closeMenu() { isOpen = false; }

  // ✅ Klik logo: zawsze do "/" i odśwież stronę, jeśli już jesteśmy na "/"
  function handleLogoClick(event: MouseEvent) {
    event.preventDefault();
    isOpen = false; // zamknij mobilne menu
    if (window.location.pathname === '/') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<header 
  class="fixed top-0 left-0 w-full z-40 transition-all duration-300 ease-out"
  class:bg-background-light={isScrolled}
  class:shadow-md={isScrolled}
  class:py-4={isScrolled}
  class:py-6={!isScrolled}
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
    <!-- 🔧 ZMIANA TYLKO TUTAJ -->
    <div class="flex-shrink-0">
      <a href="/" aria-label="Przejdź na stronę główną" on:click={handleLogoClick} class="inline-flex items-center">
        <slot name="logo" />
      </a>
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
      <button 
        on:click={toggleMenu} 
        class="text-text-primary focus:outline-none"
        aria-label="Otwórz menu"
      >
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

  {#if isOpen}
    <div class="md:hidden fixed inset-0 top-[88px] bg-background-light z-50 flex flex-col items-center justify-center space-y-8">
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
</header>
