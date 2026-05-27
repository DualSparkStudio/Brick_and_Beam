import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Outlet, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminLayout from './components/AdminLayout';
import Layout from './components/Layout';
import MaintenancePage from './components/MaintenancePage';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import { AuthProvider } from './contexts/AuthContext';
import { MaintenanceProvider, useMaintenance } from './contexts/MaintenanceContext';
import About from './pages/About';
import AdminBookings from './pages/AdminBookings';
import AdminCalendar from './pages/AdminCalendar';
import AdminDashboard from './pages/AdminDashboard';
import AdminFAQ from './pages/AdminFAQ';
import AdminHouseRules from './pages/AdminHouseRules';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminProfile from './pages/AdminProfile';
import AdminReviews from './pages/AdminReviews';
import AdminRooms from './pages/AdminRooms';
import BookingCancel from './pages/BookingCancel';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingForm from './pages/BookingForm';
import Bookings from './pages/Bookings';
import BookingSuccess from './pages/BookingSuccess';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Policy from './pages/Policy';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RoomDetail from './pages/RoomDetail';
import Rooms from './pages/Rooms';
import TouristAttractions from './pages/TouristAttractions';
import Gallery from './pages/Gallery';

// Component to handle pathname logging
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isMaintenanceMode, isLoading } = useMaintenance();

  // ROOT FIX: Completely block Routes rendering for homepage until maintenance status is known
  // This ensures the Home component NEVER renders when maintenance mode is on
  const isHomepage = !location.pathname.startsWith('/admin') && location.pathname === '/';
  
  // ROOT FIX: For homepage, block ALL rendering until we know maintenance status
  if (isHomepage) {
    // While loading: Show maintenance-style screen (prevents any flash)
    if (isLoading) {
      return (
        <div 
          className="min-h-screen bg-gradient-to-br from-ocean-800 to-forest-800 flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
        </div>
      );
    }
    // If maintenance mode is enabled: Return maintenance page directly
    // Routes component is NEVER rendered, so Home component never mounts
    if (isMaintenanceMode) {
      return <MaintenancePage />;
    }
  }
  
  // Only render Routes after we've confirmed:
  // 1. It's not the homepage, OR
  // 2. It's the homepage but maintenance mode is disabled
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="attractions" element={<TouristAttractions />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="room/:slug" element={<RoomDetail />} />
        <Route path="features" element={<Features />} />
        <Route path="about" element={<About />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="book/:slug" element={<BookingForm />} />
        <Route path="booking/success" element={<BookingSuccess />} />
        <Route path="booking/cancel" element={<BookingCancel />} />
        <Route path="booking/confirmation/:id" element={<BookingConfirmation />} />
        <Route path="policy" element={<Policy />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
        <Route index element={<AdminDashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="calendar" element={<AdminCalendar />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="house-rules" element={<AdminHouseRules />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
      </Route>
    </Routes>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
            <p className="text-gray-700 mb-4">Something went wrong. Please refresh the page.</p>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    return (
      <HelmetProvider>
        <ErrorBoundary>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#f5f5f5',
                  color: '#333333',
                  border: '1px solid #e0e0e0',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#f5f5f5',
                    color: '#0f5132',
                    border: '1px solid #badbcc',
                  },
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#f5f5f5',
                    color: '#842029',
                    border: '1px solid #f5c2c7',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <ScrollToTop />
            <SmoothScroll>
              <MaintenanceProvider>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </MaintenanceProvider>
            </SmoothScroll>
          </Router>
        </ErrorBoundary>
      </HelmetProvider>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-800 mb-4">Application Error</h1>
          <p className="text-red-600 mb-4">Something went wrong. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
