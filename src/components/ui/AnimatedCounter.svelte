<!-- src/components/ui/AnimatedCounter.svelte -->
<script>
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    // Props
    export let targetValue = 0;
    export let prefix = '';
    export let suffix = '';
    export let color = 'blue';
    export let duration = 2000;

    // Animowany stan licznika
    const count = tweened(0, {
        duration: duration,
        easing: cubicOut
    });

    let hasStarted = false;

    // Funkcja startująca animację
    function startAnimation() {
        if (!hasStarted) {
            hasStarted = true;
            count.set(targetValue);
        }
    }

    // Intersection Observer do uruchomienia animacji gdy element wejdzie w viewport
    let counterElement;
    
    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startAnimation();
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (counterElement) {
            observer.observe(counterElement);
        }

        return () => {
            if (counterElement) {
                observer.unobserve(counterElement);
            }
        };
    });

    // Formatowanie wartości licznika
    $: formattedValue = Math.round($count);
    
    // Klasy kolorów
    $: colorClasses = {
        blue: 'text-brand-blue',
        green: 'text-green-600',
        orange: 'text-orange-500',
        red: 'text-red-600'
    };
</script>

<div bind:this={counterElement} class="counter-container">
    <div class={`text-5xl md:text-6xl font-bold ${colorClasses[color]} transition-all duration-300 hover:scale-105`}>
        <span class="prefix">{prefix}</span><span class="value">{formattedValue}</span><span class="suffix">{suffix}</span>
    </div>
    
    <div class="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
            class={`h-full bg-gradient-to-r transition-all ease-out ${
                color === 'blue' ? 'from-brand-blue to-brand-blue/70' :
                color === 'green' ? 'from-green-600 to-green-400' :
                color === 'orange' ? 'from-orange-500 to-orange-300' :
                'from-red-600 to-red-400'
            }`}
            style="width: {hasStarted ? ($count / targetValue) * 100 : 0}%; transition-duration: {duration}ms;"
        ></div>
    </div>
</div>

<style>
    .prefix, .suffix {
        font-weight: 600;
    }
    
    .value {
        font-weight: 800;
        letter-spacing: -0.02em;
    }
</style>