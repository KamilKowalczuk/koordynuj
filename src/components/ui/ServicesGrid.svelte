<script lang="ts">
	import { activeService } from '../../lib/serviceStore';
	// POPRAWKA: Importujemy typy z naszego nowego, centralnego źródła prawdy
	import type { Service, IconKey } from '../../types';

	import PreventionIcon from '../icons/PreventionIcon.svelte';
	import EfficiencyIcon from '../icons/EfficiencyIcon.svelte';
	import LegalIcon from '../icons/LegalIcon.svelte';
	import StartupIcon from '../icons/StartupIcon.svelte';

	// Prop `services` jest teraz poprawnie i ściśle otypowany
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
</script>

<div class="mt-16 grid md:grid-cols-2 gap-8">
	{#each services as service}
		<button
			class="group relative flex flex-col p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm transition-all duration-300 hover:border-brand-blue/50 hover:shadow-lg text-left w-full h-full"
			on:click={() => openServiceDetails(service)}
			aria-label={`Otwórz szczegóły usługi: ${service.title}`}
		>
			<div class="absolute top-6 right-6 text-5xl font-bold text-brand-blue/10 group-hover:text-brand-blue/20 transition-colors duration-300" aria-hidden="true">
				0{service.id}
			</div>

			<div class="mb-6">
				<svelte:component this={iconMap[service.icon]} />
			</div>
			
			<div class="flex flex-col flex-grow">
				<h3 class="text-2xl font-bold text-text-primary mb-4 pr-12">
					{service.title}
				</h3>
				
				<p class="text-text-muted leading-relaxed mb-6 flex-grow">
					{service.shortDescription}
				</p>
				
				<span class="inline-flex items-center text-brand-blue font-semibold mt-auto">
					Zobacz szczegóły
					<svg class="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
				</span>
			</div>
		</button>
	{/each}
</div>