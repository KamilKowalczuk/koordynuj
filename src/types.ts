// src/types.ts - JEDNO, CENTRALNE ŹRÓDŁO PRAWDY DLA TYPÓW

// Definiujemy dopuszczalne klucze dla naszych ikon.
export type IconKey = 'prevention' | 'efficiency' | 'legal' | 'startup';

// --- GŁÓWNE TYPY TREŚCI ---

export interface GlobalSettings {
    siteTitle: string;
    siteDescription: string;
    logo?: { data?: { attributes: { url: string; alternativeText: string; } } };
    primaryColor: string;
    contactPhone: string;
    contactEmail: string;
    companyAddress: string;
}

export interface HeroSection {
    mainTitle: string;
    subTitle: string;
    description: string;
    ctaButtonText: string;
    ctaButtonLink: string;
}

export interface Problem {
    id: number;
    title: string;
    description: string;
    icon: string;
    order: number;
}

export interface Service {
    id: number;
    title: string;
    shortDescription: string;
    icon: IconKey;
    whyWorthIt: string;
    scope: string;
    benefitsFacility: string;
    benefitsPatients: string;
    collaborationModel: string;
    collaborationSummary?: string;
    order?: number;
    isActive?: boolean;
}

export interface ProcessStep {
    id: number;
    title: string;
    description: string;
    details: string[];
    duration: string;
    icon: string;
    order: number;
}

export interface CaseStudy {
    title: string;
    subtitle: string;
    description: string;
    results: Record<string, string>;
    testimonial: string;
    clientName: string;
    clientPosition: string;
}

export interface ContactForm {
    sectionTitle: string;
    sectionDescription: string;
    formTitle: string;
    submitButtonText: string;
    successMessage: string;
    responseTime: string;
}

// --- TYPY DLA BLOGA ---

export interface BlogCategory {
  id: number;
  title: string;
  name?: string;
  slug?: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  published: string;
  blog_categories?: { data: BlogCategory[] };
  featuredImage?: { data?: { attributes: { url: string; alternativeText?: string; } } };
}