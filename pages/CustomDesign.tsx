import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Upload, Info } from 'lucide-react';
import { getProductById, createDesignRequest, getCategories } from '../services/db';
import { FlowType, Product, Category } from '../types';
import Button from '../components/Button';

const CustomDesign: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('productId');
  const [prefilledProduct, setPrefilledProduct] = useState<Product | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    style: '',
    materials: [] as string[],
    dimensions: { w: '', d: '', h: '' },
    finishes: '',
    budget: '',
    timeline: 'normal',
    notes: '',
    contact: {
      name: '',
      phone: '',
      email: '',
      city: '',
    },
    consent: true
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        const product = await getProductById(productId);
        if (product) {
          setPrefilledProduct(product);
          setFormData(prev => ({
            ...prev,
            category: product.category,
            style: product.tags[0] || '',
            notes: `Based on product: ${product.title}`,
          }));
        }
      };
      loadProduct();
    }
  }, [productId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (dim: 'w' | 'd' | 'h', val: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dim]: val }
    }));
  };

  const handleContactChange = (field: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.contact.name || !formData.contact.phone || !formData.consent) return;
    
    setIsSubmitting(true);
    
    // FIX: Firestore does not support 'undefined'. We must use 'null' for optional fields.
    const requestData = {
      flowType: productId ? FlowType.PREDEFINED : FlowType.CUSTOM,
      productId: productId || null, 
      productName: prefilledProduct?.title || null,
      category: formData.category,
      specifications: {
        style: formData.style,
        materials: formData.materials,
        dimensions: formData.dimensions,
        finishes: formData.finishes,
        notes: formData.notes
      },
      contact: formData.contact,
      budget: formData.budget,
      timeline: formData.timeline
    };

    try {
      const result = await createDesignRequest(requestData);
      setGeneratedOrderId(result.orderId);
      setIsSuccess(true);
    } catch (e: any) {
      console.error("Failed to submit design", e);
      if (e.code === 'permission-denied') {
        alert("Database Permission Error: The server rejected the request.\n\nAdmin: Please go to Firebase Console -> Firestore -> Rules and ensure you allow 'create' access for the 'orders' collection.");
      } else if (e.message && e.message.includes("Invalid data")) {
         alert("Error: Invalid data submitted (Backend rejected undefined fields). Please try again.");
      } else {
        alert("Something went wrong: " + e.message + "\nPlease try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Request Received!</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            Your Order ID is <span className="font-mono font-bold text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">{generatedOrderId}</span>
          </p>
          <div className="text-sm text-stone-500 mb-8 bg-stone-50 dark:bg-stone-900 p-4 rounded-lg">
            We have sent a confirmation to your WhatsApp/Email. Our craftsmen will review your details and contact you shortly.
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/tracking')}>Track Status</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>Back Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
          {prefilledProduct ? `Order: ${prefilledProduct.title}` : 'Design Your Custom Furniture'}
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Step {step} of 4: {step === 1 ? 'Basics' : step === 2 ? 'Details' : step === 3 ? 'Budget' : 'Contact'}
        </p>
        <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 md:p-8">
        
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Furniture Category</label>
              <select 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full rounded-lg border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 p-2.5 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                <option value="other">Other / Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Style Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Modern', 'Traditional', 'Industrial', 'Minimalist'].map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleChange('style', style)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.style === style 
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                        : 'border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dimensions & Materials */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Dimensions (Approx. cm)
                <span className="ml-2 inline-flex items-center text-xs text-stone-400"><Info size={12} className="mr-1"/> W x D x H</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input 
                  type="number" placeholder="Width" 
                  value={formData.dimensions.w} onChange={(e) => handleDimensionChange('w', e.target.value)}
                  className="rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
                <input 
                  type="number" placeholder="Depth"
                  value={formData.dimensions.d} onChange={(e) => handleDimensionChange('d', e.target.value)}
                  className="rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
                <input 
                  type="number" placeholder="Height"
                  value={formData.dimensions.h} onChange={(e) => handleDimensionChange('h', e.target.value)}
                  className="rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Material / Finish Notes</label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="E.g., Teak wood frame with emerald green velvet fabric..."
                className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5 focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>
             <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Upload Reference Image (Optional)</label>
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg p-6 flex flex-col items-center text-center text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                <Upload size={24} className="mb-2"/>
                <span className="text-sm">Click to upload or drag and drop</span>
                <input type="file" className="hidden" /> 
                {/* Note: File upload visualization omitted for MVP code simplicity, assume file input works */}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Estimated Budget</label>
              <input 
                type="text" 
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="e.g. ₹20,000 - ₹30,000"
                className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Timeline Urgency</label>
              <div className="flex gap-4">
                {['Normal', 'Urgent', 'Relaxed'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="timeline"
                      checked={formData.timeline === t.toLowerCase()}
                      onChange={() => handleChange('timeline', t.toLowerCase())}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-stone-700 dark:text-stone-300">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Name *</label>
                <input 
                  type="text" required
                  value={formData.contact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phone (WhatsApp) *</label>
                <input 
                  type="tel" required
                  value={formData.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
                <input 
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
                <input 
                  type="text"
                  value={formData.contact.city}
                  onChange={(e) => handleContactChange('city', e.target.value)}
                  className="w-full rounded-lg border-stone-300 dark:border-stone-600 dark:bg-stone-700 p-2.5"
                />
              </div>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg text-sm border border-stone-100 dark:border-stone-700">
               <h4 className="font-bold mb-2">Request Summary</h4>
               <p>{formData.category || 'Custom'} {formData.style ? `- ${formData.style}` : ''}</p>
               <p className="text-stone-500">Approx: {formData.dimensions.w || '?'}x{formData.dimensions.d || '?'}x{formData.dimensions.h || '?'} cm</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.consent}
                onChange={(e) => handleChange('consent', e.target.checked)}
                className="mt-1 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm text-stone-600 dark:text-stone-400">
                I agree to share my details for the purpose of this order. I understand AN Furnish will contact me via WhatsApp/Phone.
              </span>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between pt-6 border-t border-stone-200 dark:border-stone-700">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} className="mr-1" /> Back
            </Button>
          ) : (
            <div></div> // Spacer
          )}
          
          {step < 4 ? (
             <Button onClick={() => setStep(step + 1)}>
               Next <ChevronRight size={18} className="ml-1" />
             </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.consent || !formData.contact.name || !formData.contact.phone}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDesign;