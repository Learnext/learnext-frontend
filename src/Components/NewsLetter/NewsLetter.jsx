import React from "react";
import "./NewsLetter.css";

const NewsLetter = () => {
  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <span className="newsletter-tag">🚀 LearnNext Community</span>

        <h2>Nhận thông báo về khóa học mới và ưu đãi học tập</h2>

        <p>
          Tham gia cộng đồng học tập của LearnNext để không bỏ lỡ các khóa học
          mới, sự kiện và chương trình giảm giá.
        </p>

        <div className="newsletter-form">
          <input type="email" placeholder="Nhập email của bạn" />

          <button>Đăng ký ngay</button>
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
