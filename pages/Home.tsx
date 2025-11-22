import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PenTool, LayoutGrid, Star, Truck } from 'lucide-react';
import { getCategories } from '../services/db';
import { Category } from '../types';
import Button from '../components/Button';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Interior Background" 
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50 dark:to-stone-900"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6 animate-fade-in-up">
            Custom Furniture & Curated Designs
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6 leading-tight">
            Craft Your Perfect Space
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-300 mb-10 max-w-2xl mx-auto">
            Choose from our handcrafted catalog or collaborate with our craftsmen to build something uniquely yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog">
              <Button size="lg" className="shadow-lg shadow-primary-600/20">
                <LayoutGrid className="mr-2" size={20} /> Browse Catalog
              </Button>
            </Link>
            <Link to="/custom-design">
              <Button variant="outline" size="lg" className="bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
                <PenTool className="mr-2" size={20} /> Design Custom
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Shop by Category</h2>
            <p className="text-stone-500 dark:text-stone-400 mt-1">Find the perfect piece for every room</p>
          </div>
          {categories.length > 0 && (
            <Link to="/catalog" className="hidden sm:flex items-center text-primary-600 font-medium hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-stone-500">Loading categories...</div>
        ) : categories.length === 0 ? (
           <div className="text-center py-16 bg-stone-50 dark:bg-stone-800 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
              <p className="text-stone-500 dark:text-stone-400 mb-4">Our catalog is currently being updated with fresh designs.</p>
              <Link to="/custom-design">
                <Button variant="outline">Start a Custom Design</Button>
              </Link>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/catalog?category=${cat.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-stone-200"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <h3 className="text-white font-bold text-xl tracking-wide border-b-2 border-transparent group-hover:border-white transition-all">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features / Value Prop */}
      <section className="bg-stone-100 dark:bg-stone-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenTool size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Made to Order</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">Every piece is crafted specifically for you. Customize dimensions, fabrics, and finishes.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Premium Materials</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">We source only the finest woods, fabrics, and metals to ensure durability and style.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Direct to Home</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">Transparent pricing and delivery tracking from our workshop to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;