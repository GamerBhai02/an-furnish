import { Category, Product } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Sofas', slug: 'sofas', image: 'https://picsum.photos/400/300?random=1' },
  { id: '2', name: 'Chairs', slug: 'chairs', image: 'https://picsum.photos/400/300?random=2' },
  { id: '3', name: 'Beds', slug: 'beds', image: 'https://picsum.photos/400/300?random=3' },
  { id: '4', name: 'Tables', slug: 'tables', image: 'https://picsum.photos/400/300?random=4' },
  { id: '5', name: 'Storage', slug: 'storage', image: 'https://picsum.photos/400/300?random=5' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Mid-Century Teak Sofa',
    category: 'sofas',
    tagline: 'Timeless comfort with pure teak wood frame.',
    description: 'A classic 3-seater sofa featuring premium teak wood construction and high-density foam cushioning. Custom fabrics available.',
    materials: ['Teak Wood', 'Velvet', 'High Density Foam'],
    dimensions: { w: 210, d: 90, h: 85 },
    image: 'https://picsum.photos/600/400?random=10',
    priceRange: '₹45,000 - ₹60,000',
    tags: ['modern', 'wooden', 'luxury'],
    published: true,
  },
  {
    id: 'p2',
    title: 'Industrial Lounge Chair',
    category: 'chairs',
    tagline: 'Rugged metal meets soft leather.',
    description: 'Powder-coated steel frame with genuine leather upholstery. Perfect for reading corners or office lounges.',
    materials: ['Steel', 'Leather'],
    dimensions: { w: 75, d: 80, h: 90 },
    image: 'https://picsum.photos/600/400?random=11',
    priceRange: '₹15,000 - ₹22,000',
    tags: ['industrial', 'metal', 'armchair'],
    published: true,
  },
  {
    id: 'p3',
    title: 'Minimalist Platform Bed',
    category: 'beds',
    tagline: 'Low profile, high style.',
    description: 'Japanese-inspired platform bed made from solid oak. No box spring required.',
    materials: ['Oak Wood'],
    dimensions: { w: 180, d: 200, h: 30 },
    image: 'https://picsum.photos/600/400?random=12',
    priceRange: '₹35,000 - ₹50,000',
    tags: ['minimalist', 'bed', 'wooden'],
    published: true,
  }
];

export const SYSTEM_INSTRUCTION = `You are "AN Furnish Assistant". Help users either find an existing product or create a custom design. 
Ask concise guided questions and collect the required details. 
If user chooses "browse", help them find categories and apply filters. 
If user chooses "custom", guide them through 4 steps: 1) basic style & category 2) frame & dimensions 3) material & finish 4) budget & timeline. 
After collecting answers, produce a compact summary for admin and confirm user submission. 
When unable to answer, present "Connect to human" option.
Your tone is warm, professional, and helpful.`;