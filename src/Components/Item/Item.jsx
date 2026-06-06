import React, { useEffect, useState } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { addToCartService } from "../../Features/cart/services/cartService";
import { useAuth } from "../../Features/auth/context/AuthContext";

const API = "http://localhost:5000";

const Item = (props) => {
  const { user } = useAuth();
  const [alreadyBought, setAlreadyBought] = useState(false);

  useEffect(() => {
    if (!user || !props.id) return;

    const check = async () => {
      try {
        const res = await fetch(`${API}/orders`);
        const data = await res.json();
        const bought = data.some(
          (o) =>
            String(o.userId) === String(user.id) &&
            String(o.courseId) === String(props.id),
        );
        setAlreadyBought(bought);
      } catch (err) {
        console.error(err);
      }
    };

    check();
  }, [user, props.id]);

  const handleAddCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (alreadyBought) {
      alert("Bạn đã mua khóa học này rồi!");
      return;
    }

    try {
      const res = await addToCartService(props);
      alert(res.message || "Đã thêm vào giỏ hàng");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm giỏ hàng");
    }
  };

  return (
    <Link to={`/course/${props.id}`} className="item-link">
      <div className="item">
        <div className="item-image-wrapper">
          <img
            className="item-image"
            src={props.thumbnail}
            alt={props.title}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x225/4f46e5/white?text=No+Image";
            }}
          />
          {alreadyBought && <div className="item-bought-badge">✓ Đã mua</div>}
        </div>

        <div className="item-content">
          <p className="item-title">{props.title}</p>
          <div className="item-price">
            <div className="item-price-new">
              {Number(props.price).toLocaleString()}đ
            </div>
          </div>
        </div>

        <button
          className="add-cart-btn"
          onClick={handleAddCart}
          title={alreadyBought ? "Đã mua" : "Thêm vào giỏ"}
        >
          {alreadyBought ? "✓" : "🛒"}
        </button>
      </div>
    </Link>
  );
};

export default Item;
