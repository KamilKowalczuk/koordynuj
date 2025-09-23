<!-- src/components/icons/StartupIcon.svelte -->
<script lang="ts">
  export let className: string = "";
  export let decorative: boolean = true;
  export let title: string = "Startup";

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

  <!-- Korpus rakiety – miękki „kapsułowy” kształt -->
  <path d="M12 3c2.8 2.4 4 5.1 4 8.1 0 2.1-.8 3.7-2.4 4.9l-1.6-1.2-1.6 1.2C8.8 14.8 8 13.2 8 11.1 8 8.1 9.2 5.4 12 3z" />

  <!-- Okno -->
  <circle cx="12" cy="9.2" r="1.3" />

  <!-- Miękkie płetwy (krótkie, zaokrąglone) -->
  <path d="M9.4 15.4l-1.8 1.2" />
  <path d="M14.6 15.4l1.8 1.2" />

  <!-- Płomień (łagodna kropla) -->
  <path d="M12 15.8c.9.8.9 2 0 2.8-.9-.8-.9-2 0-2.8z" />
</svg>
