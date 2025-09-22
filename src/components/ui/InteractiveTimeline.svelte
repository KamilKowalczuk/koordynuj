<script lang="ts">
	import { onMount } from 'svelte';
	// KROK 1: Importujemy Swiper.js (elementy webowe)
	import { register } from 'swiper/element/bundle';

	export let steps: any[] = [];
	
	// Rejestrujemy komponenty Swipera przy montowaniu
	onMount(() => {
		register();
	});

	// Funkcja do ikon (tak jak poprzednio, dla samowystarczalności)
	function getIcon(iconType: string) {
		const icons: Record<string, string> = {
			"audit": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">...</svg>`,
			"implementation": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">...</svg>`,
			"support": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">...</svg>`
		};
		// Wklej pełne ścieżki SVG z poprzedniej wersji
		return icons[iconType] || icons["support"];
	};
</script>

<swiper-container
	slides-per-view="1"
	space-between="30"
	loop="true"
	autoplay-delay="5000"
	autoplay-stop-on-last-slide="false"
	pagination-clickable="true"
	keyboard-enabled="true"
	grab-cursor="true"
>
	{#each steps as step}
		<swiper-slide>
			<div class="card group flex flex-col p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm h-full">
				<div class="flex items-center justify-between mb-4">
					<div class="relative w-20 h-20 flex items-center justify-center rounded-full">
						<div class="absolute inset-0 rounded-full" style="background: radial-gradient(circle, rgba(0,169,224,0.12) 0%, transparent 70%);"></div>
						<div class="absolute inset-0 rounded-full border border-slate-200"></div>
						{@html getIcon(step.icon)}
					</div>
					<span class="text-sm font-semibold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">{step.duration}</span>
				</div>
				
				<div class="flex flex-col flex-grow">
					<h3 class="text-2xl font-bold text-text-primary mb-4">
						{step.title}
					</h3>
					
					<ul class="text-text-muted space-y-2 flex-grow">
						{#each step.details as detail}
							<li class="flex items-start">
								<svg class="w-5 h-5 mr-2 text-brand-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
								<span>{detail}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</swiper-slide>
	{/each}
</swiper-container>

<style>
	/* KROK 4: Stylujemy paginację Swipera, aby pasowała do naszej marki */
	/* Musimy użyć :global, aby ostylować web komponenty Swipera */
	:global(swiper-container) {
		--swiper-pagination-color: var(--color-brand-blue);
		--swiper-pagination-bullet-inactive-color: #CBD5E0;
		--swiper-pagination-bullet-inactive-opacity: 1;
		--swiper-pagination-bullet-size: 10px;
		--swiper-pagination-bullet-horizontal-gap: 6px;
		padding-bottom: 40px; /* Robimy miejsce na kropki */
	}

	:global(swiper-slide) {
		height: auto; /* Pozwalamy slajdom rosnąć z treścią */
		padding: 4px; /* Drobny padding, aby cień karty był widoczny */
	}
	
	/* Dopasowujemy wysokość karty do reszty, aby uniknąć skoków */
	.card {
		min-height: 420px;
	}
</style>