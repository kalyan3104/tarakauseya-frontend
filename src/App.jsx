import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from '@/lib/CartContext';
import SiteLayout from '@/components/site/SiteLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import Home from '@/pages/Home';
import Collections from '@/pages/Collections';
import Sarees from '@/pages/Sarees';
import ProductDetail from '@/pages/ProductDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Journal from '@/pages/Journal';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCollections from '@/pages/admin/AdminCollections';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminImport from '@/pages/admin/AdminImport';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import AdminTrialRequests from '@/pages/admin/AdminTrialRequests';
import MyOrders from '@/pages/MyOrders';
// Add page imports here

const AuthenticatedApp = () => {
const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

// Show loading spinner while checking app public settings or auth
if (isLoadingPublicSettings || isLoadingAuth) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
}

// "user_not_registered" blocks the entire app — the user exists but isn't a member of this app.
// "auth_required" (app is private, visitor not logged in) must NOT blank the public catalogue;
// only the /admin area is gated by ProtectedRoute below.
if (authError && authError.type === 'user_not_registered') {
  return <UserNotRegisteredError />;
}

// Render the main app
return (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<SiteLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/sarees" element={<Sarees />} />
      <Route path="/saree/:slug" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
    </Route>
    <Route element={<ProtectedRoute requireAdmin={false} unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route element={<SiteLayout />}>
        <Route path="/account/orders" element={<MyOrders />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="import" element={<AdminImport />} />
        <Route path="trials" element={<AdminTrialRequests />} />
        </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <CartProvider>
            <AuthenticatedApp />
          </CartProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App