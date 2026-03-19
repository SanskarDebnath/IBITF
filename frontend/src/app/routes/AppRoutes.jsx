import { Routes, Route } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";

// Public
import HomePage from "../../pages/home/HomePage";
import CatalogPage from "../../pages/catalog/CatalogPage";
import ProductDetailsPage from "../../pages/product/ProductDetailsPage";
import AboutPage from "../../pages/static/AboutPage";
import ContactPage from "../../pages/static/ContactPage";
import FooterContentPage from "../../pages/static/FooterContentPage";
import NotFoundPage from "../../pages/static/NotFoundPage";
import { footerPageRoutes } from "../../pages/static/footerPageContent";

// Auth
import LoginPage from "../../pages/auth/LoginPage";
import SignupPage from "../../pages/auth/SignupPage";
import VerifyOtpPage from "../../pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/auth/ResetPasswordPage";

// Buyer
import CartPage from "../../pages/cart/CartPage";
import CheckoutPage from "../../pages/checkout/CheckoutPage";
import OrderSuccessPage from "../../pages/checkout/OrderSuccessPage";
import MyOrdersPage from "../../pages/orders/MyOrdersPage";
import OrderDetailsPage from "../../pages/orders/OrderDetailsPage";
import ProfilePage from "../../pages/orders/ProfilePage";
import MyWishlistPage from "../../pages/orders/MyWishlistPage";

// Seller
import SellerOnboardingPage from "../../pages/seller/SellerOnboardingPage";
import SellerDashboardPage from "../../pages/seller/SellerDashboardPage";
import SellerProductsPage from "../../pages/seller/SellerProductsPage";
import SellerKpisPage from "../../pages/seller/SellerKpisPage";
import AddProductPage from "../../pages/seller/AddProductPage";
import AddCategoryPage from "../../pages/seller/AddCategoryPage";
import EditProductPage from "../../pages/seller/EditProductPage";
import SellerOrdersPage from "../../pages/seller/SellerOrdersPage";
import SellerSettingsPage from "../../pages/seller/SellerSettingsPage";
import SellerPayoutsPage from "../../pages/seller/SellerPayoutsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {footerPageRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<FooterContentPage pageKey={route.pageKey} />}
          />
        ))}

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Buyer protected */}
        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/account/orders" element={<MyOrdersPage />} />
          <Route path="/account/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/account/wishlist" element={<MyWishlistPage />} />

        </Route>

        {/* Seller protected + role guard */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowed={["seller", "admin"]} />}>
            <Route path="/seller/onboarding" element={<SellerOnboardingPage />} />
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/kpis" element={<SellerKpisPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/products/new" element={<AddProductPage />} />
            <Route path="/seller/categories/new" element={<AddCategoryPage />} />
            <Route path="/seller/products/:id/edit" element={<EditProductPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/settings" element={<SellerSettingsPage />} />
            <Route path="/seller/payouts" element={<SellerPayoutsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
