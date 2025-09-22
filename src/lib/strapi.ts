// src/lib/strapi.ts
// Utility funkcje do komunikacji ze Strapi CMS

// Konfiguracja środowiska
const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

// Dodatkowe opcje dla fetch (jeśli potrzebne będzie uwierzytelnianie)
const getFetchOptions = () => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Dodaj token jeśli jest ustawiony
  if (STRAPI_TOKEN) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  return options;
};

// Typy dla TypeScript
export interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

export interface GlobalSettings {
  siteTitle: string;
  siteDescription: string;
  logo?: {
    url: string;
    alternativeText: string;
  };
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
  fullDescription: string;
  benefits: string;
  collaborationModel: string;
  icon: string;
  order: number;
  isActive: boolean;
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

// Funkcja do pobierania danych z Strapi
async function fetchStrapi(endpoint: string): Promise<any> {
  try {
    console.log(`Fetching from: ${STRAPI_URL}/api/${endpoint}`);
    
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, getFetchOptions());
    
    if (!response.ok) {
      console.error(`Strapi API Error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    
    // W development pokazuj szczegóły błędu
    if (import.meta.env.DEV) {
      console.error('Strapi URL:', STRAPI_URL);
      console.error('Endpoint:', endpoint);
      console.error('Full URL:', `${STRAPI_URL}/api/${endpoint}`);
    }
    
    return null;
  }
}

// Funkcje do pobierania konkretnych danych
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const response = await fetchStrapi('global-settings?populate=*');
  return response?.data || null;
}

export async function getHeroSection(): Promise<HeroSection | null> {
  const response = await fetchStrapi('hero-section');
  return response?.data || null;
}

export async function getProblems(): Promise<Problem[]> {
  const response = await fetchStrapi('problems?sort=order:asc');
  return response?.data || [];
}

export async function getServices(): Promise<Service[]> {
  const response = await fetchStrapi('services?sort=order:asc&filters[isActive][$eq]=true');
  return response?.data || [];
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  const response = await fetchStrapi('process-steps?sort=order:asc');
  return response?.data || [];
}

export async function getCaseStudy(): Promise<CaseStudy | null> {
  const response = await fetchStrapi('case-study');
  return response?.data || null;
}

export async function getContactForm(): Promise<ContactForm | null> {
  const response = await fetchStrapi('contact-form');
  return response?.data || null;
}