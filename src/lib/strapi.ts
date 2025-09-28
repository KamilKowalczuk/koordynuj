// src/lib/strapi.ts - FIXED CATEGORIES VERSION

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

const getFetchOptions = () => {
  const options: RequestInit = { headers: { 'Content-Type': 'application/json' } };
  if (STRAPI_TOKEN) { (options.headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_TOKEN}`; }
  return options;
};

// Enhanced interfaces for better type safety
export interface StrapiResponse<T> { data: T; meta?: any; }
export interface GlobalSettings { siteTitle: string; siteDescription: string; logo?: { url: string; alternativeText: string; }; primaryColor: string; contactPhone: string; contactEmail: string; companyAddress: string; }
export interface HeroSection { mainTitle: string; subTitle: string; description: string; ctaButtonText: string; ctaButtonLink: string; }
export interface Problem { id: number; title: string; description: string; icon: string; order: number; }
export interface Service { id: number; title: string; shortDescription: string; icon: string; order: number; isActive: boolean; whyWorthIt: string; scope: string; benefitsFacility: string; benefitsPatients: string; collaborationModel: string; collaborationSummary: string; }
export interface ProcessStep { id: number; title: string; description: string; details: string[]; duration: string; icon: string; order: number; }
export interface CaseStudy { title: string; subtitle: string; description: string; results: Record<string, string>; testimonial: string; clientName: string; clientPosition: string; }
export interface ContactForm { sectionTitle: string; sectionDescription: string; formTitle: string; submitButtonText: string; successMessage: string; responseTime: string; }

// ENHANCED BLOG INTERFACES
export interface BlogCategory {
  id: number;
  title: string;  // Primary field in Strapi
  name?: string;  // Fallback compatibility
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
  blog_categories?: BlogCategory[];
  featuredImage?: { url: string; alternativeText?: string; };
}

async function fetchStrapi(endpoint: string): Promise<any> {
  try {
    const fullUrl = `${STRAPI_URL}/api/${endpoint}`;
    // console.log(`🔗 Fetching from: ${fullUrl}`);
    const response = await fetch(fullUrl, getFetchOptions());
    if (!response.ok) {
      // console.error(`❌ Strapi API Error: ${response.status} ${response.statusText} for ${fullUrl}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // console.log(`✅ Successfully fetched ${endpoint}`, data);
    return data;
  } catch (error) {
    // console.error(`❌ Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function getStrapiMediaUrl(media: { url: string } | null | undefined): string | null {
  if (!media?.url) { return null; }
  if (media.url.startsWith('http')) { return media.url; }
  return `${STRAPI_URL}${media.url}`;
}

// Regular API functions (unchanged)
export async function getGlobalSettings(): Promise<GlobalSettings | null> { const response = await fetchStrapi('global-settings?populate=*'); return response?.data || null; }
export async function getHeroSection(): Promise<HeroSection | null> { const response = await fetchStrapi('hero-section'); return response?.data || null; }
export async function getProblems(): Promise<Problem[]> { const response = await fetchStrapi('problems?sort=order:asc'); return response?.data || []; }
export async function getServices(): Promise<Service[]> { const response = await fetchStrapi('services?sort=order:asc&filters[isActive][$eq]=true'); return response?.data || []; }
export async function getProcessSteps(): Promise<ProcessStep[]> { const response = await fetchStrapi('process-steps?sort=order:asc'); return response?.data || []; }
export async function getCaseStudy(): Promise<CaseStudy | null> { const response = await fetchStrapi('case-study'); return response?.data || null; }
export async function getContactForm(): Promise<ContactForm | null> { const response = await fetchStrapi('contact-form'); return response?.data || null; }

// FIXED BLOG FUNCTIONS

export async function getBlogPosts(limit?: number, page: number = 1): Promise<BlogPost[] | null> {
  try {
    // console.log(`🔍 Fetching blog posts (limit: ${limit}, page: ${page})`);
    
    // EXPLICIT POPULATION for many-to-many relationship
    let query = `blog-posts?sort=published:desc`;
    query += `&populate[blog_categories][populate]=*`;
    query += `&populate[featuredImage][populate]=*`;
    
    if (limit) { query += `&pagination[limit]=${limit}`; }
    if (page > 1) { query += `&pagination[page]=${page}`; }
    
    // console.log(`🔗 Full query: ${query}`);
    const response = await fetchStrapi(query);
    
    if (!response?.data) {
      // console.error('❌ No blog posts data received');
      return null;
    }
    
    // DEBUG: Log the first post's categories to see structure
    if (response.data[0]?.blog_categories) {
      // console.log(`🔍 Category structure debug:`, response.data[0].blog_categories);
    }
    
    // console.log(`✅ Successfully fetched ${response.data.length} blog posts with categories`);
    return response.data;
  } catch (error) {
    // console.error('❌ Error fetching blog posts:', error);
    return null;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // console.log(`🔍 Fetching blog post: ${slug}`);
    
    // SIMPLE POPULATE ALL approach for single post
    const query = `blog-posts?filters[slug][$eq]=${slug}&populate=*`;
    const response = await fetchStrapi(query);
    
    if (!response?.data?.[0]) {
      // console.error(`❌ Blog post not found for slug: ${slug}`);
      return null;
    }
    
    // console.log(`✅ Found blog post:`, response.data[0]);
    return response.data[0];
  } catch (error) {
    // console.error('❌ Error fetching blog post:', error);
    return null;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[] | null> {
  try {
    // console.log('🎯 Fetching blog categories...');
    
    // SIMPLE APPROACH - no sorting to avoid 400 error
    const response = await fetchStrapi('blog-categories');
    
    if (!response?.data) {
      // console.error('❌ No blog categories data received');
      return null;
    }
    
    // Map to our interface structure
    const sortedCategories = response.data
      .map((cat: any) => ({
        id: cat.id,
        title: cat.title || cat.name || `Kategoria ${cat.id}`, // title is primary field
        name: cat.name || cat.title, // fallback compatibility
        slug: cat.slug || `kategoria-${cat.id}`,
        description: cat.description
      }))
      .sort((a: BlogCategory, b: BlogCategory) => a.title.localeCompare(b.title));
    
    // console.log(`✅ Successfully fetched ${sortedCategories.length} categories:`, sortedCategories);
    return sortedCategories;
  } catch (error) {
    // console.error('❌ Error fetching blog categories:', error);
    return null;
  }
}

export async function getRelatedBlogPosts(currentSlug: string, categoryId?: number, limit: number = 3): Promise<BlogPost[] | null> {
  try {
    // console.log(`🔍 Fetching related posts for: ${currentSlug}, category: ${categoryId}`);
    
    // SIMPLE APPROACH with proper filtering
    let query = `blog-posts?sort=published:desc&populate=*&pagination[limit]=${limit}`;
    query += `&filters[$and][0][slug][$ne]=${currentSlug}`;
    
    if (categoryId) {
      query += `&filters[$and][1][blog_categories][id][$eq]=${categoryId}`;
    }
    
    const response = await fetchStrapi(query);
    
    if (!response?.data) {
      // console.error('❌ No related posts data received');
      return null;
    }
    
    // console.log(`✅ Found ${response.data.length} related posts`, response.data);
    return response.data;
  } catch (error) {
    // console.error('❌ Error fetching related blog posts:', error);
    return null;
  }
}

// DEBUG FUNCTION - Use this to test your Strapi setup
// export async function debugStrapiEndpoints(): Promise<void> {
//   console.log('🐛 DEBUG: Testing all possible Strapi endpoints...');
  
//   const testEndpoints = [
//     'blog-posts',
//     'blogposts', 
//     'blog_posts',
//     'blog-categories',
//     'blogcategories',
//     'blog_categories'
//   ];
  
//   for (const endpoint of testEndpoints) {
//     try {
//       const response = await fetchStrapi(endpoint);
//       console.log(`✅ ${endpoint}:`, response ? 'SUCCESS' : 'FAILED');
//       if (response?.data && Array.isArray(response.data)) {
//         console.log(`   📊 Found ${response.data.length} records`);
//         if (response.data[0]) {
//           console.log(`   🔍 Sample structure:`, Object.keys(response.data[0]));
//         }
//       }
//     } catch (error) {
//       console.log(`❌ ${endpoint}: FAILED`);
//     }
//   }
// }