import { HomeIcon, ShoppingCartIcon, UploadIcon, UserIcon, ContactIcon, ShieldCheckIcon, BookOpenIcon, MessageSquareIcon, BarChartIcon } from "lucide-react";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import UploadLeads from "./pages/UploadLeads";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyLeads from "./pages/MyLeads";
import Purchases from "./pages/Purchases";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SellerGuide from "./pages/SellerGuide";
import BuyerGuide from "./pages/BuyerGuide";
import About from "./pages/About";
import AdminLeads from "./pages/AdminLeads";
import AdminChatDashboard from "./pages/AdminChatDashboard";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

/**
 * Central place for defining the navigation structure of our app.
 * Used by the router, and also by nav-components to understand the current state of navigation.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Marketplace",
    to: "/marketplace",
    icon: <ShoppingCartIcon className="h-4 w-4" />,
    page: <Marketplace />,
  },
  {
    title: "Upload Leads",
    to: "/upload-leads",
    icon: <UploadIcon className="h-4 w-4" />,
    page: <UploadLeads />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Login",
    to: "/login",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Login />,
  },
  {
    title: "Register",
    to: "/register",
    icon: <UserIcon className="h-4 w-4" />,
    page: <Register />,
  },
  {
    title: "Forgot Password",
    to: "/forgot-password",
    icon: <UserIcon className="h-4 w-4" />,
    page: <ForgotPassword />,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    icon: <UserIcon className="h-4 w-4" />,
    page: <ResetPassword />,
  },
  {
    title: "My Leads",
    to: "/my-leads",
    icon: <UploadIcon className="h-4 w-4" />,
    page: <MyLeads />,
  },
  {
    title: "Purchases",
    to: "/purchases",
    icon: <ShoppingCartIcon className="h-4 w-4" />,
    page: <Purchases />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <ContactIcon className="h-4 w-4" />,
    page: <Contact />,
  },
  {
    title: "Privacy Policy",
    to: "/privacy-policy",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    page: <PrivacyPolicy />,
  },
  {
    title: "Terms of Service",
    to: "/terms-of-service",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    page: <TermsOfService />,
  },
  {
    title: "Seller Guide",
    to: "/seller-guide",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <SellerGuide />,
  },
  {
    title: "Buyer Guide",
    to: "/buyer-guide",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <BuyerGuide />,
  },
  {
    title: "About",
    to: "/about",
    icon: <ContactIcon className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Admin Leads",
    to: "/admin/leads",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    page: <AdminLeads />,
  },
  {
    title: "Admin Chat",
    to: "/admin/chats",
    icon: <MessageSquareIcon className="h-4 w-4" />,
    page: <AdminChatDashboard />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChartIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Not Found",
    to: "*",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <NotFound />,
  },
];
