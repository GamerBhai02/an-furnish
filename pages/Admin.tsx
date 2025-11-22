import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDesignRequests, updateOrderStatus, getCategories, createCategory, deleteCategory, getProducts, createProduct, deleteProduct, loginAdmin, isAuthenticated as checkAuth, logoutAdmin } from '../services/db';
import { DesignRequest, OrderStatus, Category, Product } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../constants';
import Button from '../components/Button';
import { RefreshCw, X, Plus, Trash2, Layers, ShoppingBag, LayoutGrid, LogOut, Database, AlertTriangle } from 'lucide-react';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [opError, setOpError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'orders' | 'categories' | 'products'>('orders');
  
  // Data State
  const [leads, setLeads] = useState<DesignRequest[]>([]);
  const [selectedLead, setSelectedLead] = useState<DesignRequest | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', image: '' });

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', category: '', tagline: '', description: '', materials: '',
    width: '', depth: '', height: '', image: '', priceRange: '', tags: '',
  });

  useEffect(() => {
    checkAuth().then(user => {
      if (user) setIsAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setOpError('');
    try {
      setLeads(await getDesignRequests());
      setCategories(await getCategories());
      setProducts(await getProducts());
    } catch (error: any) {
      console.error("Data load error:", error);
      if (error.code === 'permission-denied') {
        setOpError("Permission Denied: Please update your Firestore Security Rules in Firebase Console.");
      } else {
        setOpError("Failed to load data.");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const success = await loginAdmin(email, password);
    if (success) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid credentials or connection error');
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const handleSeedData = async () => {
    if (!confirm("This will populate the database with initial data if empty. Continue?")) return;
    setOpError('');
    try {
      // Seed Categories
      if (categories.length === 0) {
        for (const cat of INITIAL_CATEGORIES) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...data } = cat;
          await createCategory(data);
        }
      }

      // Seed Products
      if (products.length === 0) {
        for (const prod of INITIAL_PRODUCTS) {
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...data } = prod;
          await createProduct(data);
        }
      }
      
      alert("Seeding complete!");
      loadData();
    } catch (error: any) {
      console.error("Seeding error", error);
      if (error.code === 'permission-denied') {
        setOpError("Permission Denied: Check Firestore Rules (allow write: if request.auth != null).");
      } else {
        setOpError("Failed to seed data: " + error.message);
      }
    }
  };

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!selectedLead) return;
    try {
      await updateOrderStatus(selectedLead.id, status, noteInput);
      setNoteInput('');
      await loadData();
      setSelectedLead(null);
    } catch (error: any) {
       alert("Failed to update status: " + error.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) return;
    setOpError('');
    
    try {
      const img = newCategory.image || 'https://picsum.photos/400/300?random=' + Math.floor(Math.random()*100);
      await createCategory({ ...newCategory, image: img });
      setNewCategory({ name: '', slug: '', image: '' });
      setIsAddCategoryModalOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Add Category Error:", error);
      if (error.code === 'permission-denied') {
        setOpError("Permission Denied: Update Firestore Rules to 'allow write: if request.auth != null;'");
      } else {
        setOpError("Failed to add category: " + error.message);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await loadData();
    } catch (error: any) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.category) return;
    setOpError('');

    try {
      const productData: Omit<Product, 'id'> = {
        title: newProduct.title,
        category: newProduct.category,
        tagline: newProduct.tagline || 'Custom built',
        description: newProduct.description || 'Contact details',
        materials: newProduct.materials ? newProduct.materials.split(',').map(s => s.trim()) : ['Wood'],
        dimensions: { w: Number(newProduct.width)||0, d: Number(newProduct.depth)||0, h: Number(newProduct.height)||0 },
        image: newProduct.image || 'https://picsum.photos/600/400?random=' + Math.floor(Math.random()*1000),
        priceRange: newProduct.priceRange || 'On Request',
        tags: newProduct.tags ? newProduct.tags.split(',').map(s => s.trim()) : [],
        published: true
      };
      await createProduct(productData);
      setNewProduct({ title: '', category: '', tagline: '', description: '', materials: '', width: '', depth: '', height: '', image: '', priceRange: '', tags: '' });
      setIsAddProductModalOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Add Product Error:", error);
      if (error.code === 'permission-denied') {
        setOpError("Permission Denied: Update Firestore Rules to 'allow write: if request.auth != null;'");
      } else {
        setOpError("Failed to add product: " + error.message);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      await loadData();
    } catch (error: any) {
      alert("Failed to delete: " + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-900">
        <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg w-full max-w-sm relative">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            title="Close and go back to home"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-2">AN</div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">Admin Login</h2>
            <p className="text-xs text-stone-500 mt-2">Access AN Furnish Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white"
              />
            </div>
            <Button fullWidth type="submit">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pb-20">
      {/* Admin Header */}
      <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">AN</div>
          <h1 className="font-bold text-lg text-stone-900 dark:text-white hidden sm:block">Admin Panel</h1>
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="outline" onClick={handleSeedData} title="Populate initial data if empty">
              <Database size={16} className="sm:mr-1" /> <span className="hidden sm:inline">Seed DB</span>
           </Button>
          <Button size="sm" variant="outline" onClick={loadData}><RefreshCw size={16} className="sm:mr-1"/> <span className="hidden sm:inline">Refresh</span></Button>
          <Button size="sm" variant="secondary" onClick={handleLogout}><LogOut size={16} className="sm:mr-1"/> <span className="hidden sm:inline">Logout</span></Button>
        </div>
      </header>

      {/* Error Banner */}
      {opError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
            <AlertTriangle size={16} />
            <span className="font-medium">{opError}</span>
          </div>
          <button onClick={() => setOpError('')} className="text-red-500 hover:text-red-700"><X size={16}/></button>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'categories', icon: Layers, label: 'Categories' },
            { id: 'products', icon: LayoutGrid, label: 'Products' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TABS CONTENT */}
        
        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                <h3 className="text-stone-500 text-xs uppercase font-bold">Total</h3>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{leads.length}</p>
              </div>
              <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                <h3 className="text-stone-500 text-xs uppercase font-bold">New</h3>
                <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.status === OrderStatus.NEW).length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-900 dark:text-stone-300">
                  <thead className="bg-stone-50 dark:bg-stone-900/50 text-stone-500 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/30 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                        <td className="px-6 py-4 font-mono font-medium text-primary-600">{lead.orderId}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-stone-900 dark:text-white">{lead.contact.name}</div>
                          <div className="text-xs opacity-70">{lead.contact.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            lead.status === 'New' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 opacity-70">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right"><Button size="sm" variant="ghost">View</Button></td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-stone-500">No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
               </div>
            </div>
          </>
        )}

        {/* 2. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
             <div className="flex justify-end mb-4">
               <Button onClick={() => setIsAddCategoryModalOpen(true)}><Plus size={18} className="mr-2"/> Add Category</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="group relative bg-white dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="aspect-video bg-stone-200 relative">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover"/>
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-stone-500">/{cat.slug}</p>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 3. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
             <div className="flex justify-end mb-4">
               <Button onClick={() => setIsAddProductModalOpen(true)}><Plus size={18} className="mr-2"/> Add Product</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 flex flex-col">
                    <div className="aspect-video bg-stone-200 relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover"/>
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">{p.category}</span>
                    </div>
                    <div className="p-4 flex-grow">
                      <h3 className="font-bold line-clamp-1 text-stone-900 dark:text-white">{p.title}</h3>
                      <p className="text-xs text-stone-500 mb-2">{p.priceRange}</p>
                    </div>
                    <div className="p-4 border-t border-stone-100 dark:border-stone-700 flex justify-end">
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Order Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center sticky top-0 bg-white dark:bg-stone-800 z-10">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">Order {selectedLead.orderId}</h3>
              <button onClick={() => setSelectedLead(null)} className="text-stone-500 hover:text-stone-900 dark:hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-bold text-xs uppercase text-stone-500 mb-2">Customer Details</h4>
                   <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg space-y-1 text-stone-900 dark:text-stone-200">
                      <p><span className="font-medium">Name:</span> {selectedLead.contact.name}</p>
                      <p><span className="font-medium">Phone:</span> {selectedLead.contact.phone}</p>
                      <p><span className="font-medium">Email:</span> {selectedLead.contact.email || '-'}</p>
                      <p><span className="font-medium">City:</span> {selectedLead.contact.city}</p>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-xs uppercase text-stone-500 mb-2">Order Specs</h4>
                   <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg space-y-1 text-stone-900 dark:text-stone-200">
                      <p><span className="font-medium">Type:</span> {selectedLead.flowType}</p>
                      <p><span className="font-medium">Budget:</span> {selectedLead.budget}</p>
                      {selectedLead.specifications?.style && <p><span className="font-medium">Style:</span> {selectedLead.specifications.style}</p>}
                   </div>
                </div>
              </div>

              <div>
                 <h4 className="font-bold text-xs uppercase text-stone-500 mb-2">Full Specifications</h4>
                 <pre className="text-xs bg-stone-100 dark:bg-stone-900 p-4 rounded-lg overflow-x-auto text-stone-800 dark:text-stone-300">
                   {JSON.stringify(selectedLead.specifications, null, 2)}
                 </pre>
              </div>

              <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
                 <h4 className="font-bold text-xs uppercase text-stone-500 mb-3">Update Status</h4>
                 <div className="flex flex-wrap gap-2 mb-4">
                    {Object.values(OrderStatus).map(s => (
                      <button 
                        key={s}
                        onClick={() => handleStatusUpdate(s as OrderStatus)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${selectedLead.status === s ? 'bg-primary-600 text-white border-primary-600' : 'border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-primary-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
                 <div className="flex gap-2">
                   <input 
                      placeholder="Add a note..." 
                      className="flex-grow border rounded-lg p-2 dark:bg-stone-900 dark:border-stone-600 dark:text-white"
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                   />
                   <Button onClick={() => handleStatusUpdate(selectedLead.status)}>Save</Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-stone-800 p-6 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200 shadow-xl border border-stone-200 dark:border-stone-700">
              <h3 className="font-bold text-lg mb-4 text-stone-900 dark:text-white">Add Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                 <input required className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Name" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                 <input required className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Slug" value={newCategory.slug} onChange={e => setNewCategory({...newCategory, slug: e.target.value})} />
                 <input className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Image URL (optional)" value={newCategory.image} onChange={e => setNewCategory({...newCategory, image: e.target.value})} />
                 <div className="flex justify-end gap-2 mt-4">
                   <Button type="button" variant="ghost" onClick={() => setIsAddCategoryModalOpen(false)}>Cancel</Button>
                   <Button type="submit">Create</Button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-stone-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-xl border border-stone-200 dark:border-stone-700">
              <h3 className="font-bold text-lg mb-4 text-stone-900 dark:text-white">Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                 <input required className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Title" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                 <div className="grid grid-cols-2 gap-2">
                   <select required className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                   </select>
                   <input className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Price Range" value={newProduct.priceRange} onChange={e => setNewProduct({...newProduct, priceRange: e.target.value})} />
                 </div>
                 <input className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Tagline" value={newProduct.tagline} onChange={e => setNewProduct({...newProduct, tagline: e.target.value})} />
                 <textarea className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                 <input className="w-full border p-2 rounded dark:bg-stone-700 dark:border-stone-600 dark:text-white" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                 <div className="flex justify-end gap-2 mt-4">
                   <Button type="button" variant="ghost" onClick={() => setIsAddProductModalOpen(false)}>Cancel</Button>
                   <Button type="submit">Create</Button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default Admin;