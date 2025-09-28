<script lang="ts">
	import { activeService } from '../../lib/serviceStore';
	import type { Service, IconKey } from '../../types';
	import PreventionIcon from '../icons/PreventionIcon.svelte';
	import EfficiencyIcon from '../icons/EfficiencyIcon.svelte';
	import LegalIcon from '../icons/LegalIcon.svelte';
	import StartupIcon from '../icons/StartupIcon.svelte';
	import DOMPurify from 'isomorphic-dompurify';

	export let services: Service[] = [];

	const iconMap: Record<IconKey, any> = {
		prevention: PreventionIcon,
		efficiency: EfficiencyIcon,
		legal: LegalIcon,
		startup: StartupIcon
	};

	function openServiceDetails(service: Service) {
		$activeService = service;
	}
</script>

<div class="mt-16 grid md:grid-cols-2 gap-8">
	{#each services as service, index}
		<button
			class="service-card group relative flex flex-col p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm transition-all duration-500 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10 text-left w-full h-full"
			on:click={() => openServiceDetails(service)}
			aria-label={`Otwórz szczegóły usługi: ${service.title}`}
		>
			<div
				class="absolute top-6 right-6 text-5xl font-bold text-brand-blue/10 group-hover:text-brand-blue/20 transition-colors duration-300 number-element"
				aria-hidden="true"
			>
				0{index + 1}
			</div>

			<div class="mb-6 icon-container relative">
				<div class="icon-glow absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
				<svelte:component
					this={iconMap[service.icon]}
					class="text-brand-blue relative z-10 icon-element group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
				/>
			</div>

			<div class="flex flex-col flex-grow">
				<h3 class="text-2xl font-bold text-text-primary mb-4 pr-12 group-hover:text-brand-blue/90 transition-colors duration-300">
					{service.title}
				</h3>

                <div class="service-card-description flex-grow mb-6">
					{@html DOMPurify.sanitize(service.shortDescription)}
				</div>

				<span class="inline-flex items-center text-brand-blue font-semibold mt-auto group-hover:translate-x-1 transition-transform duration-300">
					Zobacz szczegóły
					<svg class="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
					</svg>
				</span>
			</div>
		</button>
	{/each}
</div>

<style>
	.service-card { cursor: pointer; position: relative; }
	.service-card::before { content: ''; position: absolute; inset: 0; border-radius: 1.5rem; background: linear-gradient(135deg, rgba(0, 169, 224, 0.05), rgba(0, 169, 224, 0.02)); opacity: 0; transition: opacity 0.5s ease; }
	.service-card:hover::before { opacity: 1; }
	.icon-glow { background: radial-gradient(circle, rgba(0, 169, 224, 0.3) 0%, transparent 70%); width: 40px; height: 40px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
	.icon-container :global(svg) { width: 2.5rem !important; height: 2.5rem !important; }
	.service-card:hover { transform: translateY(-4px); }
	.service-card:hover :global(.icon-element) { filter: drop-shadow(0 4px 8px rgba(0, 169, 224, 0.2)); }
	.number-element { transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
	.service-card:hover .number-element { transform: scale(1.05) rotate(-2deg); }
</style>