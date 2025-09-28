// src/lib/strapi.ts - WERSJA Z "PANCERNĄ NORMALIZACJĄ" DANYCH

import type { IconKey, Service } from '../types';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

const getFetchOptions = () => {
  const options: RequestInit = { headers: { 'Content-Type': 'application/json' } };
  if (STRAPI_TOKEN) { (options.headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_TOKEN}`; }
  return options;
};

// Interfejsy lokalne (zgodnie z działającą strukturą)
export interface StrapiResponse<T> { data: T; meta?: any; }
export interface GlobalSettings { siteTitle: string; siteDescription: string; logo?: { url: string; alternativeText: string; }; primaryColor: string; contactPhone: string; contactEmail: string; companyAddress: string; }
export interface HeroSection { mainTitle: string; subTitle: string; description: string; ctaButtonText: string; ctaButtonLink: string; }
export interface Problem { id: number; title: string; description: string; icon: string; order: number; }
export interface ProcessStep { id: number; title: string; description: string; details: string[]; duration: string; icon: string; order: number; }
export interface CaseStudy { title: string; subtitle: string; description: string; results: Record<string, string>; testimonial: string; clientName: string; clientPosition: string; }
export interface ContactForm { sectionTitle: string; sectionDescription: string; formTitle: string; submitButtonText: string; successMessage: string; responseTime: string; }
export interface BlogCategory { id: number; title: string; name?: string; slug?: string; description?: string; }
export interface BlogPost { id: number; title: string; slug: string; content?: string; excerpt?: string; published: string; blog_categories?: BlogCategory[]; featuredImage?: { url:string; alternativeText?: string; }; }

async function fetchStrapi(endpoint: string): Promise<any> {
  try {
    const fullUrl = `${STRAPI_URL}/api/${endpoint}`;
    const response = await fetch(fullUrl, getFetchOptions());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function getStrapiMediaUrl(media: { url: string } | null | undefined): string | null {
  if (!media?.url) { return null; }
  if (media.url.startsWith('http')) { return media.url; }
  return `${STRAPI_URL}${media.url}`;
}

// Reszta funkcji API bez zmian
export async function getGlobalSettings(): Promise<GlobalSettings | null> { const response = await fetchStrapi('global-settings?populate=*'); return response?.data || null; }
export async function getHeroSection(): Promise<HeroSection | null> { const response = await fetchStrapi('hero-section'); return response?.data || null; }
export async function getProblems(): Promise<Problem[]> { const response = await fetchStrapi('problems?sort=order:asc'); return response?.data || []; }

// === OSTATECZNA, KULOODPORNA WERSJA getServices ===
export async function getServices(): Promise<Service[]> {
    const response = await fetchStrapi('services?sort=order:asc&filters[isActive][$eq]=true');
    const services = response?.data || [];

    // "Czyścimy i budujemy od nowa" dane dla każdej usługi
    return services.map((service: Service) => {
        let cleanText = service.shortDescription?.replace(/<[^>]*>?/gm, '') || '';
        
        return {
            ...service,
            shortDescription: `<p>${cleanText.trim()}</p>`
        };
    });
}
// ===================================================

export async function getProcessSteps(): Promise<ProcessStep[]> { const response = await fetchStrapi('process-steps?sort=order:asc'); return response?.data || []; }
export async function getCaseStudy(): Promise<CaseStudy | null> { const response = await fetchStrapi('case-study'); return response?.data || null; }
export async function getContactForm(): Promise<ContactForm | null> { const response = await fetchStrapi('contact-form'); return response?.data || null; }

// Funkcje bloga (bez zmian)
// ...
export async function getBlogPosts(limit?: number, page: number = 1): Promise<BlogPost[] | null> {
    try {
      let query = `blog-posts?sort=published:desc&populate[blog_categories][populate]=*&populate[featuredImage][populate]=*`;
      if (limit) { query += `&pagination[limit]=${limit}`; }
      if (page > 1) { query += `&pagination[page]=${page}`; }
      const response = await fetchStrapi(query);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return null;
    }
  }
  
  export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const query = `blog-posts?filters[slug][$eq]=${slug}&populate=*`;
      const response = await fetchStrapi(query);
      return response?.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }
  
  export async function getBlogCategories(): Promise<BlogCategory[] | null> {
    try {
      const response = await fetchStrapi('blog-categories');
      if (!response?.data) { return null; }
      return response.data
        .map((cat: any) => ({
          id: cat.id,
          title: cat.title || cat.name || `Kategoria ${cat.id}`,
          name: cat.name || cat.title,
          slug: cat.slug || `kategoria-${cat.id}`,
          description: cat.description
        }))
        .sort((a: BlogCategory, b: BlogCategory) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return null;
    }
  }
  
  export async function getRelatedBlogPosts(currentSlug: string, categoryId?: number, limit: number = 3): Promise<BlogPost[] | null> {
    try {
      let query = `blog-posts?sort=published:desc&populate=*&pagination[limit]=${limit}&filters[$and][0][slug][$ne]=${currentSlug}`;
      if (categoryId) {
        query += `&filters[$and][1][blog_categories][id][$eq]=${categoryId}`;
      }
      const response = await fetchStrapi(query);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching related blog posts:', error);
      return null;
    }
  }