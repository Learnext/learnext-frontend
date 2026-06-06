import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../pages/CSS/Cart.css";

import {
  fetchCartService,
  removeCartService,
} from "../Features/cart/services/cartService";

const Cart = () => {
  const [items, setItems] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await fetchCartService();

        setItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCart();
  }, []);

  const removeItem = async (id) => {
    try {
      await removeCartService(id);

      setItems((prev) => prev.filter((item) => item.id !== id));

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="cart-page">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="cart-empty">Giỏ hàng đang trống</div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.thumbnail} alt={item.title} />

                <div className="cart-info">
                  <h2>{item.title}</h2>

                  <div className="cart-price">
                    {Number(item.price || 0).toLocaleString()}đ
                  </div>
                </div>

                <button
                  className="cart-remove"
                  onClick={() => removeItem(item.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">Tổng tiền: {total.toLocaleString()}đ</div>

          <button
            className="cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Tiến hành thanh toán
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
