import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-sm font-medium">{product.priceRange}</span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-4 flex-grow">
          {product.tagline}
        </p>

        <div className="flex gap-2 mt-auto">
          <Link 
            to={`/custom-design?productId=${product.id}`}
            className="flex-1 bg-primary-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-center"
          >
            Start Order
          </Link>
          <button className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
