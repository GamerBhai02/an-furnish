import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle } from 'lucide-react';
import { getOrderByReadableId } from '../services/db';
import { DesignRequest, OrderStatus } from '../types';
import Button from '../components/Button';

const Tracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<DesignRequest | null | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setIsLoading(true);
    try {
      const order = await getOrderByReadableId(orderId.trim());
      setResult(order || null);
    } catch (error) {
      setResult(null);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const steps = [OrderStatus.NEW, OrderStatus.CONTACTED, OrderStatus.QUOTED, OrderStatus.PRODUCTION, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
  
  const getCurrentStepIndex = (status: OrderStatus) => {
    return steps.indexOf(status);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">Track Your Order</h1>
        <p className="text-stone-600 dark:text-stone-400">Enter your Order ID (e.g., AN-2025-1234) to check progress.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Enter Order ID" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-stone-300 dark:border-stone-600 dark:bg-stone-800 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <Button size="lg" type="submit" disabled={isLoading}>{isLoading ? '...' : 'Track'}</Button>
      </form>

      {hasSearched && !result && !isLoading && (
        <div className="text-center p-8 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
          <p className="text-red-500 font-medium">Order ID not found.</p>
          <p className="text-sm text-stone-500 mt-2">Please check the ID in your confirmation email/WhatsApp.</p>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-stone-100 dark:bg-stone-900 p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">Order #{result.orderId}</h3>
              <p className="text-sm text-stone-500">Placed on {new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
              {result.status}
            </div>
          </div>

          <div className="p-6">
            {/* Timeline */}
            <div className="relative py-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-700"></div>
              {steps.map((step, idx) => {
                const currentIdx = getCurrentStepIndex(result.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative flex items-center mb-8 last:mb-0 ml-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-transparent'
                    }`}>
                      <CheckCircle size={14} fill="currentColor" />
                    </div>
                    <div className="ml-6">
                      <h4 className={`text-sm font-medium ${isCurrent ? 'text-primary-600 font-bold' : 'text-stone-600 dark:text-stone-400'}`}>
                        {step}
                      </h4>
                      {isCurrent && <p className="text-xs text-stone-400">Current Status</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes Section */}
            {result.notes.length > 0 && (
              <div className="mt-8 bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-3">Latest Updates</h4>
                <div className="space-y-2">
                  {result.notes.map((note, idx) => (
                    <div key={idx} className="text-sm text-stone-600 dark:text-stone-400 flex gap-2">
                      <Clock size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;