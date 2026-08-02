import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import './ProductForm.css';
import api from '../services/api';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Eye
} from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'draft',
    sku: '',
    stock_quantity: '',
    minimum_order: '',
    unit: '',
    images: [],
    specifications: {}
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/v1/marketplace/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/marketplace/products/${id}/`);
      const data = response.data;
      setProduct({
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category?.id || '',
        status: data.status || 'draft',
        sku: data.sku || '',
        stock_quantity: data.stock_quantity || '',
        minimum_order: data.minimum_order || '',
        unit: data.unit || '',
        images: data.images || [],
        specifications: data.specifications || {}
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please upload valid image files');
      return;
    }
    
    setImageFiles(prev => [...prev, ...validFiles]);
    
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeExistingImage = async (imageId) => {
    try {
      await api.delete(`/api/v1/marketplace/products/${id}/images/${imageId}/`);
      setProduct(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('category', product.category);
      formData.append('status', product.status);
      if (product.sku) formData.append('sku', product.sku);
      if (product.stock_quantity) formData.append('stock_quantity', product.stock_quantity);
      if (product.minimum_order) formData.append('minimum_order', product.minimum_order);
      if (product.unit) formData.append('unit', product.unit);
      
      // Handle image uploads
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      let response;
      if (isEditing) {
        response = await api.put(`/api/v1/marketplace/products/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/api/v1/marketplace/products/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/products/${response.data.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/products" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditing ? 'Update your product details' : 'List your product on the marketplace'}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>Product {isEditing ? 'updated' : 'created'} successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-ink mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label label-required">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Industrial Sensors Kit"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label label-required">Description</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe your product in detail..."
                  className="input resize-y"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label label-required">Price (KES)</label>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="label label-required">Category</label>
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-ink mb-4">Inventory & Pricing</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={product.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., SENS-001"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={product.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Minimum Order</label>
                <input
                  type="number"
                  name="minimum_order"
                  value={product.minimum_order}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="1"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={product.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., kg, piece, box"
                  className="input"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="label label-required">Status</label>
              <select
                name="status"
                value={product.status}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-ink mb-4">Product Images</h3>
            
            {/* Existing Images */}
            {isEditing && product.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">Current Images</p>
                <div className="flex flex-wrap gap-3">
                  {product.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img 
                        src={img.image_url || img.url} 
                        alt="Product"
                        className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Image Upload */}
            <div>
              <p className="text-sm text-slate-500 mb-2">
                {isEditing ? 'Add more images' : 'Upload product images'}
              </p>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-500 mt-1">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Upload up to 5 images (JPEG, PNG, WebP). Max 5MB each.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
            
            <Link
              to="/products"
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}