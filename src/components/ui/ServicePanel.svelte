<script lang="ts">
	import { activeService } from '../../lib/serviceStore';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Service } from '../../types';
	
	// Funkcja zamykania panelu
	function closePanel() {
		$activeService = null;
	}
	
	// Obsługa klawiszy (ESC zamyka panel)
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePanel();
		}
	}
	
	// Obsługa kliknięcia w backdrop
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closePanel();
		}
	}
	
	// Obsługa klawiatury dla backdrop
	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
			closePanel();
		}
	}
	
	// Funkcja do renderowania HTML (z rich text ze Strapi)
	function renderHTML(content: string) {
		return content || '';
	}
</script>

<!-- ServicePanel - Overlay z szczegółami usługi -->
{#if $activeService}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
		on:keydown={handleBackdropKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="panel-title"
		tabindex="0"
	>
		<div
			transition:fly={{ y: 50, duration: 300, easing: cubicOut }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="panel-title"
			tabindex="0"
			class="relative w-full max-w-5xl max-h-[90vh] bg-background-light rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none pointer-events-auto"
			on:click|stopPropagation
			on:keydown={handleKeydown}
		>
			<!-- Header -->
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
						on:click={closePanel} 
						class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/50 rounded-lg transition-all duration-200 ml-4"
						aria-label="Zamknij panel"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>
			</header>
	
			<!-- Content - scrollable area -->
			<div class="overflow-y-auto flex-1 p-8 space-y-8">
				
				<!-- Dlaczego warto? -->
				{#if $activeService.whyWorthIt}
					<section class="space-y-4">
						<div class="prose prose-sm max-w-none">
							{@html renderHTML($activeService.whyWorthIt)}
						</div>
					</section>
				{/if}
				
				<!-- Zakres naszej oferty -->
				{#if $activeService.scope}
					<section class="space-y-4 bg-background-muted/50 p-6 rounded-2xl">
						<div class="prose prose-sm max-w-none">
							{@html renderHTML($activeService.scope)}
						</div>
					</section>
				{/if}
				
				<!-- Korzyści - połączone w jedną sekcję -->
				{#if $activeService.benefitsFacility || $activeService.benefitsPatients}
					<section class="space-y-4">
						<h4 class="text-lg font-semibold text-brand-blue mb-4">Korzyści</h4>
						<div class="grid md:grid-cols-2 gap-6">
							{#if $activeService.benefitsFacility}
								<div class="space-y-2">
									<div class="prose prose-sm max-w-none">
										{@html renderHTML($activeService.benefitsFacility)}
									</div>
								</div>
							{/if}
							
							{#if $activeService.benefitsPatients}
								<div class="space-y-2">
									<div class="prose prose-sm max-w-none">
										{@html renderHTML($activeService.benefitsPatients)}
									</div>
								</div>
							{/if}
						</div>
					</section>
				{/if}
				
				<!-- Model współpracy - działania -->
				{#if $activeService.collaborationModel}
					<section class="space-y-4">
						<div class="prose prose-sm max-w-none">
							{@html renderHTML($activeService.collaborationModel)}
						</div>
					</section>
				{/if}
				
				<!-- Model współpracy - podsumowanie (blue box) -->
				{#if $activeService.collaborationSummary}
					<section class="space-y-4">
						<div class="prose prose-sm max-w-none">
							{@html renderHTML($activeService.collaborationSummary)}
						</div>
					</section>
				{/if}
				
			</div>
			
			<!-- Footer with CTA -->
			<footer class="bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 px-8 py-6 border-t border-brand-blue/20 flex-shrink-0">
				<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="text-center sm:text-left">
						<p class="text-text-primary font-semibold mb-1">Chcesz wdrożyć to rozwiązanie?</p>
						<p class="text-sm text-text-muted">Skontaktuj się z nami i porozmawiajmy o Twojej placówce</p>
					</div>
					<div class="flex gap-3">
						<a 
							href="#kontakt" 
							on:click={closePanel}
							class="px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-colors duration-300 flex items-center"
						>
							Umów konsultację
							<svg class="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
							</svg>
						</a>
						<button 
							on:click={closePanel}
							class="px-6 py-3 bg-white border border-brand-blue/30 text-brand-blue font-semibold rounded-xl hover:bg-brand-blue/5 transition-colors duration-300"
						>
							Zamknij
						</button>
					</div>
				</div>
			</footer>
			
		</div>
	</div>
{/if}

<style>
	/* Stylowanie dla treści HTML ze Strapi - używamy tradycyjnych CSS zamiast @apply */
	:global(.prose) {
		color: #4A5568; /* text-text-primary */
	}
	
	:global(.prose h4) {
		font-size: 1.125rem; /* text-lg */
		font-weight: 600; /* font-semibold */
		color: #00A9E0; /* text-brand-blue */
		margin-bottom: 0.75rem; /* mb-3 */
	}
	
	:global(.prose h5) {
		font-weight: 600; /* font-semibold */
		margin-bottom: 0.5rem; /* mb-2 */
	}
	
	:global(.prose p) {
		margin-bottom: 1rem; /* mb-4 */
		line-height: 1.625; /* leading-relaxed */
	}
	
	:global(.prose ul) {
		margin-bottom: 1.5rem; /* mb-6 */
	}
	
	:global(.prose ul > li) {
		display: flex;
		align-items: flex-start;
		margin-bottom: 0.5rem; /* space-y-2 */
	}
	
	/* Stylowanie dla checkmarków i strzałek */
	:global(.prose li span) {
		color: #00A9E0; /* text-brand-blue */
		margin-right: 0.5rem; /* mr-2 */
		font-weight: 700; /* font-bold */
	}
	
	/* Stylowanie dla blue box */
	:global(.prose .bg-gradient-to-r) {
		background: linear-gradient(to right, rgba(0, 169, 224, 0.05), rgba(0, 169, 224, 0.1));
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid rgba(0, 169, 224, 0.2);
	}
	
	:global(.prose .bg-blue-50) {
		background-color: #EBF8FF;
		padding: 0.75rem;
		border-radius: 0.375rem;
	}
</style>