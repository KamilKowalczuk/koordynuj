// src/lib/serviceStore.ts
import { writable } from 'svelte/store';
// Importujemy naszą definicję z centralnego pliku typów
import type { Service } from '../types';

// Store jest teraz w pełni świadomy kształtu danych, które przechowuje.
export const activeService = writable<Service | null>(null);