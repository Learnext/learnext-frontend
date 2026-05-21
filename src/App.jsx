import "./App.css";
import Navbar from "./Components/Navbar/Navbar.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Shop from "./Features/shop/pages/Shop.jsx";
import Product from "./Features/shop/pages/Product.jsx";
import Cart from "./Features/shop/pages/Cart.jsx";
import LoginSignup from "./Features/auth/pages/LoginSignup.jsx";

import Footers from "./Components/Footers/Footers.jsx";

import Profile from "./Features/profile/pages/Profile.jsx";
import Support from "./Features/support/pages/Support.jsx";

import CourseManager from "./Features/instructor/pages/CourseManager.jsx";
import InstructorDashboard from "./Features/instructor/pages/InstructorDashboard.jsx";
import InstructorLayout from "./Features/instructor/components/InstructorLayout.jsx";

function AppContent() {
  const location = useLocation();
  const isInstructorPage = location.pathname.startsWith("/instructor");

  return (
    <>
      {/* Chỉ hiện navbar ngoài instructor */}
      {!isInstructorPage && <Navbar />}

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Shop />} />
        {/* <Route path="/business" element={<Business />} /> */}
        {/* <Route path="/member" element={<Member />} /> */}
        <Route path="/products/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} />

        {/* Instructor */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<CourseManager />} />
        </Route>
      </Routes>

      {/* Chỉ hiện footer ngoài instructor */}
      {!isInstructorPage && <Footers />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
