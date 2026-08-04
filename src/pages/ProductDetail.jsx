import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ProductDetail.css';
import api from '../services/api';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  MessageCircle,
  CheckCircle,
  Clock,
  Package,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  HeartOff,
  ExternalLink,
  ThumbsUp,
  Flag,
  Users,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product data
  useEffect(() => {
    fetchProductData();
    checkWishlist();
  }, [id]);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch product details
      const productRes = await api.get(`/api/v1/marketplace/products/${id}/`);
      const productData = productRes.data;
      setProduct(productData);
      
      // Fetch reviews
      const reviewsRes = await api.get(`/api/v1/marketplace/products/${id}/reviews/`);
      setReviews(reviewsRes.data.results || reviewsRes.data || []);
      
      // Fetch related products (same category)
      if (productData.category) {
        const relatedRes = await api.get('/api/v1/marketplace/products/', {
          params: {
            category: productData.category.id,
            limit: 4,
            exclude: id
          }
        });
        setRelatedProducts(relatedRes.data.results || relatedRes.data || []);
      }
      
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product');
      
      if (err.response?.status === 404) {
        setError('Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in wishlist
  const checkWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/v1/wishlist/');
      const wishlist = response.data.results || response.data || [];
      const exists = wishlist.some(item => item.product === parseInt(id));
      setIsWishlist(exists);
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      if (isWishlist) {
        // Remove from wishlist
        const wishlistRes = await api.get('/api/v1/wishlist/');
        const wishlist = wishlistRes.data.results || wishlistRes.data || [];
        const item = wishlist.find(w => w.product === parseInt(id));
        if (item) {
          await api.delete(`/api/v1/wishlist/${item.id}/`);
        }
        setIsWishlist(false);
      } else {
        // Add to wishlist
        await api.post('/api/v1/wishlist/', { product: id });
        setIsWishlist(true);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to cart with product details
    navigate('/cart', { 
      state: { 
        product: product, 
        quantity: quantity 
      } 
    });
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (reviewRating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setSubmittingReview(true);
    setError(null);
    
    try {
      await api.post(`/api/v1/marketplace/products/${id}/reviews/`, {
        rating: reviewRating,
        comment: reviewComment
      });
      
      // Refresh reviews
      const reviewsRes = await api.get(`/api/v1/marketplace/products/${id}/reviews/`);
      setReviews(reviewsRes.data.results || reviewsRes.data || []);
      
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle quantity change
  const increaseQuantity = () => {
    if (quantity < (product?.stock_quantity || 999)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get product images
  const getProductImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images.map(img => img.image_url || img.url);
    }
    return ['/placeholder-product.jpg'];
  };

  // Get supplier display name
  const getSupplierName = () => {
    if (product?.supplier) {
      return product.supplier.business_name || product.supplier.full_name || 'Supplier';
    }
    return 'Supplier';
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  // Rating distribution
  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {});

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading product...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait while we fetch product details</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Product Not Found</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <Link 
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
          </div>
        </div>
      </>
    );
  }

  const images = getProductImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/marketplace" className="hover:text-primary-600 transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <Link to={`/categories/${product.category?.id}`} className="hover:text-primary-600 transition-colors">
            {product.category?.name || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate">{product.name}</span>
        </div>

        {/* ====== PRODUCT MAIN SECTION ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10">
          
          {/* LEFT: Images */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                
                {/* Status Badge */}
                {product.status !== 'active' && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg">
                    {product.status === 'out_of_stock' ? 'Out of Stock' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                )}
                
                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
                >
                  {isWishlist ? (
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="w-5 h-5 text-slate-400 hover:text-red-500" />
                  )}
                </button>
              </div>
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 border-t border-slate-100 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${
                        selectedImage === index 
                          ? 'border-primary-500 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            <div className="space-y-6">
              {/* Category & Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                  {product.category?.name || 'Uncategorized'}
                </span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700 ml-1">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                )}
                {product.compare_at_price && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </span>
                )}
              </div>

              {/* Product Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>SKU: {product.sku || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Min Order: {product.minimum_order || 1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Description Preview */}
              <div className="prose prose-sm max-w-none text-slate-600">
                <p className="line-clamp-3">{product.description}</p>
                <button 
                  onClick={() => setActiveTab('description')}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Read full description →
                </button>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-ink">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= (product.stock_quantity || 999)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-500">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Sold out'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'active' || product.stock_quantity <= 0}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.status !== 'active' ? 'Unavailable' : 'Add to Cart'}
                </button>
                
                <Link
                  to={`/messages/new?supplier=${product.supplier?.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Supplier
                </Link>
                
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} on TradespaceX`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span>TradeSpace Verified™</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Truck className="w-5 h-5 text-primary-500" />
                  <span>TradeSpace Express Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Award className="w-5 h-5 text-primary-500" />
                  <span>Trusted Supplier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====== TABS SECTION ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
              { id: 'supplier', label: 'Supplier Info' },
              { id: 'shipping', label: 'Shipping & Returns' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-primary-500'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-ink mb-3">Product Description</h3>
                <div className="whitespace-pre-wrap text-slate-600">
                  {product.description || 'No description available.'}
                </div>
                
                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-ink mb-3">Specifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b border-slate-100 last:border-0 py-2">
                          <span className="text-sm text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-ink">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Customer Reviews</h3>
                    <p className="text-sm text-slate-500">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} for this product
                    </p>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                  )}
                </div>

                {/* Rating Summary */}
                {reviews.length > 0 && (
                  <div className="flex flex-wrap gap-6 mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-ink">{averageRating.toFixed(1)}</div>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(averageRating) 
                                ? 'text-amber-400 fill-amber-400' 
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{reviews.length} reviews</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = ratingDistribution[rating] || 0;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 w-6">{rating}★</span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-medium text-ink mb-3">Write Your Review</h4>
                    
                    <div className="mb-3">
                      <label className="text-sm font-medium text-slate-700 block mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= reviewRating 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-sm font-medium text-slate-700 block mb-1">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows="3"
                        placeholder="Share your experience with this product..."
                        className="input"
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="mb-3 text-sm text-red-600">{error}</div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                              {review.user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-ink text-sm">
                                {review.user?.full_name || 'Anonymous'}
                              </p>
                              <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 ml-10">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Supplier Info Tab */}
            {activeTab === 'supplier' && product.supplier && (
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">About the Supplier</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                        {getSupplierName().charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-ink">{getSupplierName()}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          <span>{product.supplier.total_products || 0} products</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{product.supplier.rating || 'New'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {product.supplier.description && (
                      <p className="text-sm text-slate-600">{product.supplier.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {product.supplier.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{product.supplier.location}</span>
                        </div>
                      )}
                      {product.supplier.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{product.supplier.phone}</span>
                        </div>
                      )}
                      {product.supplier.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{product.supplier.email}</span>
                        </div>
                      )}
                      {product.supplier.website && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <a href={product.supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            {product.supplier.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h5 className="font-medium text-ink mb-3">Supplier Verification</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Identity Verified</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Business Registered</span>
                        {product.supplier.is_business_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">TradeSpace Verified™</span>
                        {product.supplier.is_tradespace_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <Link
                        to={`/suppliers/${product.supplier.id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        View Supplier Profile
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold text-ink mb-4">Shipping & Returns</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-ink">Shipping Options</h4>
                        <p className="text-sm text-slate-600">
                          TradeSpace Express: Fast, tracked delivery in 3-5 business days
                        </p>
                        <p className="text-sm text-slate-600">
                          Standard Shipping: Reliable delivery in 7-14 business days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-ink">Shipping From</h4>
                        <p className="text-sm text-slate-600">
                          {product.supplier?.location || 'Supplier location'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-ink">Processing Time</h4>
                        <p className="text-sm text-slate-600">
                          Orders are processed within 1-2 business days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-ink">Return Policy</h4>
                        <p className="text-sm text-slate-600">
                          Returns accepted within 14 days of delivery
                        </p>
                        <p className="text-sm text-slate-600">
                          Full refund or exchange for defective products
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====== RELATED PRODUCTS ====== */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  to={`/products/${related.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    {related.images && related.images.length > 0 ? (
                      <img 
                        src={related.images[0].image_url || related.images[0].url} 
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-ink line-clamp-1">{related.name}</h4>
                    <p className="text-primary-600 font-bold text-sm mt-1">
                      {formatCurrency(related.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}