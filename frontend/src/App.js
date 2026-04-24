import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MiChatWidget from "@/components/MiChatWidget";
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import BlogArticlePage from "@/pages/BlogArticlePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PortalPage from "@/pages/PortalPage";
import VRFHisensePage from "@/pages/VRFHisensePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/servicos" element={<ServicesPage />} />
      <Route path="/servicos/:slug" element={<ServicesPage />} />
      <Route path="/sobre" element={<AboutPage />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogArticlePage />} />
      <Route path="/vrf-hisense" element={<VRFHisensePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/minha-conta" element={<ProtectedRoute><PortalPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <MiChatWidget />
        </div>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
