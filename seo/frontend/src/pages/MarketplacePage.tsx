import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ShoppingBag,
  Users,
  Globe,
  Plus,
  Clock,
  DollarSign,
  Send,
  Package,
  Eye,
  X,
  Tag,
  Heart,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  videos: string[];
  views: number;
  created: string;
  inventory: number;
  visibleInMarketplace: boolean;
}


const DEMO_PRODUCT_KEYWORDS = ['test product', 'dummy item', 'mock product'];

const isDemoProduct = (product: Product): boolean => {
  const combined = `${product.name} ${product.description}`.toLowerCase();
  return DEMO_PRODUCT_KEYWORDS.some((keyword) => combined.includes(keyword));
};

const mergeUniqueProducts = (backendProducts: Product[], localProducts: Product[]) => {
  const byId = new Map<number, Product>();
  for (const product of [...backendProducts, ...localProducts]) {
    byId.set(product.id, product);
  }
  return Array.from(byId.values());
};

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('relevant');

  // Buy Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerDetails, setBuyerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProducts();

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localProducts') {
        fetchProducts(); // Refresh when local products change
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-open application modal if navigated with a specific job id
  useEffect(() => {
    // Removed since we're only showing products
  }, []);

  
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const API_URL = 'http://127.0.0.1:5001';
      let backendProducts: Product[] = [];
      
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          backendProducts = (data.products || []).filter((product: Product) => 
            product.visibleInMarketplace !== false && !isDemoProduct(product)
          );
        }
      } catch (err) {
        console.warn('Backend fetch failed:', err);
      }

      let localProductsParsed: Product[] = [];
      const localProducts = localStorage.getItem('localProducts');
      console.log('Raw localProducts from localStorage:', localProducts); // Debug log
      if (localProducts) {
        try {
          const parsed = JSON.parse(localProducts);
          console.log('Parsed local products:', parsed); // Debug log
          localProductsParsed = (parsed || []).filter((product: Product) => 
            product.visibleInMarketplace !== false && !isDemoProduct(product)
          );
          console.log('Filtered local products:', localProductsParsed); // Debug log
        } catch (e) {
          console.warn('Failed to parse local products:', e);
        }
      }

      // Show both backend and business-added local products.
      const allProducts = mergeUniqueProducts(backendProducts, localProductsParsed);
      console.log('Final products to display:', allProducts); // Debug log
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = (product: Product) => {
  setSelectedProduct(product);
  setShowBuyModal(true);
};

const handleCompletePurchase = () => {
  if (!selectedProduct || !buyerDetails.name || !buyerDetails.email) {
    toast.error('Please fill in all required fields');
    return;
  }

  // Create purchase record with buyer details
  const purchase = {
    id: Date.now(),
    productId: selectedProduct.id,
    buyerName: buyerDetails.name,
    buyerEmail: buyerDetails.email,
    buyerPhone: buyerDetails.phone,
    buyerAddress: buyerDetails.address,
    amount: selectedProduct.price,
    paid: false, // Default to pending
    purchasedAt: new Date().toISOString()
  };

  // Save to localStorage
  const existingPurchases = JSON.parse(localStorage.getItem('localPurchases') || '[]');
  const updatedPurchases = [...existingPurchases, purchase];
  localStorage.setItem('localPurchases', JSON.stringify(updatedPurchases));

  // Reset form and close modal
  setBuyerDetails({ name: '', email: '', phone: '', address: '' });
  setShowBuyModal(false);
  setSelectedProduct(null);
  toast.success(`Purchase completed for ${selectedProduct.name}!`);
};

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Technology': Globe,
      'Electronics': Globe,
      'Clothing': ShoppingBag,
      'Home & Garden': Building2,
      'Sports': Package,
      'Retail': ShoppingBag,
      'Healthcare': Users,
      'Education': Building2,
      'Finance': Briefcase,
      'default': Building2
    };
    return icons[category] || icons.default;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'from-blue-500 to-blue-600',
      'Electronics': 'from-blue-500 to-blue-600',
      'Clothing': 'from-purple-500 to-purple-600',
      'Home & Garden': 'from-green-500 to-green-600',
      'Sports': 'from-orange-500 to-orange-600',
      'Retail': 'from-purple-500 to-purple-600',
      'Healthcare': 'from-green-500 to-green-600',
      'Education': 'from-orange-500 to-orange-600',
      'Finance': 'from-indigo-500 to-indigo-600',
      'default': 'from-gray-500 to-gray-600'
    };
    return colors[category] || colors.default;
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high-low':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'relevant':
      default:
        // Keep original order or sort by views
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, searchQuery]);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Marketplace Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Buy & sell products</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {products.length} items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Items
            </button>
            <button 
              onClick={() => setSelectedCategory('Electronics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Electronics' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Electronics
            </button>
            <button 
              onClick={() => setSelectedCategory('Clothing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Clothing' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Clothing
            </button>
            <button 
              onClick={() => setSelectedCategory('Home & Garden')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Home & Garden' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Home & Garden
            </button>
            <button 
              onClick={() => setSelectedCategory('Sports')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Sports' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Sports
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedProducts.length} results
              </p>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="relevant">Sort by: Relevant</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {/* Product Image */}
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {product.inventory <= 5 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Only {product.inventory} left
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}>
                      <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">(23)</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${product.price}
                      </span>
                      {product.inventory > 0 ? (
                        <span className="text-xs text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {product.category} • Free shipping
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuyProduct(product); }}
                      disabled={product.inventory <= 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {product.inventory > 0 ? 'Buy Now' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedProducts.length === 0 && (
              <div className="col-span-full text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products available</h3>
                <p className="text-gray-500">Try selecting a different category or check back later</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Purchase</h2>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white">{selectedProduct.name}</h3>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">${selectedProduct.price}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={buyerDetails.name}
                  onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={buyerDetails.email}
                  onChange={(e) => setBuyerDetails({ ...buyerDetails, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={buyerDetails.phone}
                  onChange={(e) => setBuyerDetails({ ...buyerDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</label>
                <textarea
                  value={buyerDetails.address}
                  onChange={(e) => setBuyerDetails({ ...buyerDetails, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompletePurchase}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
