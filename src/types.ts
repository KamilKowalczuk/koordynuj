// src/types.ts - ENHANCED WITH NEW STRAPI STRUCTURE

// Definiujemy dopuszczalne klucze dla naszych ikon.
export type IconKey = 'prevention' | 'efficiency' | 'legal' | 'startup';

// ENHANCED: Zaktualizowany interfejs Service zgodny z nową strukturą Strapi
export interface Service {
    id: number;
    title: string;
    shortDescription: string;
    icon: IconKey;
    
    // Nowe sekcje treści zgodne ze Strapi
    whyWorthIt: string;        // "Dlaczego warto?" - Rich text
    scope: string;             // "Zakres naszej oferty" - Rich text
    benefitsFacility: string;  // "Korzyści dla placówki" - Rich text
    benefitsPatients: string;  // "Korzyści dla pacjentów" - Rich text
    collaborationModel: string; // "Model współpracy - działania" - Rich text
    collaborationSummary: string; // "Model współpracy - podsumowanie (blue box)" - Rich text
    
    // Opcjonalne pola z Strapi
    order?: number;
    isActive?: boolean;
}

// Typ pomocniczy dla danych z Strapi API (może mieć inne nazwy pól)
export interface StrapiServiceResponse {
    id: number;
    title: string;
    shortDescription: string;
    icon: string;
    order: number;
    isActive: boolean;
    whyWorthIt: string;
    scope: string;
    benefitsFacility: string;
    benefitsPatients: string;
    collaborationModel: string;
    collaborationSummary: string;
}