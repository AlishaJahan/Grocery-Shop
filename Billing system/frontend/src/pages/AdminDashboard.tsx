import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import type { Product } from '../types';

const AdminDashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Uncategorized', description: '', brand: '', unit: '' });
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = 'http://localhost:3000';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchStats()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/bills/admin/stats');
            setStats(res.data.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data.data);
        } catch (err) {
            console.error('Failed to fetch products');
        }
    };

    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('price', newProduct.price);
            formData.append('stock', newProduct.stock);
            formData.append('category', newProduct.category);
            formData.append('description', newProduct.description);
            formData.append('brand', newProduct.brand);
            formData.append('unit', newProduct.unit);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            if (editingProductId) {
                await api.put(`/products/${editingProductId}`, formData);
                toast.success('Product updated successfully!');
            } else {
                await api.post('/products', formData);
                toast.success('Product added successfully!');
            }
            setNewProduct({ name: '', price: '', stock: '', category: 'Uncategorized', description: '', brand: '', unit: '' });
            setSelectedFile(null);
            setEditingProductId(null);
            fetchProducts();
        } catch (err) {
            toast.error(editingProductId ? 'Failed to update product' : 'Failed to add product');
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProductId(product.id);
        setNewProduct({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category || 'Uncategorized',
            description: product.description || '',
            brand: product.brand || '',
            unit: product.unit || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingProductId(null);
        setNewProduct({ name: '', price: '', stock: '', category: 'Uncategorized', description: '', brand: '', unit: '' });
        setSelectedFile(null);
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            toast.success('Product deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete product. It might be linked to existing bills.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-8 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text)]">Admin Dashboard</h2>
                    <p className="text-[var(--color-text-muted)]">Inventory & Analytics Overview</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-black">System Status</p>
                    <p className="text-emerald-400 font-bold flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        Live
                    </p>
                </div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg hover:border-emerald-500/50 transition-all">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-black mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-black text-emerald-400">${stats.totalRevenue.toLocaleString('en-US')}</h3>
                </div>
                <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg hover:border-blue-500/50 transition-all">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-black mb-1">Total Orders</p>
                    <h3 className="text-3xl font-black text-blue-400">{stats.totalOrders}</h3>
                </div>
                <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-lg hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-black mb-1">Avg. Order Value</p>
                    <h3 className="text-3xl font-black text-amber-400">${stats.avgOrderValue.toFixed(0)}</h3>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {products.some(p => p.stock < 10) && (
                <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center text-rose-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p className="font-bold">Inventory Alert!</p>
                        <p className="text-sm">Some products are running low on stock. Please restock soon.</p>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Product Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-lg border border-[var(--color-border)]">
                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 pb-2 border-b border-[var(--color-border)]">
                            {editingProductId ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <form onSubmit={handleSubmitProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. Organic Bananas"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Category</label>
                                <select
                                    required
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Uncategorized">Uncategorized</option>
                                    <option value="Daily Essentials">Daily Essentials (Regular Use)</option>
                                    <option value="Dairy">Dairy Products</option>
                                    <option value="Snacks">Snacks & Munchies</option>
                                    <option value="Fruits & Veggies">Fruits & Vegetables</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Personal Care">Personal Care</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Brand</label>
                                <input
                                    type="text"
                                    value={newProduct.brand}
                                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. Nestle"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Unit (Weight/Qty)</label>
                                <input
                                    type="text"
                                    value={newProduct.unit}
                                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. 1kg or 500ml"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                                    placeholder="Briefly describe the product..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                                >
                                    {editingProductId ? 'Update Product' : 'Add Product'}
                                </button>
                                {editingProductId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] font-bold py-3 px-4 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Product List Table */}
                <div className="lg:col-span-2">
                    <div className="mb-6 relative">
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-lg"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-text-muted)] absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="bg-[var(--color-surface)] rounded-xl shadow-lg border border-[var(--color-border)] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-surface-hover)]/50 text-[var(--color-text-muted)] text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 font-semibold">Stock</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                                    <tr key={product.id} className={`hover:bg-[var(--color-surface-hover)]/30 transition-colors ${product.stock < 10 ? 'bg-rose-500/5' : ''}`}>
                                        <td className="px-6 py-4 text-[var(--color-text)] font-medium">
                                            <div className="flex items-center space-x-3">
                                                {product.imageUrl ? (
                                                    <img 
                                                        src={`${BACKEND_URL}${product.imageUrl}`} 
                                                        alt={product.name} 
                                                        className="h-10 w-10 rounded-lg object-cover border border-[var(--color-border)]"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <p>{product.name}</p>
                                                    {product.stock < 10 && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase font-black">Low Stock</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-text-muted)] text-sm">{product.category}</td>
                                        <td className="px-6 py-4 text-emerald-400 font-semibold">${product.price}</td>
                                        <td className={`px-6 py-4 font-bold ${product.stock < 10 ? 'text-rose-500' : 'text-[var(--color-text-muted)]'}`}>{product.stock}</td>
                                        <td className="px-6 py-4 flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                                                title="Edit Product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-all"
                                                title="Delete Product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="py-12 text-center text-slate-500">No products found in inventory.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
