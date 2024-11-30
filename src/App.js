// Updated App.js
import React, { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/home/Home';
import Navbar from './Components/navbar/Navbar';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Main from './pages/main/Main';
import Shop from './pages/shop/Shop';
import AdminShops from './pages/vendors/AdminShops';
import VendorItems from './pages/vendors/VendorItems';
import Cart from './pages/cart/Cart';
import VendorOrders from './pages/vendors/VendorOrders';
import UserOrders from './pages/orders/UserOrders';
import { getCurrentUser } from './Components/firebase/Firebase';
import OrderWaitingPage from './pages/utils/WaitingPage';
import Footer from './Components/footer/Footer';
import OrderPickupConfirmation from './Components/order/OrderConfirmation';
import UserProfile from './pages/user/UserProfile';
import VendorDashboard from './pages/vendors/workflow';
import ScrollToTop from './pages/utils/ScrollToTop'; // Add this import
import AboutUs from './pages/utils/AboutUs';
import HowItWorks from './pages/utils/HowItWorks';
import ContactUs from './pages/utils/ContactUs';
import HelpCenter from './pages/utils/HelpCenter';
import PrivacyPolicy from './pages/utils/PrivacyPolicy';
import TermsAndConditions from './pages/utils/TermsAndConditions';
import LoadingScreen from './pages/utils/loading';
// import FostPolicyPage from './pages/utils/Refund';
import CancellationPolicy from './pages/utils/Refund';
import PaymentSuccess from './pages/utils/PaymentSuccess';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const NotFound = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <ScrollToTop /> {/* Add the ScrollToTop component here */}
        
        <LoadingScreen>
        <Navbar />
        <Routes>
        
          <Route path="/" element={<Home />} />
        
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order-waiting/:orderid" element={<OrderWaitingPage />} />
          <Route path="/order-confirmation" element={<OrderPickupConfirmation />} />
          <Route path="/Profile" element={<UserProfile />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/HowItWorks" element={<HowItWorks />} />
          <Route path="/Contactus" element={<ContactUs />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy/>} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
          <Route path="/refund" element={<CancellationPolicy />} />
          <Route path="/payment-success/:shopId" element={<PaymentSuccess />} />
          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/:shopId"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminShops />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/items"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorOrders />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </LoadingScreen>
        <Footer/>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;