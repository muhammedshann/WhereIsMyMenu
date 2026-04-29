import { Routes, Route } from 'react-router-dom';
import HomePage from './features/pages/HomePage.jsx';
import LoginPage from './features/auth/pages/loginPage.jsx';
import RegisterPage from './features/auth/pages/registerPage.jsx';
import RestaurantSetupPage from './features/restaurant/pages/RestaurantSetupPage.jsx';
import DashboardPage from './features/restaurant/pages/DashboardPage.jsx';
import SubscriptionPage from './features/restaurant/pages/SubscriptionPage.jsx';
import PublicMenuPage from './features/menu/pages/PublicMenuPage.jsx';
import AdminDashboard from './features/admin/auth/adminDashboard.jsx';
import AdminLayout from './layouts/adminLayout.jsx';
import AdminRestaurants from './features/admin/pages/adminRestaurantsPage.jsx';
import AdminTransactions from './features/admin/pages/adminTransactionPage.jsx';
import AdminSubscriptionPlanPage from './features/admin/pages/adminSubscriptionPlanPage.jsx';
import OTPPage from './features/auth/pages/otpVerificationPage.jsx';
import './App.css';
import AdminRoute from './componenets/adminRoute.jsx';
import UserRoute from './componenets/userRoute.jsx';
import ProtectedRoute from './componenets/protectedRoute.jsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderRadius: '0.75rem',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={
        <UserRoute>
          <LoginPage />
        </UserRoute>
      } />
      
      <Route path="/otp-verification" element={
        <UserRoute>
          <OTPPage />
        </UserRoute>
      } />

      <Route path="/register" element={<UserRoute><RegisterPage /></UserRoute>} />
      <Route path="/restaurant/setup" element={<ProtectedRoute><RestaurantSetupPage /></ProtectedRoute>} />
      <Route path="/restaurant/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/:slug" element={<PublicMenuPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="plans" element={<AdminSubscriptionPlanPage />} />
      </Route>

      </Routes>
    </>
  );
}

export default App;
