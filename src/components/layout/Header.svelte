<script lang="ts">
  import { onMount } from 'svelte';
  
  let isScrolled = false;
  let isOpen = false;
  
  const navLinks = [
    { href: '/blog', label: 'Blog' },
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
  
  // NOWA FUNKCJA: Inteligentna nawigacja
  function handleNavClick(e: MouseEvent, href: string) {
    const target = e.currentTarget as HTMLAnchorElement;
    
    // Jeśli to anchor link (zaczyna się od #)
    if (href.startsWith('#')) {
      const currentPath = window.location.pathname;
      
      if (currentPath === '/') {
        // Jesteśmy na homepage - smooth scroll
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Update URL without navigation
          window.history.replaceState(null, '', href);
        }
        
        closeMenu();
      } else {
        // Jesteśmy na innej stronie (np. /blog) - nawiguj do homepage z hashem
        e.preventDefault();
        window.location.href = `/${href}`;
      }
    } else {
      // Normalny link (jak /blog) - pozwól na standardową nawigację
      // Ale zamknij menu
      closeMenu();
    }
  }
  
  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = '';
    };
  });
  
  // Reaktywna blokada scrollowania przy otwartym menu
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
        <a 
          href={link.href} 
          class="font-medium text-text-muted hover:text-brand-blue transition-colors"
          on:click={(e) => handleNavClick(e, link.href)}
        >
          {link.label}
        </a>
      {/each}
      <a 
        href="#kontakt" 
        class="btn-primary !px-6 !py-2 !text-base"
        on:click={(e) => handleNavClick(e, '#kontakt')}
      >
        Kontakt
      </a>
    </nav>

    <div class="md:hidden">
      <button 
        on:click={toggleMenu} 
        class="text-text-primary focus:outline-none p-2 -mr-2" 
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
</header>

{#if isOpen}
  <div 
    class="md:hidden fixed inset-0 bg-background-light z-30 flex flex-col items-center justify-center space-y-8 pt-[var(--header-h-mobile,80px)]"
    role="dialog"
    aria-modal="true"
  >
    {#each navLinks as link}
      <a 
        href={link.href} 
        class="text-3xl font-bold text-text-primary hover:text-brand-blue transition-colors" 
        on:click={(e) => handleNavClick(e, link.href)}
      >
        {link.label}
      </a>
    {/each}
    <a 
      href="#kontakt" 
      class="btn-primary !text-2xl !px-10 !py-4" 
      on:click={(e) => handleNavClick(e, '#kontakt')}
    >
      Kontakt
    </a>
  </div>
{/if}