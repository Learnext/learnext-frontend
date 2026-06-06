import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../pages/CSS/CourseDetail.css";
import { addToCartService } from "../Features/cart/services/cartService";
import { useAuth } from "../Features/auth/context/AuthContext";

const API = "http://localhost:5000";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyBought, setAlreadyBought] = useState(false);
  const [inCart, setInCart] = useState(false);

  const navigate = useNavigate();

  // Load course
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await fetch(`${API}/courses/${id}`);
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCourse();
  }, [id]);

  // Kiểm tra đã mua chưa
  useEffect(() => {
    if (!user || !id) return;
    const checkBought = async () => {
      try {
        const res = await fetch(
          `${API}/orders?userId=${user.id}&courseId=${id}`,
        );
        const data = await res.json();
        setAlreadyBought(data.length > 0);
      } catch (err) {
        console.error(err);
      }
    };
    checkBought();
  }, [user, id]);

  // Kiểm tra đã có trong giỏ chưa
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("guest-cart")) || [];
    setInCart(cart.some((item) => String(item.courseId) === String(id)));
  }, [id]);

  const addToCart = async () => {
    if (alreadyBought) {
      alert("Bạn đã mua khóa học này rồi!");
      return;
    }

    setLoading(true);
    try {
      const data = await addToCartService(course);

      if (data.success) {
        setInCart(true);
      }

      window.dispatchEvent(new Event("cartUpdated"));
      alert(data.message || "Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const buyNow = async () => {
    setLoading(true);
    try {
      if (!inCart) {
        await addToCartService(course);
        window.dispatchEvent(new Event("cartUpdated"));
      }
      navigate("/checkout");
    } catch (err) {
      console.error(err);
      alert("Lỗi, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return <h2>Đang tải...</h2>;
  }

  return (
    <div className="course-detail">
      <div className="course-detail-left">
        <img
          src={course.thumbnail}
          alt={course.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400/4f46e5/white?text=No+Image";
          }}
        />
      </div>

      <div className="course-detail-right">
        <h1 className="course-detail-title">{course.title}</h1>
        <p className="course-detail-desc">{course.description}</p>
        <div className="course-detail-price">
          {Number(course.price || 0).toLocaleString()}đ
        </div>

        {alreadyBought ? (
          <button className="course-detail-btn" disabled>
            Đã mua
          </button>
        ) : inCart ? (
          <button
            className="course-detail-btn"
            onClick={() => navigate("/cart")}
          >
            Xem giỏ hàng
          </button>
        ) : (
          <button
            className="course-detail-btn"
            onClick={addToCart}
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
          </button>
        )}

        {!alreadyBought && (
          <button className="buy-now-btn" onClick={buyNow} disabled={loading}>
            Mua ngay
          </button>
        )}

        <button
          className="learn-btn"
          onClick={() => navigate(`/course/${course.id}/learn?preview=true`)}
        >
          Học thử miễn phí
        </button>
      </div>
    </div>
  );
};

export default CourseDetail;
