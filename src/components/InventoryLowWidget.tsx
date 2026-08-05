import React, { useState, useMemo } from 'react';
import { Package, AlertTriangle, ArrowRight, RefreshCw, CheckCircle, Plus, Edit, Settings } from 'lucide-react';
import { ProductService } from '../types';
import { formatETB } from '../utils';

interface InventoryLowWidgetProps {
  products?: ProductService[];
  onSetTab: (tab: string) => void;
  onUpdateProduct?: (id: string, payload: Partial<ProductService>) => Promise<boolean>;
}

export default function InventoryLowWidget({ products = [], onSetTab, onUpdateProduct }: InventoryLowWidgetProps) {
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('inventory_low_threshold');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleThresholdChange = (newVal: number) => {
    const val = Math.max(1, newVal);
    setThreshold(val);
    localStorage.setItem('inventory_low_threshold', val.toString());
  };

  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      if (!p) return false;
      // Filter items with defined physical stock or physical category
      const hasStockNumber = p.stock !== null && p.stock !== undefined;
      const isPhysical = p.type === 'physical' || p.category === 'sales' || p.category === 'maintenance';
      return isPhysical && hasStockNumber && (p.stock as number) <= threshold;
    });
  }, [products, threshold]);

  const handleQuickRestock = async (product: ProductService, addAmount: number = 5) => {
    if (!onUpdateProduct) return;
    setRestockingId(product.id);
    const newStock = (product.stock || 0) + addAmount;
    
    const ok = await onUpdateProduct(product.id, { stock: newStock });
    setRestockingId(null);
    
    if (ok) {
      setSuccessMsg(`Restocked "${product.title}" by +${addAmount} units (New total: ${newStock}).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      
      {/* Widget Header & Threshold Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Inventory Low Alert
              </h3>
              {lowStockProducts.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                  {lowStockProducts.length} Items Low
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
                  Stock Healthy
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Highlighting store products falling below replenishment threshold
            </p>
          </div>
        </div>

        {/* Threshold Selector Control */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Alert Threshold:</span>
          <select
            value={threshold}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value, 10))}
            className="text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            <option value={2}>≤ 2 units (Critical)</option>
            <option value={5}>≤ 5 units (Standard)</option>
            <option value={10}>≤ 10 units (Early Warning)</option>
            <option value={20}>≤ 20 units (Bulk Stock)</option>
          </select>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Product Stock Table / List */}
      {lowStockProducts.length > 0 ? (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="pb-2.5 pl-1">Product Details</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Unit Price</th>
                  <th className="pb-2.5">Current Stock</th>
                  <th className="pb-2.5 text-right pr-1">Replenish Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {lowStockProducts.map((p) => {
                  const stockNum = p.stock ?? 0;
                  const isCritical = stockNum <= 2;
                  
                  return (
                    <tr key={p.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100'} 
                            alt={p.title} 
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {p.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
                          {p.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatETB(p.price)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                            stockNum === 0 
                              ? 'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30' 
                              : isCritical 
                              ? 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30' 
                              : 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {stockNum === 0 ? '0 (Out of Stock)' : `${stockNum} units remaining`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-1">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickRestock(p, 5)}
                            disabled={restockingId === p.id}
                            title="Add +5 units to stock instantly"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {restockingId === p.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>+5 Units</span>
                          </button>
                          
                          <button
                            onClick={() => onSetTab('products')}
                            title="Open in Catalog Editor"
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              Click "+5 Units" to immediately restock item inventory in real time.
            </span>
            <button
              onClick={() => onSetTab('products')}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Inventory Healthy
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All physical catalog items have stock levels above the <strong className="text-slate-700 dark:text-slate-300">{threshold} units</strong> threshold.
          </p>
        </div>
      )}

    </div>
  );
}
