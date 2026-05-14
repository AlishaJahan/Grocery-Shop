import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const fetchOrders = async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/bills/admin/history?page=${pageNum}&limit=20`);
            setOrders(res.data.data);
            setTotalPages(res.data.meta.totalPages);
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (billId: number, status: string) => {
        try {
            await api.patch(`/bills/admin/bills/${billId}/status`, { status });
            fetchOrders(page);
            toast.success('Status updated successfully!');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/bills/admin/reports/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sales_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to export report');
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
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text)]">Order Management</h2>
                <button
                    onClick={handleExport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--color-surface-hover)]/50 text-[var(--color-text-muted)] text-xs uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-black">ID</th>
                                <th className="px-6 py-4 font-black">Customer</th>
                                <th className="px-6 py-4 font-black">Date</th>
                                <th className="px-6 py-4 font-black">Amount</th>
                                <th className="px-6 py-4 font-black">Payment</th>
                                <th className="px-6 py-4 font-black text-center">Status</th>
                                <th className="px-6 py-4 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--color-text)]">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-[var(--color-text)] font-semibold">{order.user?.email || 'Walk-in'}</p>
                                        {order.houseNumber && (
                                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-tight">
                                                🏠 {order.houseNumber}, {order.area}<br/>
                                                📍 {order.city} - {order.pincode}
                                                {order.landmark && <><br/><span className="italic">Ref: {order.landmark}</span></>}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-text-muted)] text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-emerald-400 font-bold">${order.grandTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">
                                            {order.paymentMethod || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                                            order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                            order.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' :
                                            order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                                            order.status === 'SHIPPED' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                            className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="COMPLETED">Completed (Delivered)</option>
                                            <option value="CANCELLED">Cancelled</option>
                                            <option value="PENDING">Pending</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="py-20 text-center text-[var(--color-text-muted)]">
                        No orders found in the system.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                    >
                        Previous
                    </button>
                    <div className="flex items-center space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                                    page === pageNum 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
