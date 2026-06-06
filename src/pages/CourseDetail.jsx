import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Features/auth/context/AuthContext";
import "../pages/CSS/CourseDetail.css";
import { addCartItem } from "../utils/cart";
import { notifyError, notifySuccess } from "../utils/notify";

const API = import.meta.env.VITE_API_URL || "http://localhost:1201/api/v1";

const Stars = ({ value, onChange, readOnly = false }) => (
  <div className="star-rating" aria-label={`${value} sao`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={star <= value ? "active" : ""}
        onClick={() => !readOnly && onChange(star)}
        disabled={readOnly}
      >
        ★
      </button>
    ))}
  </div>
);

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);

  const token = localStorage.getItem("auth-token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Giang vien cua chinh khoa hoc nay -> cung duoc tham gia thao luan
  const isCourseInstructor =
    course?.instructorId &&
    String(course.instructorId) ===
      String(localStorage.getItem("instructorId"));
  const canParticipate = isEnrolled || isCourseInstructor;

  const loadFeedback = async () => {
    if (!user || !id) {
      setComments([]);
      setReviews([]);
      return;
    }
    const [commentsRes, reviewsRes] = await Promise.all([
      fetch(`${API}/courses/${id}/comments`, { headers: authHeaders }),
      fetch(`${API}/courses/${id}/reviews`, { headers: authHeaders }),
    ]);
    if (commentsRes.ok) {
      const json = await commentsRes.json();
      setComments(json.data || []);
    }
    if (reviewsRes.ok) {
      const json = await reviewsRes.json();
      setReviews(json.data || []);
    }
  };

  useEffect(() => {
    const loadCourse = async () => {
      const res = await fetch(`${API}/courses/${id}`);
      const json = await res.json();
      if (json.success) setCourse(json.data);
    };
    loadCourse().catch((err) => console.error("Load course failed:", err));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const checkEnrollment = async () => {
      const res = await fetch(`${API}/learning/enrollments`, {
        headers: authHeaders,
      });
      const json = await res.json();
      setIsEnrolled(
        (json.data || []).some((e) => String(e.courseId) === String(id)),
      );
    };
    checkEnrollment().catch((err) =>
      console.error("Check enrollment failed:", err),
    );
    loadFeedback().catch((err) => console.error("Load feedback failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const handleBuyNow = () => {
    if (!user) {
      localStorage.setItem("redirect-after-login", `/course/${id}`);
      navigate("/login");
      return;
    }
    navigate("/checkout", {
      state: {
        courseId: course.id,
        title: course.title,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
      },
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      localStorage.setItem("redirect-after-login", `/course/${id}`);
      navigate("/login");
      return;
    }
    addCartItem({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
    });
    notifySuccess("Da them khoa hoc vao gio hang.");
  };

  const postComment = async (content, parentId = null) => {
    if (!canParticipate) {
      notifyError("Ban can mua khoa hoc truoc khi binh luan.");
      return;
    }
    const res = await fetch(`${API}/courses/${id}/comments`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "Khong the gui binh luan");
    }
    await loadFeedback();
  };

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      await postComment(commentContent);
      setCommentContent("");
      notifySuccess("Da gui binh luan.");
    } catch (err) {
      notifyError(err.message || "Khong the gui binh luan.");
    }
  };

  const submitReply = async (e, contentKey, parentId) => {
    e.preventDefault();
    try {
      await postComment(replyContent[contentKey] || "", parentId);
      setReplyContent((prev) => ({ ...prev, [contentKey]: "" }));
      setReplyingTo(null);
      notifySuccess("Da gui phan hoi.");
    } catch (err) {
      notifyError(err.message || "Khong the gui phan hoi.");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isEnrolled) {
      notifyError("Ban can mua khoa hoc truoc khi danh gia.");
      return;
    }
    try {
      const res = await fetch(`${API}/courses/${id}/reviews`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(rating),
          content: reviewContent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Khong the gui danh gia");
      }
      setReviews([json.data, ...reviews]);
      setReviewContent("");
      setRating(5);
      notifySuccess("Da gui danh gia.");
    } catch (err) {
      notifyError(err.message || "Khong the gui danh gia.");
    }
  };

  // rootId: id của comment gốc — reply luôn gắn vào root (flat nesting)
  const renderComment = (comment, nested = false, rootId = null) => {
    const effectiveParentId = nested ? rootId : comment.id;
    return (
      <div key={comment.id} className={`comment-box ${nested ? "reply" : ""}`}>
        <div className="comment-header">
          <b>{comment.userName}</b>
          <span>
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : ""}
          </span>
        </div>
        <p>{comment.content}</p>
        {canParticipate && (
          <button
            className="reply-toggle"
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
          >
            Tra loi
          </button>
        )}
        {replyingTo === comment.id && (
          <form
            className="reply-form"
            onSubmit={(e) => submitReply(e, comment.id, effectiveParentId)}
          >
            <textarea
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
              placeholder={
                nested ? `Tra loi @${comment.userName}...` : "Nhap phan hoi..."
              }
              rows={2}
              required
            />
            <button type="submit">Gửi phản hồi</button>
          </form>
        )}
        {(comment.replies || []).map((reply) =>
          renderComment(reply, true, rootId || comment.id),
        )}
      </div>
    );
  };

  if (!course) return <h2>Đang tải chi tiết khóa học...</h2>;

  return (
    <>
      <div className="course-detail">
        <div className="course-detail-left">
          <img
            src={course.thumbnailUrl}
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
            {Number(course.price || 0).toLocaleString()}d
          </div>

          {isEnrolled ? (
            <button
              className="course-detail-btn"
              onClick={() => navigate(`/course/${course.id}/learn`)}
            >
              Đã mua - Học ngay
            </button>
          ) : (
            <>
              <button className="buy-now-btn" onClick={handleBuyNow}>
                Mua ngay
              </button>
              <button className="learn-btn" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
            </>
          )}

          {!isEnrolled && course.hasPreview && (
            <button
              className="learn-btn"
              onClick={() =>
                navigate(`/course/${course.id}/learn?preview=true`)
              }
            >
              Học thử miễn phí
            </button>
          )}
        </div>
      </div>

      <div className="course-feedback">
        <h2>Bình luận và đánh giá</h2>
        {!user ? (
          <p>Vui lòng đăng nhập để xem bình luận và đánh giá của khóa học.</p>
        ) : (
          <>
            {canParticipate ? (
              <div className="course-feedback-forms">
                {/* Giang vien khong tu danh gia khoa cua minh */}
                {isEnrolled && (
                  <form onSubmit={submitReview}>
                    <h3>Đánh giá khóa học</h3>
                    <Stars value={rating} onChange={setRating} />
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Nội dung đánh giá"
                      rows={3}
                    />
                    <button type="submit">Gửi đánh giá</button>
                  </form>
                )}

                <form onSubmit={submitComment}>
                  <h3>
                    {isCourseInstructor ? "Trao đổi với học viên" : "Bình luận"}
                  </h3>
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Nội dung bình luận"
                    rows={3}
                    required
                  />
                  <button type="submit">Gửi bình luận</button>
                </form>
              </div>
            ) : (
              <p>Mua khóa học để được bình luận và đánh giá.</p>
            )}

            <div className="course-feedback-list">
              <h3>Đánh giá</h3>
              {reviews.map((review) => (
                <div key={review.id} className="course-feedback-item">
                  <div className="comment-header">
                    <b>{review.userName}</b>
                    <Stars value={review.rating} readOnly />
                  </div>
                  <p>{review.content}</p>
                </div>
              ))}

              <h3>Bình luận</h3>
              {comments.map((comment) => renderComment(comment))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CourseDetail;
