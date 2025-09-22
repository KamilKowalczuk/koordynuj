<script lang="ts">
	import { onMount } from 'svelte';

	class Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number = 1.2;

		constructor(width: number, height: number) {
			this.x = Math.random() * width;
			this.y = Math.random() * height;
			this.vx = Math.random() * 0.4 - 0.2;
			this.vy = Math.random() * 0.4 - 0.2;
		}

		update(width: number, height: number) {
			this.x += this.vx;
			this.y += this.vy;

			if (this.x < 0 || this.x > width) this.vx *= -1;
			if (this.y < 0 || this.y > height) this.vy *= -1;
		}

		draw(ctx: CanvasRenderingContext2D) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(74, 85, 104, 0.5)';
			ctx.fill();
		}
	}

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let animationFrameId: number;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return; // Ten strażnik zostaje

		let width = container.offsetWidth;
		let height = container.offsetHeight;
		canvas.width = width;
		canvas.height = height;

		let particles = Array.from({ length: 80 }, () => new Particle(width, height));

		function animate() {
			// ROZWIĄZANIE: Dodajemy "Guard Clause", aby upewnić TypeScript, że 'ctx' nie jest nullem w tym zakresie.
			if (!ctx) return;
			
			ctx.clearRect(0, 0, width, height);

			for (const p1 of particles) {
				p1.update(width, height);
				p1.draw(ctx); // Teraz ten kod jest w 100% bezpieczny

				for (const p2 of particles) {
					if (p1 === p2) continue;
					const dx = p1.x - p2.x;
					const dy = p1.y - p2.y;
					const distance = Math.sqrt(dx * dx * dy * dy);

					if (distance < 120) {
						ctx.beginPath();
						ctx.moveTo(p1.x, p1.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.strokeStyle = `rgba(74, 85, 104, ${1 - distance / 120})`;
						ctx.lineWidth = 0.4;
						ctx.stroke();
					}
				}
			}
			animationFrameId = requestAnimationFrame(animate);
		}

		animate();

		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				width = entry.contentRect.width;
				height = entry.contentRect.height;
				canvas.width = width;
				canvas.height = height;
				
				particles = Array.from({ length: 80 }, () => new Particle(width, height));
			}
		});
		resizeObserver.observe(container);

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
		};
	});
</script>

<div bind:this={container} class="absolute inset-0 opacity-15">
	<canvas bind:this={canvas} class="absolute inset-0"></canvas>
</div>