<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { activeService } from '../../lib/serviceStore';
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import type { Service } from '../../lib/strapi';

    let panelElement: HTMLElement;
    let closeButtonElement: HTMLElement;
    let lastFocusedElement: HTMLElement | null = null;

    function closePanel() {
        $activeService = null;
        // Restore focus to the element that opened the modal
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closePanel();
        }
        
        // Focus trap - keep focus within modal
        if (event.key === 'Tab') {
            trapFocus(event);
        }
    }

    function trapFocus(event: KeyboardEvent) {
        if (!panelElement) return;

        const focusableElements = panelElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
            // Shift + Tab (backwards)
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab (forwards)
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    onMount(() => {
        // Ensure we're in browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        // Store the currently focused element before opening modal
        lastFocusedElement = document.activeElement as HTMLElement;
        
        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeydown);
        
        // Focus management
        async function setFocus() {
            await tick(); // Wait for DOM rendering
            if (closeButtonElement) {
                closeButtonElement.focus();
            }
        }
        setFocus();
    });

    onDestroy(() => {
        // Ensure we're in browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }
        
        document.removeEventListener('keydown', handleKeydown);
    });

    // Reactive statement to manage body scroll based on modal state
    $: if (typeof document !== 'undefined') {
        if ($activeService) {
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            // Restore background scrolling when modal is closed
            document.body.style.overflow = '';
        }
    }
</script>

{#if $activeService}
    <!-- Modal Backdrop -->
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
    >
        <!-- Modal Dialog -->
        <div
            bind:this={panelElement}
            transition:fly={{ y: 20, duration: 400, easing: cubicOut }}
            class="relative w-full max-w-6xl max-h-[90vh] bg-background-light rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            aria-describedby="panel-description"
            tabindex="0"
        >
            <!-- Header -->
            <header class="bg-white/50 px-6 sm:px-8 py-5 border-b border-slate-200/80 flex-shrink-0">
                <div class="flex justify-between items-start gap-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" aria-hidden="true">
                            <span class="text-brand-blue font-bold text-xl">0{$activeService.id}</span>
                        </div>
                        <div>
                            <h1 id="panel-title" class="text-xl sm:text-2xl font-bold text-text-primary">{@html $activeService.title}</h1>
                            <div id="panel-description" class="text-text-muted text-sm sm:text-base mt-1 prose-p-reset">{@html $activeService.shortDescription}</div>
                        </div>
                    </div>
                    <button 
                        bind:this={closeButtonElement}
                        on:click={closePanel} 
                        class="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-slate-200/60 rounded-full transition-all duration-200 ml-4 flex-shrink-0"
                        aria-label="Zamknij panel szczegółów usługi {$activeService.title}"
                        type="button"
                    >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </header>
    
            <!-- Content -->
            <div class="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3" role="main">
                <!-- Left Column -->
                <div class="lg:col-span-2 p-6 sm:p-8 space-y-10">
                    {#if $activeService.whyWorthIt}
                        <section aria-labelledby="why-worth-it">
                            <h2 id="why-worth-it" class="section-heading">Dlaczego warto?</h2>
                            <div class="prose-custom">{@html $activeService.whyWorthIt}</div>
                        </section>
                    {/if}
                    
                    {#if $activeService.scope}
                        <section aria-labelledby="scope">
                            <h2 id="scope" class="section-heading">Zakres naszej oferty</h2>
                            <div class="prose-custom">{@html $activeService.scope}</div>
                        </section>
                    {/if}
                </div>
                
                <!-- Right Column -->
                <aside class="lg:col-span-1 bg-background-muted/70 p-6 sm:p-8 space-y-8 border-l border-slate-200/80">
                    {#if $activeService.benefitsFacility || $activeService.benefitsPatients}
                        <section aria-labelledby="benefits">
                            <h2 id="benefits" class="section-heading">Korzyści</h2>
                            <div class="space-y-6">
                                {#if $activeService.benefitsFacility}
                                    <div class="prose-custom">
                                        <h3 class="benefits-subheading">Dla placówki</h3>
                                        <div>{@html $activeService.benefitsFacility}</div>
                                    </div>
                                {/if}
                                {#if $activeService.benefitsPatients}
                                    <div class="prose-custom">
                                        <h3 class="benefits-subheading">Dla pacjentów</h3>
                                        <div>{@html $activeService.benefitsPatients}</div>
                                    </div>
                                {/if}
                            </div>
                        </section>
                    {/if}
                    
                    {#if $activeService.collaborationModel}
                        <section aria-labelledby="collaboration">
                            <h2 id="collaboration" class="section-heading">Model współpracy</h2>
                            <div class="prose-custom">{@html $activeService.collaborationModel}</div>
                        </section>
                    {/if}
                </aside>
            </div>
            
            <!-- Footer -->
            {#if $activeService.collaborationSummary}
                <footer class="bg-white/50 px-6 sm:px-8 py-5 border-t border-slate-200/80 flex-shrink-0">
                    <div class="summary-box" role="complementary" aria-label="Podsumowanie współpracy">
                        <div class="prose-custom text-center">{@html $activeService.collaborationSummary}</div>
                    </div>
                </footer>
            {/if}
        </div>
    </div>
{/if}

<style is:global>
    .section-heading {
        font-size: 1.25rem; /* text-xl */
        font-weight: 700; /* font-bold */
        color: var(--color-text-primary);
        margin-bottom: 1rem; /* mb-4 */
        border-bottom: 2px solid hsl(var(--color-brand-blue-hsl) / 0.1);
        padding-bottom: 0.5rem;
    }
    
    .benefits-subheading {
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .summary-box {
        background: linear-gradient(to right, hsl(var(--color-brand-blue-hsl) / 0.05), hsl(var(--color-brand-blue-hsl) / 0.1));
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        border: 1px solid hsl(var(--color-brand-blue-hsl) / 0.2);
    }
    
    .prose-custom {
        color: var(--color-text-muted);
        line-height: 1.65;
        font-size: 0.9375rem; /* 15px */
    }
    
    .cta-button {
        position: relative;
        overflow: hidden;
        font-weight: 600;
        font-size: 1rem;
        line-height: 1.5;
        box-shadow: 0 4px 14px 0 hsl(var(--color-brand-blue-hsl) / 0.25);
    }
    
    .cta-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    .cta-button:hover::before {
        left: 100%;
    }
    
    .cta-button:hover {
        box-shadow: 0 6px 20px 0 hsl(var(--color-brand-blue-hsl) / 0.35);
        transform: translateY(-2px) scale(1.02);
    }
    
    .cta-button:active {
        transform: translateY(0) scale(0.98);
    }
    
    /* Focus styles */
    button:focus-visible {
        outline: 2px solid var(--color-brand-blue);
        outline-offset: 2px;
    }
</style>