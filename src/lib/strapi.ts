// src/lib/strapi.ts - ENHANCED FOR NEW SERVICE STRUCTURE
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

// ENHANCED: Zaktualizowany interfejs Service zgodny z nową strukturą Strapi
export interface Service {
  id: number;
  title: string;
  shortDescription: string;
  icon: string;
  order: number;
  isActive: boolean;
  
  // Nowe sekcje treści zgodne ze Strapi
  whyWorthIt: string;        // "Dlaczego warto?" - Rich text
  scope: string;             // "Zakres naszej oferty" - Rich text
  benefitsFacility: string;  // "Korzyści dla placówki" - Rich text
  benefitsPatients: string;  // "Korzyści dla pacjentów" - Rich text
  collaborationModel: string; // "Model współpracy - działania" - Rich text
  collaborationSummary: string; // "Model współpracy - podsumowanie (blue box)" - Rich text
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

// ENHANCED: Funkcja do pobierania danych z Strapi z lepszym error handling
async function fetchStrapi(endpoint: string): Promise<any> {
  try {
    const fullUrl = `${STRAPI_URL}/api/${endpoint}`;
    console.log(`🔗 Fetching from: ${fullUrl}`);
    
    const response = await fetch(fullUrl, getFetchOptions());
    
    if (!response.ok) {
      console.error(`❌ Strapi API Error: ${response.status} ${response.statusText}`);
      
      // Dodatkowe szczegóły dla różnych statusów błędów
      if (response.status === 404) {
        console.error(`🔍 Endpoint not found: ${endpoint}`);
      } else if (response.status === 401) {
        console.error(`🔒 Unauthorized access - check STRAPI_TOKEN`);
      } else if (response.status === 500) {
        console.error(`🔥 Strapi server error`);
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${endpoint} - Records: ${Array.isArray(data.data) ? data.data.length : 'single'}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    
    // W development pokazuj szczegóły błędu
    if (import.meta.env.DEV) {
      console.error('🔧 Debug info:');
      console.error('  STRAPI_URL:', STRAPI_URL);
      console.error('  Endpoint:', endpoint);
      console.error('  Full URL:', `${STRAPI_URL}/api/${endpoint}`);
      console.error('  STRAPI_TOKEN present:', !!STRAPI_TOKEN);
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

// ENHANCED: Funkcja getServices dostosowana do nowej struktury
export async function getServices(): Promise<Service[]> {
  try {
    // Pobieramy wszystkie aktywne usługi, posortowane według order
    const response = await fetchStrapi('services?sort=order:asc&filters[isActive][$eq]=true');
    
    if (!response || !response.data) {
      console.warn('⚠️ No services data received from Strapi');
      return [];
    }
    
    const services = response.data as Service[];
    
    // Walidacja danych - sprawdzamy czy wymagane pola istnieją
    const validatedServices = services.map(service => ({
      ...service,
      title: service.title || 'Brak tytułu',
      shortDescription: service.shortDescription || 'Brak opisu',
      icon: service.icon || 'prevention',
      whyWorthIt: service.whyWorthIt || '',
      scope: service.scope || '',
      benefitsFacility: service.benefitsFacility || '',
      benefitsPatients: service.benefitsPatients || '',
      collaborationModel: service.collaborationModel || '',
      collaborationSummary: service.collaborationSummary || '',
      order: service.order || 999,
      isActive: service.isActive !== false
    }));
    
    console.log(`🎯 Services processed: ${validatedServices.length} valid services`);
    return validatedServices;
    
  } catch (error) {
    console.error('❌ Error in getServices:', error);
    return [];
  }
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

// src/lib/strapi.ts - BLOG FUNCTIONS FOR STRAPI V5
// Add these functions to your existing strapi.ts file

// Blog Post interface - Updated for Strapi v5 (no attributes wrapper)
export interface BlogPost {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  published?: string; // v5 sometimes uses 'published' instead of 'publishedAt'
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id?: number;
    name: string;
    bio?: string;
    avatar?: any;
  };
  category?: {
    id?: number;
    name: string;
    slug: string;
  } | string; // Sometimes just string
  featuredImage?: {
    id?: number;
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  tags?: any[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

// Get blog posts with optional limit and pagination
export async function getBlogPosts(limit?: number, page: number = 1): Promise<BlogPost[] | null> {
  try {
    let query = 'blog-posts?sort=published:desc&populate=author,category,featuredImage,tags';
    
    if (limit) {
      query += `&pagination[limit]=${limit}`;
    }
    if (page > 1) {
      query += `&pagination[page]=${page}`;
    }
    
    // Add published filter - check both published and publishedAt fields
    query += '&filters[$or][0][published][$notNull]=true&filters[$or][1][published][$notNull]=true';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return null;
  }
}

// Get single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const query = `blog-posts?filters[slug][$eq]=${slug}&populate=author,category,featuredImage,tags,seo`;
    const response = await fetchStrapi(query);
    return response?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Get blog categories
export async function getBlogCategories(): Promise<any[] | null> {
  try {
    const response = await fetchStrapi('blog-categories?sort=name:asc');
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return null;
  }
}

// Get related blog posts (by category, excluding current post)
export async function getRelatedBlogPosts(currentSlug: string, categoryId?: number, limit: number = 3): Promise<BlogPost[] | null> {
  try {
    let query = `blog-posts?sort=published:desc&populate=author,category,featuredImage&pagination[limit]=${limit}`;
    
    // Exclude current post
    query += `&filters[slug][$ne]=${currentSlug}`;
    
    // Filter by category if provided
    if (categoryId) {
      query += `&filters[category][id][$eq]=${categoryId}`;
    }
    
    // Only published posts - check both fields
    query += '&filters[$or][0][published][$notNull]=true&filters[$or][1][published][$notNull]=true';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching related blog posts:', error);
    return null;
  }
}

// Get blog posts by category
export async function getBlogPostsByCategory(categorySlug: string, limit?: number): Promise<BlogPost[] | null> {
  try {
    let query = `blog-posts?sort=published:desc&populate=category,featuredImage`;
    
    if (limit) {
      query += `&pagination[limit]=${limit}`;
    }
    
    // Filter by category slug
    query += `&filters[category][slug][$eq]=${categorySlug}`;
    
    // Only published posts
    query += '&filters[$or][0][published][$notNull]=true&filters[$or][1][published][$notNull]=true';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    return null;
  }
}

// Search blog posts
export async function searchBlogPosts(searchTerm: string, limit: number = 10): Promise<BlogPost[] | null> {
  try {
    let query = `blog-posts?sort=published:desc&populate=category,featuredImage&pagination[limit]=${limit}`;
    
    // Search in title and content
    query += `&filters[$or][0][title][$containsi]=${searchTerm}`;
    query += `&filters[$or][1][content][$containsi]=${searchTerm}`;
    query += `&filters[$or][2][excerpt][$containsi]=${searchTerm}`;
    
    // Only published posts
    query += '&filters[$and][0][$or][0][published][$notNull]=true&filters[$and][0][$or][1][published][$notNull]=true';
    
    const response = await fetchStrapi(query);
    return response?.data || null;
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return null;
  }
}

// Get blog posts count (for pagination)
export async function getBlogPostsCount(): Promise<number> {
  try {
    const response = await fetchStrapi('blog-posts?pagination[limit]=1&filters[$or][0][published][$notNull]=true&filters[$or][1][published][$notNull]=true');
    return response?.meta?.pagination?.total || 0;
  } catch (error) {
    console.error('Error fetching blog posts count:', error);
    return 0;
  }
}