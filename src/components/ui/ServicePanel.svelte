<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { activeService } from '../../lib/serviceStore';

    let panelElement: HTMLDivElement;
    let returnFocusTo: Element | null = null;

    function closePanel() {
        $activeService = null;
    }

    // ZMIANA KLUCZOWA: Ta funkcja wraca, ale będzie przypisana do PRZYCISKU
    function handleBackdropClick(event: MouseEvent) {
        // Zamyka panel tylko jeśli kliknięto bezpośrednio w tło (przycisk),
        // a nie w jego zawartość, która jest w innym elemencie.
        if (event.currentTarget === event.target) {
            closePanel();
        }
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closePanel();
        }
        
        if (event.key === 'Tab' && $activeService) {
            const focusableElements = panelElement.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (event.shiftKey) { 
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { 
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    }

    $: if ($activeService && panelElement) {
        returnFocusTo = document.activeElement; 
        panelElement.focus();
    } else if (returnFocusTo) {
        (returnFocusTo as HTMLElement).focus();
        returnFocusTo = null;
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $activeService}
    <button
        transition:fade={{ duration: 300 }}
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 cursor-default"
        onclick={handleBackdropClick}
        aria-label="Zamknij panel"
    ></button>

    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
            bind:this={panelElement}
            transition:fly={{ y: 30, duration: 400, easing: cubicOut }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            tabindex="-1"
            class="relative w-full max-w-4xl max-h-[90vh] bg-background-light rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none pointer-events-auto"
        >
            <header class="bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 px-8 py-6 border-b border-brand-blue/20 flex-shrink-0">
                <div class="flex justify-between items-start">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-brand-blue/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <span class="text-brand-blue font-bold text-xl">0{$activeService.id}</span>
                        </div>
                        <div>
                            <h3 id="panel-title" class="text-2xl font-bold text-text-primary">{$activeService.title}</h3>
                            <p class="text-text-muted mt-1">{$activeService.shortDescription}</p>
                        </div>
                    </div>
                    <button 
                        onclick={closePanel} 
                        class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/50 rounded-lg transition-all duration-200 ml-4"
                        aria-label="Zamknij panel"
                    >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </header>
    
            <div class="overflow-y-auto p-8">
                 <article class="prose max-w-none">
                    <div class="mb-8">{@html $activeService.whyWorthIt}</div>
                    {#if $activeService.scope}<div class="mb-8">{@html $activeService.scope}</div>{/if}
                    {#if $activeService.benefits}<div class="mb-8">{@html $activeService.benefits}</div>{/if}
                    <div class="mb-8 bg-gradient-to-r from-brand-blue/5 to-transparent p-6 rounded-xl border-l-4 border-brand-blue">{@html $activeService.collaborationModel}</div>
                    
                    <footer class="text-center pt-6 border-t border-gray-200">
                        <p class="text-text-muted mb-4">Chcesz dowiedzieć się więcej o tej usłudze?</p>
                        <a href="#kontakt" 
                           onclick={closePanel}
                           class="btn-primary inline-flex items-center">
                            Umów bezpłatną konsultację
                            <svg class="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </a>
                    </footer>
                 </article>
            </div>
        </div>
    </div>
{/if}
<!-- 
<style lang="postcss">
    :global(.prose h4) { @apply text-lg font-semibold text-brand-blue mb-3 mt-6; }
    :global(.prose h5) { @apply font-semibold text-text-primary mb-2; }
    :global(.prose p) { @apply text-text-primary mb-4 leading-relaxed; }
    :global(.prose ul) { @apply list-none space-y-2 mb-4 p-0; }
    :global(.prose li) { @apply text-text-muted; }
    :global(.prose .bg-blue-50) { @apply bg-blue-50 p-3 rounded-lg; }
</style> -->