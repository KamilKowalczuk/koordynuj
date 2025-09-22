<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container: HTMLDivElement;
    let animationFrameId: number;
    let autoPlayInterval: any;
    let sphereReady = false;

    // --- BEZ ZMIAN (cała sekcja onMount do momentu "const renderer") ---
    onMount(() => {
        if (!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // ★★★ MISTRZOWSKA POPRAWKA: DYNAMICZNE POZYCJONOWANIE KAMERY ★★★
        const sphereRadius = 2.5;
        const fov = camera.fov * (Math.PI / 180); // FOV to radians
        const cameraDistance = sphereRadius / Math.tan(fov / 2);
        camera.position.z = cameraDistance * 1.5; // Mnożnik 1.5 dla marginesu
        // ★★★ KONIEC POPRAWKI ★★★

        // --- RESZTA KODU POZOSTAJE W WIĘKSZOŚCI BEZ ZMIAN ---
        // Enhanced dot configuration for medical/molecular aesthetic
        const count = 6000;
        const initialPositions = new Float32Array(count * 3);
        const targetPositions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            initialPositions[i3] = (Math.random() - 0.5) * 12;
            initialPositions[i3 + 1] = (Math.random() - 0.5) * 12;
            initialPositions[i3 + 2] = (Math.random() - 0.5) * 12;

            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            
            targetPositions[i3] = sphereRadius * Math.cos(theta) * Math.sin(phi);
            targetPositions[i3 + 1] = sphereRadius * Math.sin(theta) * Math.sin(phi);
            targetPositions[i3 + 2] = sphereRadius * Math.cos(phi);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
        
        const material = new THREE.PointsMaterial({
            color: '#00A9E0',
            size: 0.025,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            alphaMap: createCircularTexture(),
            alphaTest: 0.1,
            sizeAttenuation: true
        });
        
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const mouse = new THREE.Vector2();
        const targetMouse = new THREE.Vector2();
        
        const handleMouseMove = (event: MouseEvent) => {
            targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const clock = new THREE.Clock();
        let progress = { value: 0 };
        
        setTimeout(() => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                progress.value += 0.018;
                if (progress.value >= 1) {
                    progress.value = 1;
                    clearInterval(autoPlayInterval);
                    
                    if (!sphereReady) {
                        sphereReady = true;
                        window.dispatchEvent(new CustomEvent('sphere-ready'));
                    }
                }
            }, 16);
        }, 150);

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            
            mouse.x += (targetMouse.x - mouse.x) * 0.1;
            mouse.y += (targetMouse.y - mouse.y) * 0.1;
            
            const currentPositions = geometry.attributes.position.array as Float32Array;
            
            for (let i = 0; i < count * 3; i++) {
                const easedProgress = 1 - Math.pow(1 - progress.value, 3);
                currentPositions[i] += (targetPositions[i] - currentPositions[i]) * 0.06 * easedProgress;
            }
            geometry.attributes.position.needsUpdate = true;
            
            points.rotation.y = elapsedTime * 0.08 + mouse.x * 0.3;
            points.rotation.x = elapsedTime * 0.04 + mouse.y * 0.2;

            renderer.render(scene, camera);
            animationFrameId = window.requestAnimationFrame(tick);
        };
        
        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (!width || !height) return;
            
            camera.aspect = width / height;

            // ★★★ DODAJ TĘ LINIĘ RÓWNIEŻ TUTAJ ★★★
            camera.position.z = (sphereRadius / Math.tan(fov / 2) / camera.aspect) * 1.5;
            
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        handleResize();
        tick();

        // --- BEZ ZMIAN W SEKCJI ZWRACANIA FUNKCJI I onDestroy ---
        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            if (container) {
                 resizeObserver.unobserve(container);
            }
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    });
    
    // --- FUNKCJA createCircularTexture() BEZ ZMIAN ---
    function createCircularTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, 32, 32);
        
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
</script>

<div 
    bind:this={container} 
    class="w-full h-full"
    aria-label="Interactive molecular sphere visualization"
    role="img"
></div>

<style>
    div {
        transform: translateZ(0);
        backface-visibility: hidden;
        will-change: transform;
    }
    :global(canvas) {
        display: block;
        width: 100% !important;
        height: 100% !important;
    }
</style>