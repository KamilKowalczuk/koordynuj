<script lang="ts">
	import { activeService } from '../../lib/serviceStore';
	import { onMount } from 'svelte';
	// POPRAWKA: Importujemy typy z naszego nowego, centralnego źródła prawdy
	import type { Service, IconKey } from '../../types';

	import PreventionIcon from '../icons/PreventionIcon.svelte';
	import EfficiencyIcon from '../icons/EfficiencyIcon.svelte';
	import LegalIcon from '../icons/LegalIcon.svelte';
	import StartupIcon from '../icons/StartupIcon.svelte';

	// Prop services jest teraz poprawnie i ściśle otypowany
	export let services: Service[] = [];

	const iconMap: Record<IconKey, any> = {
		prevention: PreventionIcon,
		efficiency: EfficiencyIcon,
		legal: LegalIcon,
		startup: StartupIcon,
	};
	
	function openServiceDetails(service: Service) {
		$activeService = service;
	}

	// Animation system on mount
	onMount(() => {
		const cards = document.querySelectorAll('.service-card');
		
		// Reveal animation observer - same as Problems
		const revealObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const delay = entry.target.getAttribute('data-reveal-delay') || '0';
					setTimeout(() => {
						entry.target.classList.add('revealed');
					}, parseInt(delay, 10));
					revealObserver.unobserve(entry.target);
				}
			});
		}, { 
			threshold: 0.1,
			rootMargin: '-5%'
		});

		cards.forEach((card, index) => {
			card.setAttribute('data-reveal-delay', String(index * 150));
			revealObserver.observe(card);
		});

		return () => {
			cards.forEach(card => {
				revealObserver.unobserve(card);
			});
		};
	});
</script>

<div class="mt-16 grid md:grid-cols-2 gap-8">
	{#each services as service, index}
		<button
			class="service-card group relative flex flex-col p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm transition-all duration-500 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10 text-left w-full h-full"
			on:click={() => openServiceDetails(service)}
			aria-label={`Otwórz szczegóły usługi: ${service.title}`}
			data-service-index={index}
		>
			<!-- Enhanced service number -->
			<div class="absolute top-6 right-6 text-5xl font-bold text-brand-blue/10 group-hover:text-brand-blue/20 transition-colors duration-300 number-element" aria-hidden="true">
				0{service.id}
			</div>

			<!-- Enhanced icon container - ORIGINAL SIZE ENFORCED -->
			<div class="mb-6 icon-container relative">
				<div class="icon-glow absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
				<svelte:component this={iconMap[service.icon]} class="text-brand-blue relative z-10 icon-element group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
			</div>
			
			<div class="flex flex-col flex-grow">
				<h3 class="text-2xl font-bold text-text-primary mb-4 pr-12 group-hover:text-brand-blue/90 transition-colors duration-300">
					{service.title}
				</h3>
				
				<p class="text-text-muted leading-relaxed mb-6 flex-grow group-hover:text-text-primary/90 transition-colors duration-300">
					{service.shortDescription}
				</p>
				
				<span class="inline-flex items-center text-brand-blue font-semibold mt-auto group-hover:translate-x-1 transition-transform duration-300">
					Zobacz szczegóły
					<svg class="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
					</svg>
				</span>
			</div>
		</button>
	{/each}
</div>

<style>
	/* === CONSISTENT ANIMATION SYSTEM WITH PROBLEMS === */
	
	/* 1. REVEAL ANIMATIONS */
	:global(.service-card) {
		opacity: 0;
		transform: translateY(30px) scale(0.95);
		transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
	
	:global(.service-card.revealed) {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	/* 2. ENHANCED CARD INTERACTIONS - SAME AS PROBLEMS */
	.service-card {
		cursor: pointer;
		position: relative;
	}
	
	.service-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 1.5rem;
		background: linear-gradient(135deg, rgba(0, 169, 224, 0.05), rgba(0, 169, 224, 0.02));
		opacity: 0;
		transition: opacity 0.5s ease;
	}
	
	.service-card:hover::before {
		opacity: 1;
	}

	/* 3. ICON GLOW EFFECT - SAME AS PROBLEMS - SMALL SIZE */
	.icon-glow {
		background: radial-gradient(circle, rgba(0, 169, 224, 0.3) 0%, transparent 70%);
		width: 40px;
		height: 40px;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	/* ICON SIZE ENFORCEMENT */
	.icon-container :global(svg) {
		width: 2.5rem !important;  /* h-10 = 40px */
		height: 2.5rem !important; /* w-10 = 40px */
	}

	/* 4. ENHANCED HOVER DEPTH */
	.service-card:hover {
		transform: translateY(-4px) scale(1);
	}
	
	.service-card:hover :global(.icon-element) {
		filter: drop-shadow(0 4px 8px rgba(0, 169, 224, 0.2));
	}

	/* 5. NUMBER ELEMENT SUBTLE ANIMATION */
	.number-element {
		transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
	
	.service-card:hover .number-element {
		transform: scale(1.05) rotate(-2deg);
	}

	/* === FALLBACK & ACCESSIBILITY === */
	
	/* Fallback: show elements if JS doesn't load */
	:global(.no-js .service-card) {
		opacity: 1 !important;
		transform: none !important;
	}
	
	@media (prefers-reduced-motion: reduce) {
		.service-card,
		.icon-element,
		.number-element {
			animation: none !important;
			transition: none !important;
		}
		
		.service-card {
			opacity: 1;
			transform: none;
		}
	}
</style>