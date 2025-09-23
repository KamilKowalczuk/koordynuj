<!-- src/components/icons/LegalIcon.svelte -->
<script lang="ts">
  export let className: string = "";
  export let decorative: boolean = true;
  export let title: string = "Prawo";

  const base =
    "h-8 w-8 text-brand-blue mb-4 shrink-0 transition-transform duration-300 group-hover:scale-110";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 20 20"
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

  <!-- Kolumna prawa — minimalistyczna -->
  <!-- Gzyms (góra) -->
  <path d="M6 7h12" />
  <!-- Podgzyms -->
  <path d="M7 9h10" />
  <!-- Trzy żłobienia/trzony -->
  <path d="M9 9v8" />
  <path d="M12 9v8" />
  <path d="M15 9v8" />
  <!-- Baza -->
  <path d="M6 19h12" />
</svg>
