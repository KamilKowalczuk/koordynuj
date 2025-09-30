<script lang="ts">
	async function handleSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		
		alert('Dziękujemy za zgłoszenie! Skontaktujemy się z Tobą w ciągu 24h.');
		
		form.reset();
	}
</script>

<form class="bg-background-light p-8 md:p-12 rounded-3xl shadow-lg space-y-6" on:submit|preventDefault={handleSubmit}>
	<div class="form-group">
		<label for="name" class="sr-only">Imię</label>
		<input 
			type="text" 
			id="name"
			name="name"
			placeholder="Imię" 
			required
			class="input"
		/>
	</div>

	<div class="form-group">
		<label for="email" class="sr-only">E-mail</label>
		<input 
			type="email" 
			id="email"
			name="email"
			placeholder="E-mail" 
			required
			class="input"
		/>
	</div>

	<div class="form-group">
		<label for="phone" class="sr-only">Telefon</label>
		<input 
			type="tel" 
			id="phone"
			name="phone"
			placeholder="Telefon" 
			required
			class="input"
		/>
	</div>

	<div class="form-group">
		<label for="message" class="sr-only">Wiadomość (opcjonalnie)</label>
		<textarea 
			id="message"
			name="message"
			placeholder="Opisz krótko sytuację swojej placówki (opcjonalnie)" 
			rows="4"
			class="input resize-none"
		></textarea>
	</div>

	<button 
		type="submit" 
		class="btn-primary w-full text-xl py-5 group relative overflow-hidden"
	>
		<span class="relative z-10 flex items-center justify-center">
			Zacznijmy współpracę
			<svg class="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
			</svg>
		</span>
		<div class="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
	</button>

	<div class="text-center pt-4">
		<div class="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-text-muted">
			<div class="flex items-center">
				<svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				<span>Odpowiedź w 24h</span>
			</div>
			<div class="flex items-center">
				<svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				<span>Bezpłatna konsultacja</span>
			</div>
			<div class="flex items-center">
				<svg class="w-4 h-4 mr-2 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
				</svg>
				<span>100% poufność</span>
			</div>
		</div>
	</div>
</form>