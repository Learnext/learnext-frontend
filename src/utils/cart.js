const baseKey = "learnext-cart";

const currentUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const id = user?.id || user?.email;
    return id ? `${baseKey}:${id}` : baseKey;
  } catch {
    return baseKey;
  }
};

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(currentUserKey()) || "[]");
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(currentUserKey(), JSON.stringify(items));
};

export const getCartItems = () => readCart();

export const addCartItem = (course) => {
  const items = readCart();
  if (items.some((item) => String(item.id) === String(course.id))) {
    return items; // Khóa học đã có trong giỏ — bỏ qua
  }
  const next = [...items, { ...course }];
  writeCart(next);
  return next;
};

export const removeCartItem = (courseId) => {
  const next = readCart().filter((item) => String(item.id) !== String(courseId));
  writeCart(next);
  return next;
};

export const clearCart = () => {
  localStorage.removeItem(currentUserKey());
};
