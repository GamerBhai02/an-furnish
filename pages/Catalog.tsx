import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { getCategories, getProducts } from '../services/db';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';

const Catalog: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [catData, prodData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      setCategories(catData);
      setProducts(prodData);
    };
    loadData();
  }, []);

  // Filter Logic (Simplified for MVP)
  const filteredProducts = products.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        {products.length > 0 && (
          <button 
            className="md:hidden flex items-center gap-2 font-medium text-stone-600 dark:text-stone-300 mb-4"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={20} /> Filter Products
          </button>
        )}

        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 space-y-8 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white mb-4">Categories</h3>
            {categories.length === 0 ? (
              <p className="text-xs text-stone-500">No categories available.</p>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === 'all'} 
                    onChange={() => setSelectedCategory('all')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-stone-600 dark:text-stone-400">All Products</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat.slug} 
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-stone-600 dark:text-stone-400">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white capitalize">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
            </h1>
            <span className="text-stone-500 dark:text-stone-400 text-sm">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-stone-50 dark:bg-stone-800 rounded-xl">
              <p className="text-stone-500 mb-2">No products found.</p>
              <p className="text-xs text-stone-400">Check back later or contact us for custom designs.</p>
              {selectedCategory !== 'all' && (
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 text-primary-600 hover:underline"
                >
                  View All Categories
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;