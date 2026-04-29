import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Image,
  FileText,
  Calendar,
  Search,
  Filter,
  X,
  Video,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Star,
  DollarSign,
  Tag,
  Eye,
  Upload,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/Layout/DashboardLayout';

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

interface Purchase {
  id: number;
  productId: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  amount: string;
  paid: boolean;
  completed: boolean;
  purchasedAt: string;
  completedAt?: string;
}

interface ReviewReply {
  id: number;
  reviewId: number;
  sellerName: string;
  message: string;
  date: string;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });

const ProductDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'add-product' | 'buyer-details'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventory: ''
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [reviewReplies, setReviewReplies] = useState<ReviewReply[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState<Purchase | null>(null);
  const [showReviewReply, setShowReviewReply] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Load products from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('localProducts');
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load stored products:', e);
      }
    }
    // Load purchases
    const storedPurchases = localStorage.getItem('localPurchases');
    if (storedPurchases) {
      try {
        setPurchases(JSON.parse(storedPurchases));
      } catch (e) {
        console.error('Failed to load stored purchases:', e);
      }
    }
    // Load review replies
    const storedReplies = localStorage.getItem('reviewReplies');
    if (storedReplies) {
      try {
        setReviewReplies(JSON.parse(storedReplies));
      } catch (e) {
        console.error('Failed to load stored review replies:', e);
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteOrder = (purchaseId: number) => {
    const updatedPurchases = purchases.map(p =>
      p.id === purchaseId
        ? { ...p, completed: true, completedAt: new Date().toISOString() }
        : p
    );
    setPurchases(updatedPurchases);
    localStorage.setItem('localPurchases', JSON.stringify(updatedPurchases));
    toast.success('Order marked as completed!');
  };

  const handleReplyToReview = (reviewId: number) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    const reply: ReviewReply = {
      id: Date.now(),
      reviewId,
      sellerName: 'Seller', // You can make this dynamic
      message: replyText,
      date: new Date().toISOString()
    };

    const updatedReplies = [...reviewReplies, reply];
    setReviewReplies(updatedReplies);
    localStorage.setItem('reviewReplies', JSON.stringify(updatedReplies));
    setReplyText('');
    setShowReviewReply(null);
    toast.success('Reply posted successfully!');
  };

  const handleDeleteProduct = (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('localProducts', JSON.stringify(updatedProducts));

    // Also remove related purchases
    const updatedPurchases = purchases.filter(p => p.productId !== productId);
    setPurchases(updatedPurchases);
    localStorage.setItem('localPurchases', JSON.stringify(updatedPurchases));
  };

  const handleAddProduct = () => {
    console.log('handleAddProduct called with:', newProduct);
    console.log('Current products:', products);

    // Validate required fields
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in at least product name and price');
      return;
    }

    // Create new product object
    const product: Product = {
      id: Date.now(), // Use timestamp as ID for demo
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      category: newProduct.category || 'General',
      status: 'active',
      images: uploadedImages,
      videos: uploadedVideos,
      views: 0,
      created: new Date().toISOString(),
      inventory: parseInt(newProduct.inventory) || 0,
      visibleInMarketplace: true // Default to visible in marketplace
    };

    console.log('Creating product:', product);

    // Add product to the list
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);

    // Also save to localStorage so Marketplace can see it
    localStorage.setItem('localProducts', JSON.stringify(updatedProducts));

    console.log('Products after adding:', updatedProducts);

    // Reset form and close modal
    console.log('Product added successfully:', product);
    setShowProductModal(false);
    setNewProduct({ name: '', description: '', price: '', category: '', inventory: '' });
    setUploadedImages([]);
    setUploadedVideos([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
      setUploadedImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('Failed to process image upload:', error);
      toast.error('Failed to upload one or more images');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newVideos = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
      setUploadedVideos((prev) => [...prev, ...newVideos]);
    } catch (error) {
      console.error('Failed to process video upload:', error);
      toast.error('Failed to upload one or more videos');
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setUploadedVideos(uploadedVideos.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Details</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your products, add photos, videos, and product information.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {products.reduce((sum, p) => sum + p.views, 0)}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {products.filter(p => p.inventory < 10).length}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'products'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('add-product')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'add-product'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Add Product
            </button>
            <button
              onClick={() => setActiveTab('buyer-details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'buyer-details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Buyer Details ({purchases.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Products Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first product to start selling.</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {product.price}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {product.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              Stock: {product.inventory}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {product.views} views
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Purchases Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Purchase History</h4>
                      {purchases.filter(p => p.productId === product.id).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No purchases yet</p>
                      ) : (
                        <div className="space-y-2">
                          {purchases
                            .filter(p => p.productId === product.id)
                            .map(purchase => (
                              <div key={purchase.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">{purchase.buyerName}</div>
                                  <div className="text-gray-600 dark:text-gray-400">{purchase.buyerEmail}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">${purchase.amount}</div>
                                  <div className={`text-xs px-2 py-1 rounded-full ${purchase.paid
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {purchase.paid ? 'Paid' : 'Pending'}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-product' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Add New Product</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="$0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inventory</label>
                <input
                  type="number"
                  value={newProduct.inventory}
                  onChange={(e) => setNewProduct({ ...newProduct, inventory: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your product..."
              />
            </div>

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload images</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Videos</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                  <Video className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload videos</span>
                  <span className="text-xs text-gray-500 mt-1">MP4, AVI up to 50MB</span>
                </label>
              </div>

              {uploadedVideos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedVideos.map((video, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <Video className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Video {index + 1}</span>
                      <button
                        onClick={() => removeVideo(index)}
                        className="ml-auto text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Product
              </button>
              <button
                onClick={() => {
                  setNewProduct({ name: '', description: '', price: '', category: '', inventory: '' });
                  setUploadedImages([]);
                  setUploadedVideos([]);
                }}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Buyer Details Tab */}
        {activeTab === 'buyer-details' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">All Purchase Details</h3>
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Purchases Yet</h4>
                <p className="text-gray-600 dark:text-gray-400">When customers buy products, their details will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{purchase.buyerName}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{purchase.buyerEmail}</p>
                        {purchase.buyerPhone && (
                          <p className="text-gray-600 dark:text-gray-400">{purchase.buyerPhone}</p>
                        )}
                        {purchase.buyerAddress && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{purchase.buyerAddress}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">${purchase.amount}</div>
                        <div className="flex gap-2 mt-2">
                          <div className={`text-sm px-3 py-1 rounded-full font-medium ${purchase.paid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {purchase.paid ? 'Paid' : 'Pending'}
                          </div>
                          <div className={`text-sm px-3 py-1 rounded-full font-medium ${purchase.completed
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {purchase.completed ? 'Completed' : 'Processing'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(purchase.purchasedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setShowOrderDetails(purchase)}
                        className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        View Details
                      </button>
                      {!purchase.completed && (
                        <button
                          onClick={() => handleCompleteOrder(purchase.id)}
                          className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>

                    {/* Find associated product */}
                    {(() => {
                      const product = products.find(p => p.id === purchase.productId);
                      return product ? (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Purchased Product:</p>
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                            )}
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{product.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{showOrderDetails.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{showOrderDetails.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{showOrderDetails.buyerPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">${showOrderDetails.amount}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{showOrderDetails.buyerAddress || 'Not provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(showOrderDetails.purchasedAt).toLocaleString()}
                    </p>
                  </div>
                  {showOrderDetails.completedAt && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(showOrderDetails.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className={`text-sm px-3 py-1 rounded-full font-medium ${showOrderDetails.paid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {showOrderDetails.paid ? 'Paid' : 'Pending'}
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-full font-medium ${showOrderDetails.completed
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {showOrderDetails.completed ? 'Completed' : 'Processing'}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {!showOrderDetails.completed && (
                    <button
                      onClick={() => {
                        handleCompleteOrder(showOrderDetails.id);
                        setShowOrderDetails(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Complete Order
                    </button>
                  )}
                  <button
                    onClick={() => setShowOrderDetails(null)}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Reply Modal */}
        {showReviewReply && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reply to Review</h3>
                <button
                  onClick={() => setShowReviewReply(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Write your response to the customer's review..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReplyToReview(showReviewReply)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => setShowReviewReply(null)}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Product</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Use the Add Product tab to create new products with images and videos.</p>
              <button
                onClick={() => setShowProductModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductDetailsPage;
