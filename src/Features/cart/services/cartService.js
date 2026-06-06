const API_URL = "http://localhost:5000";

export const fetchCartService = async () => {
  return JSON.parse(localStorage.getItem("guest-cart")) || [];
};

export const addToCartService = async (course) => {
  const guestCart = JSON.parse(localStorage.getItem("guest-cart")) || [];
  const exists = guestCart.find((item) => item.courseId === course.id);

  if (exists) {
    return { success: false, message: "Khóa học đã có trong giỏ" };
  }

  const newItem = {
    id: crypto.randomUUID(), // fix: tránh trùng id khi thêm nhanh
    courseId: course.id,
    title: course.title,
    price: course.price,
    thumbnail: course.thumbnail,
  };

  const updatedCart = [...guestCart, newItem];
  localStorage.setItem("guest-cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));

  return { success: true, item: newItem, message: "Đã thêm vào giỏ hàng" };
};

export const removeCartService = async (id) => {
  const guestCart = JSON.parse(localStorage.getItem("guest-cart")) || [];
  const updatedCart = guestCart.filter((item) => item.id !== id);
  localStorage.setItem("guest-cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));
  return { success: true };
};

// Thêm mới: xóa toàn bộ giỏ hàng sau khi thanh toán
export const clearCartService = () => {
  localStorage.removeItem("guest-cart");
  window.dispatchEvent(new Event("cartUpdated"));
};
