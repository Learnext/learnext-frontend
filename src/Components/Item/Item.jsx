import React, { useEffect, useState } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../Features/auth/context/AuthContext";

const API = "http://localhost:1201/api/v1";

const Item = (props) => {
  const { user } = useAuth();
  const [alreadyBought, setAlreadyBought] = useState(false);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !props.id) return;

      try {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        // Dùng cache để tránh N+1
        const cached = sessionStorage.getItem("user-enrollments");
        let enrollments = [];

        if (cached) {
          enrollments = JSON.parse(cached);
        } else {
          // Sửa: đúng endpoint theo API docs
          const res = await fetch(`${API}/learning/enrollments`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // 401 nghĩa là chưa login hoặc token hết hạn — bỏ qua, không crash
          if (res.status === 401 || !res.ok) return;

          const text = await res.text();
          if (!text) return; // tránh lỗi "Unexpected end of JSON"

          const result = JSON.parse(text);
          enrollments = result.data || [];
          sessionStorage.setItem(
            "user-enrollments",
            JSON.stringify(enrollments),
          );
        }

        const bought = enrollments.some(
          (e) => String(e.courseId) === String(props.id),
        );
        setAlreadyBought(bought);
      } catch (err) {
        console.error(err);
      }
    };

    checkEnrollment();
  }, [user, props.id]);

  return (
    <Link to={`/course/${props.id}`} className="item-link">
      <div className="item">
        <div className="item-image-wrapper">
          <img
            className="item-image"
            src={props.thumbnailUrl || props.thumbnail}
            alt={props.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x225/4f46e5/white?text=No+Image";
            }}
          />
          {alreadyBought && <div className="item-bought-badge">✓ Đã mua</div>}
        </div>

        <div className="item-content">
          <p className="item-title">{props.title}</p>

          {(props.instructorName || props.category || props.categoryName) && (
            <div
              className="item-meta"
              style={{ fontSize: "0.8rem", color: "#666", marginBottom: "8px" }}
            >
              <span>{props.categoryName || props.category}</span>
              {props.instructorName && <span> • {props.instructorName}</span>}
            </div>
          )}

          <div className="item-price">
            <div className="item-price-new">
              {Number(props.price || 0).toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Item;
