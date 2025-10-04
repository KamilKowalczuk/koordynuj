<script lang="ts">
    import { onDestroy, tick } from 'svelte';
    import { activeService } from '../../lib/serviceStore';
    import type { Service } from '../../types';
    import DOMPurify from 'isomorphic-dompurify';
    import { fixOrphans } from '../../lib/typography';

    let panelContainer: HTMLElement;
    let closeButton: HTMLButtonElement;
    let isOpen = false;
    let currentService: Service | null = null;
    let sanitizedContent: Record<string, string> = {};
    let previouslyFocusedElement: HTMLElement | null;

    const unsubscribe = activeService.subscribe(async (service) => {
        if (service) {
            previouslyFocusedElement = document.activeElement as HTMLElement;
            currentService = service;
            isOpen = true;
            document.body.style.overflow = 'hidden';

            sanitizedContent = {
                shortDescription: DOMPurify.sanitize(fixOrphans(service.shortDescription)),
                whyWorthIt: DOMPurify.sanitize(fixOrphans(service.whyWorthIt)),
                scope: DOMPurify.sanitize(fixOrphans(service.scope)),
                benefitsFacility: DOMPurify.sanitize(fixOrphans(service.benefitsFacility)),
                benefitsPatients: DOMPurify.sanitize(fixOrphans(service.benefitsPatients)),
                collaborationModel: DOMPurify.sanitize(fixOrphans(service.collaborationModel)),
                collaborationSummary: DOMPurify.sanitize(fixOrphans(service.collaborationSummary))
            };
            
            await tick();
            panelContainer?.focus();
        } else if (isOpen) {
            isOpen = false;
            document.body.style.overflow = '';
            previouslyFocusedElement?.focus();
            setTimeout(() => { currentService = null; }, 300);
        }
    });

    function closePanel() { activeService.set(null); }
    function handleClickOutside(event: MouseEvent) { if (event.currentTarget === event.target) closePanel(); }
    function handleBackdropKeyDown(event: KeyboardEvent) { if ((event.key === 'Enter' || event.key === ' ') && event.currentTarget === event.target) closePanel(); }
    function handleGlobalKeyDown(e: KeyboardEvent) {
        if (!isOpen) return;
        if (e.key === 'Escape') { closePanel(); return; }
        if (e.key === 'Tab' && panelContainer) {
            const focusableElements = panelContainer.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const allFocusable = Array.from(focusableElements);
            const firstElement = allFocusable[0];
            const lastElement = allFocusable[allFocusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); }
            } else {
                if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); }
            }
        }
    }
    onDestroy(() => { unsubscribe(); });
</script>

<svelte:window on:keydown={handleGlobalKeyDown} />

{#if currentService}
    <div bind:this={panelContainer} class="service-panel fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm" class:open={isOpen} role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="service-panel-title" on:click={handleClickOutside} on:keydown={handleBackdropKeyDown}>
        <div class="panel-content w-full max-w-5xl bg-background-light shadow-2xl rounded-2xl flex flex-col max-h-[90vh]" role="document">
            <header class="flex items-start justify-between gap-4 p-6 border-b border-slate-200/80 flex-shrink-0">
                <div>
                    <h2 id="service-panel-title" class="text-2xl font-bold text-brand-blue">{currentService.title}</h2>
                    <!-- <div class="header-description strapi-content mt-1 pr-4">
                        {@html sanitizedContent.shortDescription}
                    </div> -->
                </div>
                <button bind:this={closeButton} on:click={closePanel} class="p-2 rounded-full hover:bg-slate-200/80 transition-colors flex-shrink-0" aria-label="Zamknij panel">
                    <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            <div class="overflow-y-auto p-8 flex-grow">
				<div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
					
					<div class="strapi-content panel-body-content">
						<h4>Dlaczego warto?</h4>
						{@html sanitizedContent.whyWorthIt}
						
						<div class="mt-8 p-6 bg-slate-50 border border-slate-200/80 rounded-xl">
							<h4 class="mt-0">Korzyści</h4>
							<div class="grid sm:grid-cols-2 gap-x-6 gap-y-4">
								<div class="benefits-list">
									<h5 class="font-semibold text-brand-blue mb-2"><span class="mr-2">+</span>Dla placówki</h5>
									{@html sanitizedContent.benefitsFacility}
								</div>
								<div class="benefits-list">
									<h5 class="font-semibold text-brand-blue mb-2"><span class="mr-2">+</span>Dla pacjentów</h5>
									{@html sanitizedContent.benefitsPatients}
								</div>
							</div>
						</div>
					</div>

					<div class="strapi-content panel-body-content lg:border-l lg:border-slate-200/80 lg:pl-12">
						<h4>Zakres naszej oferty</h4>
						{@html sanitizedContent.scope}

						<div class="steps-list">
							<h4 class="mt-8">Model współpracy</h4>
							{@html sanitizedContent.collaborationModel}
						</div>
						
						{#if sanitizedContent.collaborationSummary}
							<div class="strapi-content panel-body-content summary-box mt-8">{@html sanitizedContent.collaborationSummary}</div>
						{/if}
					</div>

                </div>
            </div>

            <footer class="flex-shrink-0 border-t border-slate-200/80 bg-white/50 backdrop-blur-sm p-6 text-center rounded-b-2xl">
                <a href="#kontakt" on:click={closePanel} class="btn-primary inline-flex items-center group">
                    Umów konsultację
                    <svg class="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </footer>
        </div>
    </div>
{/if}

<style>
    /* === ANIMACJE PANELU === */
    .service-panel { 
        opacity: 0; 
        transition: opacity 0.3s ease; 
    }
    .service-panel.open { 
        opacity: 1; 
    }
    .panel-content { 
        opacity: 0; 
        transform: scale(0.95); 
        transition: all 0.3s ease-in-out; 
    }
    .service-panel.open .panel-content { 
        opacity: 1; 
        transform: scale(1); 
    }
    
    /* === TYPOGRAPHY FIX - TYLKO GŁÓWNA ZAWARTOŚĆ === */
    /* Nadpisujemy style TYLKO dla .panel-body-content (głównej treści panelu) */
    /* Header (.header-description) pozostaje bez zmian! */
    
    :global(.panel-body-content) {
        font-size: 1.0625rem !important;  /* 17px - sweet spot między 16 a 18 */
        line-height: 1.625 !important;      /* Lepszy oddech niż 1.625 */
    }
    
    :global(.panel-body-content p) {
        line-height: 1.625 !important;
        margin-bottom: 1rem;
    }
    
    :global(.panel-body-content p:last-child) {
        margin-bottom: 0;
    }
    
    /* Nagłówki h4/h5 pozostają bez zmian - są już dobre */
    /* Fajki i strzałki pozostają bez zmian - działają z global.css */
    /* Summary box pozostaje bez zmian */
</style>