import React, { useState } from 'react';
import { Upload, FileVideo, FileImage, FileText, FileCode, Plus, Trash2, Download, Package, DollarSign, Tag, Check, X, AlertCircle, Filter, Search, CheckSquare, Square, Layers } from 'lucide-react';
import { DigitalAsset } from '../types';

interface AdminAssetsProps {
  assets: DigitalAsset[];
  onAddAsset: (asset: Omit<DigitalAsset, 'id' | 'date' | 'downloadCount'>) => Promise<boolean>;
  onDeleteAsset: (id: string) => Promise<boolean>;
}

const CATEGORY_OPTIONS = [
  'Software & Utilities',
  'Graphics & Templates',
  'Repair Manuals & Guides',
  'Course Media',
  'Business Documents',
  'General'
];

export default function AdminAssets({ assets, onAddAsset, onDeleteAsset }: AdminAssetsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Bulk selection state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Category & search filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    type: 'template' as DigitalAsset['type'],
    category: 'Software & Utilities',
    tagsInput: '',
    priceType: 'free' as DigitalAsset['priceType'],
    price: 0,
    fileUrl: '',
    description: ''
  });

  const getIcon = (type: DigitalAsset['type']) => {
    switch (type) {
      case 'video': return <FileVideo className="w-5 h-5 text-purple-500" />;
      case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'template': return <FileCode className="w-5 h-5 text-amber-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'ppt': return <Package className="w-5 h-5 text-orange-500" />;
      case 'word': return <FileText className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const tags = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const success = await onAddAsset({
        title: formData.title,
        type: formData.type,
        category: formData.category,
        tags: tags.length > 0 ? tags : [formData.category],
        priceType: formData.priceType,
        price: formData.price,
        fileUrl: formData.fileUrl,
        description: formData.description
      });

      if (success) {
        setMessage({ text: 'Asset added successfully with category tagging!', type: 'success' });
        setFormData({
          title: '',
          type: 'template',
          category: 'Software & Utilities',
          tagsInput: '',
          priceType: 'free',
          price: 0,
          fileUrl: '',
          description: ''
        });
        setShowAddForm(false);
      } else {
        setMessage({ text: 'Failed to add asset.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    if (!asset || !asset.title) return false;
    const matchesCategory = selectedCategoryFilter === 'all' || asset.category === selectedCategoryFilter;
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.tags && asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map(a => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedAssetIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedAssetIds.length} selected asset(s)?`)) return;

    setBulkDeleting(true);
    let successCount = 0;

    for (const id of selectedAssetIds) {
      const ok = await onDeleteAsset(id);
      if (ok) successCount++;
    }

    setMessage({ 
      text: `Successfully deleted ${successCount} asset(s) in bulk.`, 
      type: successCount > 0 ? 'success' : 'error' 
    });
    setSelectedAssetIds([]);
    setBulkDeleting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-500" />
            Digital Assets Store & File Manager
          </h2>
          <p className="text-sm text-slate-500">Manage downloadable videos, templates, repair manuals, and documents with category tagging.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedAssetIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedAssetIds.length})`}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-200 cursor-pointer"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Cancel' : 'Add New Asset'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Filtering and Tag Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by title, category, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({assets.length})
          </button>
          {CATEGORY_OPTIONS.map(cat => {
            const count = assets.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#0EA5E9] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Asset Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Modern Resume Template"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Asset Category Tag</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm font-medium"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Asset Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as DigitalAsset['type'] })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm"
                >
                  <option value="template">Template</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="word">Word Document</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Custom Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. resume, cv, design, Ethiopian"
                  value={formData.tagsInput}
                  onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Pricing Model</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, priceType: 'free', price: 0 })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                      formData.priceType === 'free' 
                        ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#0EA5E9]'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, priceType: 'sale' })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                      formData.priceType === 'sale' 
                        ? 'bg-amber-500 text-white border-amber-500' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-500'
                    }`}
                  >
                    On Sale
                  </button>
                </div>
              </div>

              {formData.priceType === 'sale' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Price (ETB)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-amber-500 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">File URL / Download Link</label>
                <div className="relative">
                  <Upload className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="url"
                    placeholder="https://example.com/file.zip"
                    value={formData.fileUrl}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 ml-1">Asset Description</label>
                <textarea
                  rows={2}
                  placeholder="Provide a brief description of what the user is getting..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#0EA5E9] transition-all text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
              <button
                disabled={loading}
                type="submit"
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Save Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {filteredAssets.length > 0 && selectedAssetIds.length === filteredAssets.length ? (
                      <CheckSquare className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Asset & Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type & Tags</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Downloads</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium italic">No digital assets match your filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  return (
                    <tr key={asset.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-sky-50/30' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(asset.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                            {getIcon(asset.type)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{asset.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {asset.category && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-md">
                                  {asset.category}
                                </span>
                              )}
                              <p className="text-[10px] text-slate-500 line-clamp-1">{asset.description || 'No description.'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                            {asset.type}
                          </span>
                          {asset.tags && asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {asset.tags.map(t => (
                                <span key={t} className="text-[9px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {asset.priceType === 'free' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <Tag className="w-3 h-3" /> Free
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                            <DollarSign className="w-3 h-3" /> {asset.price} ETB
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-mono font-bold text-slate-900">{asset.downloadCount}</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Clicks</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={asset.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-[#0EA5E9] hover:bg-sky-50 rounded-lg transition-colors"
                            title="Preview Link"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => onDeleteAsset(asset.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
