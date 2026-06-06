import React, { useEffect, useState } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../Features/auth/context/AuthContext";

const API = "http://localhost:1201/api/v1";

const Item = (props) => {
  const { user } = useAuth();
  const [alreadyBought, setAlreadyBought] = useState(false);

  // LƯU Ý VỀ HIỆU NĂNG:
  // Việc gọi API enrollments ở từng item lẻ như thế này sẽ gây ra lỗi N+1 request.
  // Tuy nhiên, để tránh phá vỡ cấu trúc hiện tại của bạn, tôi giữ nguyên logic check nhưng bổ sung cơ chế chống spam (caching tạm thời).
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !props.id) return;

      try {
        const token = localStorage.getItem("auth-token");

        // Tối ưu nhẹ: Thử kiểm tra xem có enrollments lưu tạm trong sessionStorage không để tránh gọi API nhiều lần
        const cached = sessionStorage.getItem("user-enrollments");
        let enrollments = [];

        if (cached) {
          enrollments = JSON.parse(cached);
        } else {
          const res = await fetch(`${API}/learning/enrollments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();
          enrollments = result.data || [];
          // Lưu tạm vào session để các Item khác không phải gọi lại API
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
            // Hỗ trợ cả 2 kiểu tên props để tương thích ngược với code cũ
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

          {/* Bổ sung hiển thị thông tin Giảng viên & Danh mục nếu cha có truyền vào */}
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
