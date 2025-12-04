import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import PrivateRoute from "./Components/PrivateRoute";
import OnlyAdminPrivateRoute from "./Components/OnlyAdminPrivateRoute";
import Header from "./Components/Header";
import FloatingAction from "./Components/FloatingAction";
import Footer from "./Components/Footer";
import CustomerProfile from "./Pages/CustomerProfile";
import AboutUs from "./Pages/AboutUs";
import PricingTable from "./Components/Pricing";
import ContactSection from "./Pages/Contact";
import ServicesSection from "./Components/ServiceSection";
import Services from "./Pages/Services";
import Matching from "./Pages/Matching";
import SingleProfile from "./Pages/SingleProfile";
import AdminSignIn from "./Pages/AdminSignIn";
import AdminDashboard from "./Components/AdminDashBoard";
import AdminHeader from "./Components/AdminHeader";

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname === "/dashboard";
  const isAdminSignInRoute = location.pathname === "/admin-sign-in";

  return (
    <>
      {!isDashboardRoute && !isAdminSignInRoute && <Header />}
      {isDashboardRoute && <AdminHeader />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/admin-sign-in" element={<AdminSignIn />} />

        <Route element={<PrivateRoute />}>
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="single-profile/:id" element={<SingleProfile />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          
        </Route>
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<PricingTable />} />
        <Route path="/contact" element={<ContactSection />} />
      </Routes>
      {!isDashboardRoute && <FloatingAction />}
      {!isDashboardRoute && !isAdminSignInRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
