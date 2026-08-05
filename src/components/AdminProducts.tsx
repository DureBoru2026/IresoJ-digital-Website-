import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, ShoppingBag, Terminal, Laptop, Upload } from 'lucide-react';
import { ProductService } from '../types';
import { formatETB } from '../utils';

interface AdminProductsProps {
  products: ProductService[];
  onAddProduct: (product: Omit<ProductService, 'id'>) => Promise<boolean>;
  onUpdateProduct: (id: string, product: Partial<ProductService>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
}

export default function AdminProducts({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminProductsProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'maintenance' | 'print_publish' | 'training' | 'sales'>('maintenance');
  const [type, setType] = useState<'physical' | 'digital' | 'service'>('service');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState<string>('');
  const [specifications, setSpecifications] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer es-digital-csc-admin-secret-session-token'
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success && data.fileUrl) {
        setImageUrl(data.fileUrl);
        setMessage({ text: 'Image uploaded successfully from local device!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: data.error || 'Failed to upload image.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error uploading file to local server.', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setIsEditing(true);
    
    // Reset Form
    setTitle('');
    setCategory('maintenance');
    setType('service');
    setDescription('');
    setPrice(0);
    setImageUrl('https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80');
    setStock('');
    setSpecifications('');
  };

  const handleStartEdit = (product: ProductService) => {
    setEditingId(product.id);
    setIsEditing(true);

    setTitle(product.title);
    setCategory(product.category);
    setType(product.type);
    setDescription(product.description);
    setPrice(product.price);
    setImageUrl(product.imageUrl);
    setStock(product.stock !== null ? product.stock.toString() : '');
    setSpecifications(product.specifications || '');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!title.trim() || price <= 0 || !imageUrl.trim() || !description.trim()) {
      setMessage({ text: 'Please fill in all mandatory fields with valid values.', type: 'error' });
      setLoading(false);
      return;
    }

    const parsedStock = type === 'physical' && stock.trim() ? parseInt(stock) : null;
    const payload = {
      title,
      category,
      type,
      description,
      price: Number(price),
      imageUrl,
      stock: parsedStock,
      specifications: specifications.trim() || undefined,
    };

    try {
      let success = false;
      if (editingId) {
        success = await onUpdateProduct(editingId, payload);
      } else {
        success = await onAddProduct(payload);
      }

      if (success) {
        setMessage({
          text: editingId ? 'Product updated successfully.' : 'Product added successfully.',
          type: 'success',
        });
        setTimeout(() => {
          setIsEditing(false);
          setEditingId(null);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ text: 'Operation failed. Please try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error interacting with server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setLoading(true);
    try {
      const success = await onDeleteProduct(id);
      if (success) {
        setMessage({ text: 'Item deleted successfully.', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Deletion failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to communicate deletion.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-products-subtab" className="space-y-6">
      
      {/* Tab Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">
            Catalog Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, and remove repair services, print offers, training modules, and hardware/leather products.
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={handleStartAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm shadow-blue-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editor Modal/Panel Overlay */}
      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner animate-in fade-in duration-200">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
            {editingId ? 'Edit Catalog Product / Service' : 'Add New Catalog Product / Service'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Item Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Refurbished Lenovo ThinkPad T480 or Basic Computer Training"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price (ETB) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="maintenance">Computer & Electronics Maintenance</option>
                <option value="print_publish">Print & Publish</option>
                <option value="training">Short Basic Training</option>
                <option value="sales">Sales Section (Salle)</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Item Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="service">Service (Diagnostic/Maintenance/Printing)</option>
                <option value="physical">Physical Product (Hardware/Leather goods)</option>
                <option value="digital">Digital Product (Logo design/Word Resume Template)</option>
              </select>
            </div>

            {/* Stock for physical */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${type === 'physical' ? 'text-slate-500' : 'text-slate-300'}`}>
                Physical Stock Quantity
              </label>
              <input
                type="number"
                disabled={type !== 'physical'}
                placeholder={type === 'physical' ? 'e.g. 15' : 'N/A (Services)'}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Image URL & Upload */}
            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cover Image / File Upload</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-1">Paste Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-1">Or Upload from Device</label>
                  <div className="relative flex items-center justify-center w-full h-[42px] bg-white border border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pointer-events-none">
                      <Upload className={`w-4 h-4 text-slate-400 ${uploadingImage ? 'animate-bounce' : ''}`} />
                      <span>{uploadingImage ? 'Uploading file...' : 'Choose image / video / file'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {imageUrl && (
                <div className="mt-2 p-2 bg-slate-100/60 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono">Current path:</span>
                  <span className="text-xs font-bold text-blue-600 truncate max-w-md">{imageUrl}</span>
                  {imageUrl.startsWith('/uploads') && (
                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black">LOCAL FILE</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detailed Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the service offerings or physical specs in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Specifications for high-end items */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Technical Specs (Separate with pipe symbol '|')</label>
              <input
                type="text"
                placeholder="e.g. Full-Grain Ethiopian Leather | Handmade stitches | Dimensions: 11cm x 9cm"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setMessage(null);
              }}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      ) : (
        /* Catalog Items List */
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55/60 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Preview & Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-mono text-xs">
                      No products found in the catalog.
                    </td>
                  </tr>
                ) : (
                  products.filter(p => p && p.title).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 flex items-center space-x-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{p.id}</span>
                        </div>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-medium">
                          {p.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 capitalize text-xs font-mono text-slate-500">
                        {p.type}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{formatETB(p.price)}</span>
                      </td>
                      <td className="p-4">
                        {p.type === 'physical' ? (
                          p.stock !== null && p.stock > 0 ? (
                            <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                              {p.stock} units
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                              Out of stock
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">Unlimited (Service)</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Accidental Deletion Shield</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this catalog item? This action is permanent and cannot be undone. Please confirm to proceed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-200 transition-all cursor-pointer"
              >
                Yes, Delete Permanent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
