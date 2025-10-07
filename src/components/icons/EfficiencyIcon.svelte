<!-- src/components/icons/EfficiencyIcon.svelte -->
<script lang="ts">
  // Używaj tego jeśli chcesz przekazać klasy *jako prop* (np. <EfficiencyIcon className="..." />)
  export let className: string = "";

  // A11y
  export let decorative: boolean = true;
  export let title: string = "Wydajność";

  // Domyślne style dla kart w ServicesGrid
  const base =
    "h-8 w-8 text-brand-blue mb-4 shrink-0 transition-transform duration-300 group-hover:scale-110";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  role="img"
  aria-hidden={decorative ? "true" : "false"}
  aria-label={decorative ? undefined : title}
  class={`${base} ${className} ${($$props.class as string) || ""}`}
  {...$$restProps}
>
  {#if !decorative}<title>{title}</title>{/if}
  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
</svg>
