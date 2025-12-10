import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import PrivateRoute from "./Components/PrivateRoute";
import OnlyAdminPrivateRoute from "./Components/OnlyAdminPrivateRoute";
import Header from "./Components/Header";
import FloatingAction from "./Components/FloatingAction";
import Footer from "./Components/Footer";
import AdminSignIn from "./Pages/AdminSignIn";
import AdminDashboard from "./Components/AdminDashBoard";
import AdminHeader from "./Components/AdminHeader";
import Listings from "./Components/Listings";

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
        <Route path="/admin-sign-in" element={<AdminSignIn />} />
        <Route path='/donationview/:itemId'element={<Listings/>}/>
        <Route path='/donations' element={<Home />} />

        <Route element={<PrivateRoute />}>
         
          <Route path="/dashboard" element={<AdminDashboard />} />

        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          
        </Route>
        
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
