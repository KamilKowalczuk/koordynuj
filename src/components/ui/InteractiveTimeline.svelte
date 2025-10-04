<script lang="ts">
    import { onMount } from 'svelte';
    import { register } from 'swiper/element/bundle';
    import DOMPurify from 'isomorphic-dompurify'; // Krok 1: Importujemy DOMPurify dla bezpieczeństwa

    export let steps: any[] = [];
    let swiperEl: any;

    onMount(() => {
        register();
        const swiperContainer = document.querySelector('.enhanced-swiper');
        if (swiperContainer) {
            swiperEl = swiperContainer;
        }
    });

    function handlePrev() {
        swiperEl?.swiper.slidePrev();
    }

    function handleNext() {
        swiperEl?.swiper.slideNext();
    }

    function getIcon(iconType: string) {
        const icons: Record<string, string> = {
            "audit": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
            "implementation": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>`,
            "support": `<svg class="h-10 w-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>`
        };
        return icons[iconType] || icons["support"];
    }
</script>

<div class="relative timeline-wrapper">
    <swiper-container
        slides-per-view="1"
        space-between="30"
        loop="true"
        autoplay-delay="12000"
        pagination-clickable="true"
        keyboard-enabled="true"
        grab-cursor="true"
        class="enhanced-swiper"
    >
        {#each steps as step}
            <swiper-slide>
                <div class="timeline-card card group flex flex-col p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm h-full transition-all duration-500 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10">
                    <div class="flex items-center justify-between mb-4">
                        <div class="mb-6 icon-container relative">
                            <div class="icon-glow absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <div class="relative z-10 icon-element group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                {@html getIcon(step.icon)}
                            </div>
                        </div>
                        <span class="text-sm font-semibold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full group-hover:bg-brand-blue/20 transition-all duration-300">
                            {step.duration}
                        </span>
                    </div>
                    <div class="flex flex-col flex-grow">
                        <h3 class="text-2xl font-bold text-text-primary mb-4 group-hover:text-brand-blue/90 transition-colors duration-300">{step.title}</h3>
                        
                        <div class="strapi-content mb-4 group-hover:text-text-primary/90 transition-colors duration-300">
                            {@html DOMPurify.sanitize(step.description || '')}
                        </div>

                        <ul class="text-text-muted space-y-2 flex-grow">
                            {#each step.details as detail}
                                <li class="flex items-start detail-item group-hover:text-text-primary/90 transition-colors duration-300">
                                    <svg class="w-5 h-5 mr-2 text-brand-blue flex-shrink-0 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    <span>{detail}</span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            </swiper-slide>
        {/each}
    </swiper-container>

    <button on:click={handlePrev} class="swiper-button-custom swiper-button-prev-custom" aria-label="Poprzedni slajd">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
    </button>
    <button on:click={handleNext} class="swiper-button-custom swiper-button-next-custom" aria-label="Następny slajd">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
    </button>
</div>

<style>
    .timeline-wrapper {
        position: relative;
        padding: 0 4rem;
        margin: 0 -4rem;
    }
    :global(.timeline-card) {
        cursor: default;
        position: relative;
        min-height: 420px;
    }
    :global(.timeline-card::before) {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 1.5rem;
        background: linear-gradient(135deg, rgba(0, 169, 224, 0.05), rgba(0, 169, 224, 0.02));
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    :global(.timeline-card:hover::before) {
        opacity: 1;
    }
    .icon-glow {
        background: radial-gradient(circle, rgba(0, 169, 224, 0.3) 0%, transparent 70%);
        width: 40px;
        height: 40px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    :global(.timeline-card:hover) {
        transform: translateY(-4px);
    }
    :global(.timeline-card:hover .icon-element) {
        filter: drop-shadow(0 4px 8px rgba(0, 169, 224, 0.2));
    }
    :global(.enhanced-swiper) {
        --swiper-pagination-color: var(--color-brand-blue);
        --swiper-pagination-bullet-inactive-color: #CBD5E0;
        --swiper-pagination-bullet-inactive-opacity: 1;
        --swiper-pagination-bullet-size: 10px;
        --swiper-pagination-bullet-horizontal-gap: 6px;
        padding-bottom: 40px;
    }
    :global(.enhanced-swiper swiper-slide) {
        height: auto;
        padding: 4px;
    }
    .swiper-button-custom {
        position: absolute;
        top: calc(50% - 20px);
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: all 0.2s ease-out;
        color: var(--color-brand-blue);
    }
    .swiper-button-custom:hover {
        background-color: hsl(var(--color-brand-blue-hsl) / 0.1);
        transform: translateY(-50%) scale(1.05);
    }
    .swiper-button-prev-custom {
        left: 0;
    }
    .swiper-button-next-custom {
        right: 0;
    }
    @media (prefers-reduced-motion: reduce) {
        :global(.timeline-card),
        .icon-element,
        .detail-item {
            animation: none !important;
            transition: none !important;
        }
    }
    @media (max-width: 1024px) {
        .timeline-wrapper {
            padding: 0 1rem;
            margin: 0 -1rem;
        }
    }
    @media (max-width: 768px) {
        .timeline-wrapper {
            padding: 0;
            margin: 0;
        }
        .swiper-button-custom {
            display: none;
        }
        :global(.timeline-card) {
            min-height: 380px;
            padding: 1.5rem;
        }
        .icon-container {
            width: 4rem !important;
            height: 4rem !important;
        }
        :global(.icon-container svg) {
            width: 2rem !important;
            height: 2rem !important;
        }
    }
</style>