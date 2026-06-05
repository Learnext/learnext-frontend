import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicCourse } from "../services/courseService";
import {
  addFavorite,
  fetchComments,
  fetchReviews,
  submitComment,
  submitReview,
} from "../services/courseInteractionService";
import { createOrder } from "../services/orderService";
import "./Product.css";

const Product = () => {
  const { productId } = useParams();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [orderStatus, setOrderStatus] = useState("");
  const [favoriteStatus, setFavoriteStatus] = useState("");
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [commentContent, setCommentContent] = useState("");
  const [interactionStatus, setInteractionStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchPublicCourse(productId).then((data) => {
      if (!mounted) {
        return;
      }

      setCourse(data);
      setStatus(data ? "success" : "not-found");
    });

    Promise.all([fetchReviews(productId), fetchComments(productId)])
      .then(([reviewData, commentData]) => {
        if (!mounted) {
          return;
        }

        setReviews(reviewData || []);
        setComments(commentData || []);
      })
      .catch(() => {
        if (mounted) {
          setReviews([]);
          setComments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleCreateOrder = async () => {
    setOrderStatus("loading");
    try {
      const order = await createOrder(course.id);
      setOrderStatus(`Order ${order.status}`);
    } catch (error) {
      setOrderStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : "Unable to create order");
    }
  };

  const handleFavorite = async () => {
    setFavoriteStatus("loading");
    try {
      await addFavorite(course.id);
      setFavoriteStatus("Saved to favorites");
    } catch (error) {
      setFavoriteStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : "Unable to save favorite");
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setInteractionStatus("saving-review");
    try {
      const review = await submitReview(course.id, {
        rating: Number(reviewForm.rating),
        content: reviewForm.content,
      });
      setReviews((items) => [review, ...items.filter((item) => item.userId !== review.userId)]);
      setReviewForm({ rating: 5, content: "" });
      setInteractionStatus("");
    } catch (error) {
      setInteractionStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : "Unable to submit review");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setInteractionStatus("saving-comment");
    try {
      const comment = await submitComment(course.id, commentContent);
      setComments((items) => [comment, ...items]);
      setCommentContent("");
      setInteractionStatus("");
    } catch (error) {
      setInteractionStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : "Unable to submit comment");
    }
  };

  if (status === "loading") {
    return <div className="product-page">Loading course...</div>;
  }

  if (status === "not-found") {
    return <div className="product-page">Course not found.</div>;
  }

  return (
    <main className="product-page">
      <img className="product-image" src={course.image} alt={course.title} />
      <section className="product-info">
        <p className="product-category">{course.categoryName}</p>
        <h1>{course.title}</h1>
        <p className="product-instructor">{course.instructorName}</p>
        <p className="product-description">{course.description}</p>
        <div className="product-meta">
          <span>${course.new_price}</span>
          <span>{course.rating || 0} rating</span>
          {course.hasPreview && <span>Preview available</span>}
        </div>
        <button className="product-order-button" onClick={handleCreateOrder}>
          Create order
        </button>
        <button className="product-secondary-button" onClick={handleFavorite}>
          Save favorite
        </button>
        {orderStatus && (
          <p className="product-order-status">
            {orderStatus === "loading" ? "Creating order..." : orderStatus}
          </p>
        )}
        {favoriteStatus && (
          <p className="product-order-status">
            {favoriteStatus === "loading" ? "Saving favorite..." : favoriteStatus}
          </p>
        )}
      </section>

      <section className="product-community">
        <div>
          <h2>Reviews</h2>
          <form className="product-form" onSubmit={handleReviewSubmit}>
            <select
              value={reviewForm.rating}
              onChange={(event) => setReviewForm((value) => ({ ...value, rating: event.target.value }))}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
            <textarea
              value={reviewForm.content}
              onChange={(event) => setReviewForm((value) => ({ ...value, content: event.target.value }))}
              placeholder="Share your review"
              required
            />
            <button type="submit">Submit review</button>
          </form>
          <div className="product-list">
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id}>
                  <strong>{review.userName || "Learner"}</strong>
                  <span>{review.rating} stars</span>
                  <p>{review.content}</p>
                </article>
              ))
            )}
          </div>
        </div>

        <div>
          <h2>Comments</h2>
          <form className="product-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Ask a question or leave a comment"
              required
            />
            <button type="submit">Post comment</button>
          </form>
          {interactionStatus && interactionStatus !== "saving-review" && interactionStatus !== "saving-comment" && (
            <p className="product-order-status">{interactionStatus}</p>
          )}
          <div className="product-list">
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <article key={comment.id}>
                  <strong>{comment.userName || "Learner"}</strong>
                  <p>{comment.content}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Product;
