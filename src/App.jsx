import "./App.css";

import Navbar from "./Components/Navbar/Navbar.jsx";
import Footers from "./Components/Footers/Footers.jsx";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Shop from "./pages/Shop.jsx";
import Cart from "./pages/Cart.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import SearchPage from "./pages/SearchPage.jsx";

import LoginSignup from "./Features/auth/pages/LoginSignup.jsx";
import Profile from "./Features/profile/pages/Profile.jsx";
import Support from "./Features/support/pages/Support.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import LearningPage from "./pages/LearningPage.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import InstructorLayout from "./Features/instructor/components/InstructorLayout.jsx";
import InstructorDashboard from "./Features/instructor/pages/InstructorDashboard.jsx";
import CourseManager from "./Features/instructor/pages/CourseManager.jsx";
import CourseContent from "./Features/instructor/pages/CourseContent.jsx";

function AppContent() {
  const location = useLocation();

  const isInstructorPage = location.pathname.startsWith("/instructor");

  const hideFooter =
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/course") ||
    location.pathname.startsWith("/my-courses") ||
    location.pathname.startsWith("/checkout");

  return (
    <div className="app-layout">
      {!isInstructorPage && <Navbar />}

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Shop />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course/:courseId/learn" element={<LearningPage />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/support" element={<Support />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<CourseManager />} />
            <Route
              path="courses/:courseId/content"
              element={<CourseContent />}
            />
          </Route>
        </Routes>
      </div>

      {!isInstructorPage && !hideFooter && <Footers />}
    </div>
  );
}
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
