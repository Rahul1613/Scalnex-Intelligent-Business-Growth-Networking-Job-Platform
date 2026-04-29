import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  User,
  X
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

interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ReviewReply {
  id: number;
  reviewId: number;
  sellerName: string;
  message: string;
  date: string;
}

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewReplies, setReviewReplies] = useState<ReviewReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyerDetails, setBuyerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    comment: ''
  });
  const [showReviewReply, setShowReviewReply] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadProduct();
    loadProducts();
    loadReviews();
  }, [productId]);

  const loadProduct = () => {
    // Load from localStorage
    const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
    const found = localProducts.find((p: Product) => p.id === parseInt(productId || '0'));
    
    if (found) {
      setProduct(found);
      // Increment views
      found.views = (found.views || 0) + 1;
      localStorage.setItem('localProducts', JSON.stringify(localProducts));
    } else {
      // Try to fetch from backend
      loadProducts();
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const API_URL = 'http://127.0.0.1:5001';
      let allProducts: Product[] = [];
      
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          allProducts = data.products || [];
        }
      } catch (err) {
        console.warn('Backend fetch failed, using local storage only:', err);
      }

      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      allProducts = [...allProducts, ...localProducts];
      
      const found = allProducts.find((p: Product) => p.id === parseInt(productId || '0'));
      if (found) {
        setProduct(found);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadReviews = () => {
    const storedReviews = JSON.parse(localStorage.getItem('productReviews') || '[]');
    const productReviews = storedReviews.filter((r: Review) => r.productId === parseInt(productId || '0'));
    setReviews(productReviews);
    
    // Load review replies
    const storedReplies = JSON.parse(localStorage.getItem('reviewReplies') || '[]');
    setReviewReplies(storedReplies);
  };

  const handleBuyProduct = () => {
    if (!product) return;
    if (product.inventory <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    setShowBuyModal(true);
  };

  const handleCompletePurchase = () => {
    if (!product || !buyerDetails.name || !buyerDetails.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const purchase = {
      id: Date.now(),
      productId: product.id,
      buyerName: buyerDetails.name,
      buyerEmail: buyerDetails.email,
      buyerPhone: buyerDetails.phone,
      buyerAddress: buyerDetails.address,
      amount: product.price,
      paid: false,
      purchasedAt: new Date().toISOString()
    };

    const existingPurchases = JSON.parse(localStorage.getItem('localPurchases') || '[]');
    const updatedPurchases = [...existingPurchases, purchase];
    localStorage.setItem('localPurchases', JSON.stringify(updatedPurchases));

    // Update inventory
    if (product) {
      product.inventory = Math.max(0, product.inventory - quantity);
      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const productIndex = localProducts.findIndex((p: Product) => p.id === product.id);
      if (productIndex !== -1) {
        localProducts[productIndex] = product;
        localStorage.setItem('localProducts', JSON.stringify(localProducts));
        setProduct({ ...product });
      }
    }

    setBuyerDetails({ name: '', email: '', phone: '', address: '' });
    setShowBuyModal(false);
    setQuantity(1);
    toast.success(`Purchase completed for ${product.name}!`);
  };

  const handleSubmitReview = () => {
    if (!newReview.userName || !newReview.comment) {
      toast.error('Please fill in all review fields');
      return;
    }

    const review: Review = {
      id: Date.now(),
      productId: parseInt(productId || '0'),
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: Math.random() > 0.5 // Random verified status for demo
    };

    const existingReviews = JSON.parse(localStorage.getItem('productReviews') || '[]');
    const updatedReviews = [...existingReviews, review];
    localStorage.setItem('productReviews', JSON.stringify(updatedReviews));
    
    setReviews([...reviews, review]);
    setNewReview({ userName: '', rating: 5, comment: '' });
    setShowReviewModal(false);
    toast.success('Review added successfully!');
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

    const existingReplies = JSON.parse(localStorage.getItem('reviewReplies') || '[]');
    const updatedReplies = [...existingReplies, reply];
    localStorage.setItem('reviewReplies', JSON.stringify(updatedReplies));
    
    setReviewReplies(updatedReplies);
    setReplyText('');
    setShowReviewReply(null);
    toast.success('Reply posted successfully!');
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {product.images?.[selectedImageIndex] ? (
                <img 
                  src={product.images[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : product.videos?.[selectedImageIndex] ? (
                <video 
                  src={product.videos[selectedImageIndex]} 
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {product.videos?.map((video, index) => (
                <button
                  key={`video-${index}`}
                  onClick={() => setSelectedImageIndex(product.images?.length || 0 + index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === (product.images?.length || 0) + index ? 'border-purple-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Video</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ${product.price}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.inventory > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">In Stock</span>
                    <span className="text-gray-500">({product.inventory} available)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity */}
              {product.inventory > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyProduct}
                  disabled={product.inventory <= 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {product.inventory > 0 ? 'Buy Now' : 'Out of Stock'}
                </button>
                
                <div className="flex gap-3">
                  <button className="flex-1 border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Add to Wishlist
                  </button>
                  <button className="flex-1 border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">1-year warranty included</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Category: {product.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Rating Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 ${
                        star <= Math.round(averageRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <div className="text-gray-500 dark:text-gray-400 mt-1">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map((rating) => {
                  const count = reviews.filter(r => Math.round(r.rating) === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{rating} star</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{review.userName}</h4>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1,2,3,4,5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300 dark:text-gray-600'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewReply(review.id)}
                      className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
                  
                  {/* Display Replies */}
                  {reviewReplies.filter(reply => reply.reviewId === review.id).map(reply => (
                    <div key={reply.id} className="ml-8 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">{reply.sellerName}</h5>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(reply.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{reply.message}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
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
              <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ${(parseFloat(product.price) * quantity).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {quantity}</p>
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Write a Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= newReview.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        } cursor-pointer hover:scale-110 transition-transform`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review *</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
