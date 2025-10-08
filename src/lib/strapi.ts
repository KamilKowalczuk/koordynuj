// src/lib/strapi.ts
// ENTERPRISE-GRADE STRAPI API CLIENT
// Pełna integracja z @strapi/plugin-seo + Enhanced TypeScript interfaces

import type { IconKey, Service } from '../types';

// ========================================
// KONFIGURACJA
// ========================================

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

const getFetchOptions = () => {
  const options: RequestInit = { headers: { 'Content-Type': 'application/json' } };
  if (STRAPI_TOKEN) { 
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_TOKEN}`; 
  }
  return options;
};

// ========================================
// ENHANCED SEO INTERFACES
// ========================================

/**
 * Strapi Image with full metadata including dimensions and formats
 */
export interface StrapiImage {
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    thumbnail?: { url: string; width: number; height: number };
  };
  mime?: string;
  size?: number;
}

/**
 * Open Graph metadata (Facebook, LinkedIn)
 */
export interface OpenGraph {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: StrapiImage;
  ogUrl?: string;
  ogType?: string;
}

/**
 * Twitter Card metadata
 */
export interface TwitterCard {
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: StrapiImage;
}

/**
 * Structured Data (Schema.org JSON-LD)
 */
export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Complete SEO Data from @strapi/plugin-seo
 */
export interface SeoData {
  // Basic SEO
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: StrapiImage;
  
  // Open Graph
  openGraph?: OpenGraph;
  
  // Twitter Card (optional - jeśli używasz w Strapi)
  twitterCard?: TwitterCard;
  
  // Advanced SEO
  keywords?: string;
  metaRobots?: string;
  metaViewport?: string;
  canonicalURL?: string;
  
  // Structured Data
  structuredData?: StructuredData | string; // może być string lub object
}

// ========================================
// CORE INTERFACES
// ========================================

export interface StrapiResponse<T> { 
  data: T; 
  meta?: any; 
}

export interface GlobalSettings { 
  siteTitle: string; 
  siteDescription: string; 
  logo?: StrapiImage; 
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

export interface BlogCategory { 
  id: number; 
  title: string; 
  name?: string; 
  slug?: string; 
  description?: string; 
}

/**
 * Blog Post with full SEO integration
 */
export interface BlogPost { 
  id: number; 
  documentId?: string;
  title: string; 
  slug: string; 
  content?: string; 
  excerpt?: string; 
  published: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  blog_categories?: BlogCategory[]; 
  featuredImage?: StrapiImage;
  seo?: SeoData;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Konwertuje URL media Strapi na pełny URL
 * Obsługuje również responsive formats
 * @param media - Strapi image object
 * @param format - Optional format (large, medium, small, thumbnail)
 * @returns Full URL or null
 */
export function getStrapiMediaUrl(
  media: StrapiImage | { url: string } | null | undefined, 
  format?: 'large' | 'medium' | 'small' | 'thumbnail'
): string | null {
  if (!media?.url) { return null; }
  
  // Sprawdź czy media ma formats (StrapiImage)
  const strapiImage = media as StrapiImage;
  
  // Jeśli podano format i istnieje w media.formats
  if (format && strapiImage.formats?.[format]) {
    const formatUrl = strapiImage.formats[format].url;
    if (formatUrl.startsWith('http')) { return formatUrl; }
    return `${STRAPI_URL}${formatUrl}`;
  }
  
  // Zwróć główny URL
  if (media.url.startsWith('http')) { return media.url; }
  return `${STRAPI_URL}${media.url}`;
}

/**
 * Pobiera wymiary obrazu dla Open Graph (preferuje format large)
 * @param media - Strapi image object
 * @returns Object with width and height
 */
export function getImageDimensions(media: StrapiImage | null | undefined): {
  width: number;
  height: number;
} {
  const defaultDimensions = { width: 1200, height: 630 };
  
  if (!media) return defaultDimensions;
  
  // Preferuj format 'large' dla OG images
  if (media.formats?.large) {
    return {
      width: media.formats.large.width,
      height: media.formats.large.height
    };
  }
  
  // Użyj głównych wymiarów jeśli dostępne
  if (media.width && media.height) {
    return { width: media.width, height: media.height };
  }
  
  return defaultDimensions;
}

/**
 * Pobiera najlepszy format obrazu dla danego use case
 * @param media - Strapi image object
 * @param useCase - 'og' | 'thumbnail' | 'full'
 * @returns Best URL for use case
 */
export function getBestImageFormat(
  media: StrapiImage | null | undefined,
  useCase: 'og' | 'thumbnail' | 'full' = 'full'
): string | null {
  if (!media) return null;
  
  switch (useCase) {
    case 'og':
      // Open Graph preferuje large lub oryginał
      return getStrapiMediaUrl(media, 'large') || getStrapiMediaUrl(media);
    case 'thumbnail':
      // Thumbnail dla kart
      return getStrapiMediaUrl(media, 'small') || getStrapiMediaUrl(media, 'thumbnail') || getStrapiMediaUrl(media);
    case 'full':
    default:
      // Pełny rozmiar
      return getStrapiMediaUrl(media);
  }
}

/**
 * Uniwersalna funkcja fetch z error handling
 */
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

// ========================================
// SEO API FUNCTIONS
// ========================================

/**
 * Pobiera dane SEO dla strony głównej
 */
export async function getSeoHome(): Promise<SeoData | null> {
  try {
    const response = await fetchStrapi(
      'seo-home?populate[seo][populate][metaImage][populate]=*&populate[seo][populate][openGraph][populate][ogImage][populate]=*'
    );
    return response?.data?.seo || null;
  } catch (error) {
    console.error('Error fetching SEO home:', error);
    return null;
  }
}

/**
 * Pobiera dane SEO dla listy blogów
 */
export async function getSeoBlogList(): Promise<SeoData | null> {
  try {
    const response = await fetchStrapi(
      'seo-blog-list?populate[seo][populate][metaImage][populate]=*&populate[seo][populate][openGraph][populate][ogImage][populate]=*'
    );
    return response?.data?.seo || null;
  } catch (error) {
    console.error('Error fetching SEO blog list:', error);
    return null;
  }
}

// ========================================
// CONTENT API FUNCTIONS
// ========================================

/**
 * Pobiera globalne ustawienia strony (Single Type)
 * UWAGA: Wymaga published Single Type i find permission dla Public role
 */
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    // Deep populate dla media (logo)
    const response = await fetchStrapi('global-setting?populate');
    
    // Debug tylko w development
    if (import.meta.env.DEV) {
    }
    
    // Walidacja response
    if (!response || !response.data) {
      return getFallbackGlobalSettings();
    }
    
    return response.data;
    
  } catch (error) {
    return getFallbackGlobalSettings();
  }
}

/**
 * Fallback settings dla development (gdy Strapi nie odpowiada)
 */
function getFallbackGlobalSettings(): GlobalSettings {
  if (import.meta.env.DEV) {
    console.log('⚠️ Using fallback Global Settings');
  }
  
  return {
    siteTitle: 'Koordynuj Zdrowie',
    siteDescription: 'Zarządzanie medycyną. Zredukowane do perfekcji.',
    logo: undefined,
    primaryColor: '#00A9E0',
    contactPhone: '+48 535 604 904',
    contactEmail: 'kontakt@koordynujzdrowie.pl',
    companyAddress: 'Warszawa, Polska'
  };
}

/**
 * Pobiera dane sekcji Hero
 */
export async function getHeroSection(): Promise<HeroSection | null> { 
  const response = await fetchStrapi('hero-section'); 
  return response?.data || null; 
}

/**
 * Pobiera listę problemów (sortowane po order)
 */
export async function getProblems(): Promise<Problem[]> { 
  const response = await fetchStrapi('problems?sort=order:asc'); 
  return response?.data || []; 
}

/**
 * Pobiera aktywne usługi (sortowane po order)
 */
export async function getServices(): Promise<Service[]> {
  const response = await fetchStrapi('services?sort=order:asc&filters[isActive][$eq]=true');
  const services = response?.data || [];
  
  return services.map((service: Service) => {
    let cleanText = service.shortDescription?.replace(/<[^>]*>?/gm, '') || '';
    return {
      ...service,
      shortDescription: `<p>${cleanText.trim()}</p>`
    };
  });
}

/**
 * Pobiera kroki procesu (sortowane po order)
 */
export async function getProcessSteps(): Promise<ProcessStep[]> { 
  const response = await fetchStrapi('process-steps?sort=order:asc'); 
  return response?.data || []; 
}

/**
 * Pobiera case study
 */
export async function getCaseStudy(): Promise<CaseStudy | null> { 
  const response = await fetchStrapi('case-study'); 
  return response?.data || null; 
}

/**
 * Pobiera ustawienia formularza kontaktowego
 */
export async function getContactForm(): Promise<ContactForm | null> { 
  const response = await fetchStrapi('contact-form'); 
  return response?.data || null; 
}

// ========================================
// BLOG API FUNCTIONS
// ========================================

/**
 * Pobiera listę postów blogowych z pełnym SEO
 * @param limit - Limit postów per page
 * @param page - Numer strony (1-indexed)
 * @returns Array of blog posts or null
 */
export async function getBlogPosts(limit?: number, page: number = 1): Promise<BlogPost[] | null> {
  try {
    let query = 'blog-posts?sort=published:desc';
    query += '&populate[blog_categories][populate]=*';
    query += '&populate[featuredImage][populate]=*';
    query += '&populate[seo][populate][metaImage][populate]=*';
    query += '&populate[seo][populate][openGraph][populate][ogImage][populate]=*';
    
    if (limit) { 
      query += `&pagination[limit]=${limit}`; 
    }
    if (page > 1) { 
      query += `&pagination[page]=${page}`; 
    }
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return null;
  }
}

/**
 * Pobiera pojedynczy post blogowy po slug z pełnym SEO
 * @param slug - URL slug of the blog post
 * @returns Blog post or null
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    let query = `blog-posts?filters[slug][$eq]=${slug}`;
    query += '&populate[blog_categories][populate]=*';
    query += '&populate[featuredImage][populate]=*';
    query += '&populate[seo][populate][metaImage][populate]=*';
    query += '&populate[seo][populate][openGraph][populate][ogImage][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Pobiera kategorie blogowe
 * @returns Array of categories or null
 */
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

/**
 * Pobiera powiązane posty blogowe
 * @param currentSlug - Slug of current post to exclude
 * @param categoryId - Optional category ID to filter by
 * @param limit - Number of related posts to return
 * @returns Array of related posts or null
 */
export async function getRelatedBlogPosts(
  currentSlug: string, 
  categoryId?: number, 
  limit: number = 3
): Promise<BlogPost[] | null> {
  try {
    let query = 'blog-posts?sort=published:desc';
    query += `&pagination[limit]=${limit}`;
    query += `&filters[$and][0][slug][$ne]=${currentSlug}`;
    
    if (categoryId) {
      query += `&filters[$and][1][blog_categories][id][$eq]=${categoryId}`;
    }
    
    query += '&populate[blog_categories][populate]=*';
    query += '&populate[featuredImage][populate]=*';
    query += '&populate[seo][populate][metaImage][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching related blog posts:', error);
    return null;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Sprawdza czy Strapi jest dostępne
 * @returns true jeśli API odpowiada
 */
export async function checkStrapiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${STRAPI_URL}/_health`, getFetchOptions());
    return response.ok;
  } catch (error) {
    console.error('Strapi health check failed:', error);
    return false;
  }
}

/**
 * Pobiera wszystkie posty z danej kategorii
 * @param categorySlug - Slug kategorii
 * @returns Array of posts or null
 */
export async function getBlogPostsByCategory(categorySlug: string): Promise<BlogPost[] | null> {
  try {
    let query = 'blog-posts?sort=published:desc';
    query += `&filters[blog_categories][slug][$eq]=${categorySlug}`;
    query += '&populate[blog_categories][populate]=*';
    query += '&populate[featuredImage][populate]=*';
    query += '&populate[seo][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return null;
  }
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date in Polish
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pl-PL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Create excerpt from HTML content
 * @param content - HTML content
 * @param length - Max length of excerpt
 * @returns Plain text excerpt
 */
export function createExcerpt(content: string, length: number = 150): string {
  if (!content) return "";
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > length 
    ? plainText.substring(0, length) + '...' 
    : plainText;
}

// ========================================
// EXPORTS
// ========================================

export default {
  // SEO
  getSeoHome,
  getSeoBlogList,
  
  // Content
  getGlobalSettings,
  getHeroSection,
  getProblems,
  getServices,
  getProcessSteps,
  getCaseStudy,
  getContactForm,
  
  // Blog
  getBlogPosts,
  getBlogPost,
  getBlogCategories,
  getRelatedBlogPosts,
  getBlogPostsByCategory,
  
  // Helpers
  getStrapiMediaUrl,
  getImageDimensions,
  getBestImageFormat,
  formatDate,
  createExcerpt,
  checkStrapiHealth,
};


//Pliki regulaminów

export interface LegalDocument {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  documentType: 'polityka-prywatnosci' | 'regulamin' | 'rodo' | 'polityka-cookies';
  lastUpdated: string;
  isActive: boolean;
  order?: number;
  seo?: SeoData;
}

/**
 * Pobiera wszystkie aktywne dokumenty prawne (sortowane po order)
 */
export async function getLegalDocuments(): Promise<LegalDocument[] | null> {
  try {
    let query = 'legal-documents?sort=order:asc&filters[isActive][$eq]=true';
    query += '&populate[seo][populate][metaImage][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching legal documents:', error);
    return null;
  }
}

/**
 * Pobiera pojedynczy dokument prawny po slug
 */
export async function getLegalDocument(slug: string): Promise<LegalDocument | null> {
  try {
    let query = `legal-documents?filters[slug][$eq]=${slug}`;
    query += '&populate[seo][populate][metaImage][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching legal document:', error);
    return null;
  }
}

/**
 * Pobiera dokument po typie (np. polityka-prywatnosci)
 */
export async function getLegalDocumentByType(
  documentType: string
): Promise<LegalDocument | null> {
  try {
    let query = `legal-documents?filters[documentType][$eq]=${documentType}&filters[isActive][$eq]=true`;
    query += '&populate[seo][populate][metaImage][populate]=*';
    
    const response = await fetchStrapi(query);
    return response?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching legal document by type:', error);
    return null;
  }
}