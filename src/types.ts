// src/types.ts

// Definiujemy dopuszczalne klucze dla naszych ikon.
export type IconKey = 'prevention' | 'efficiency' | 'legal' | 'startup';

// Definiujemy interfejs dla pojedynczej usługi. To jest nasze "źródło prawdy".
export interface Service {
    id: number;
    title: string;
    shortDescription: string;
    icon: IconKey; // Używamy naszego zdefiniowanego typu
    whyWorthIt: string;
    scope?: string;
    benefits?: string;
    collaborationModel: string;
}