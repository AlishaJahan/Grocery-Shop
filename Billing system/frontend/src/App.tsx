import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import CancellationPolicy from './pages/CancellationPolicy';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen font-sans bg-mesh relative overflow-hidden">
                        {/* Decorative background blobs */}
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
                        
                        <Toaster 
                            position="top-center" 
                            toastOptions={{
                                style: {
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(12px)',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '1rem',
                                    boxShadow: 'var(--glass-shadow)',
                                },
                            }} 
                        />
                        <Navbar />
                        <main className="relative z-10">
                        <Routes>

                            <Route 
                                path="/" 
                                element={
                                    <ProtectedRoute userOnly>
                                        <UserDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route 
                                path="/history" 
                                element={
                                    <ProtectedRoute userOnly>
                                        <OrderHistory />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/profile" 
                                element={
                                    <ProtectedRoute userOnly>
                                        <Profile />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/cancellation-policy" 
                                element={
                                    <ProtectedRoute userOnly>
                                        <CancellationPolicy />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/admin" 
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/admin/orders" 
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminOrders />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </main>
                </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
