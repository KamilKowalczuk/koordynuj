<!-- src/components/icons/PreventionIcon.svelte -->
<script lang="ts">
  export let className: string = "";
  export let decorative: boolean = true;
  export let title: string = "Profilaktyka";

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
  <!-- Tarcza (outline) -->
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <!-- Check symbolizujący „prewencję / zabezpieczenie” -->
  <path d="M9 12l2 2 4-4" />
</svg>
