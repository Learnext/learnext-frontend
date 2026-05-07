import "./App.css";
import Navbar from "./Components/Navbar/Navbar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Shop from "./Pages/Shop.jsx";
import Business from "./Pages/Business.jsx";
import Member from "./Pages/Member.jsx";
import Product from "./Pages/Product.jsx";
import Cart from "./Pages/Cart.jsx";
import LoginSignup from "./Pages/LoginSignup.jsx";
import Footers from "./Components/Footers/Footers.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import Support from "./Components/Support/Support.jsx";
function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/business" element={<Business />} />
          <Route path="/member" element={<Member />} />
          <Route path="/products/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
        </Routes>
        <Footers />
      </Router>
    </div>
  );
}

export default App;
