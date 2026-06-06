const rawApiUrl = import.meta.env.VITE_API_URL;

const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

export const authHeaders = (isJson = false) => {
  const token = localStorage.getItem("auth-token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(isJson && { "Content-Type": "application/json" }),
  };
};

export const instructorHeaders = (isJson = false) => {
  const instructorId = localStorage.getItem("instructorId");

  return {
    "X-Instructor-Id": instructorId || "",
    ...(isJson && { "Content-Type": "application/json" }),
  };
};

const fetchApi = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  const json = await res.json();
  // BE trả về { success, data } hoặc trực tiếp object
  return json?.data !== undefined ? json.data : json;
};

//
// DASHBOARD
//

export const fetchStatsService = async () => {
  try {
    const courses = await fetchApi(`${API_URL}/instructor/courses`, {
      headers: instructorHeaders(),
    });

    return {
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, c) => sum + (c.students || 0), 0),
        totalRevenue: courses.reduce(
          (sum, c) => sum + (c.price || 0) * (c.students || 0),
          0,
        ),
        recentCourses: courses.slice(-5).reverse(),
      },
    };
  } catch (err) {
    console.error(err);
    return { success: false, stats: null };
  }
};

//
// COURSES
//

export const fetchCoursesService = async () => {
  const courses = await fetchApi(`${API_URL}/instructor/courses`, {
    headers: instructorHeaders(),
  });

  return { success: true, courses };
};

export const createCourseService = async (formData) => {
  const payload = {
    title: formData.title,
    description: formData.description || "",
    price: Number(formData.price) || 0,
    category: formData.category,
    thumbnailUrl: formData.thumbnailUrl || "",
    previewVideoUrl: formData.previewVideoUrl || "",
  };

  const course = await fetchApi(`${API_URL}/instructor/courses`, {
    method: "POST",
    headers: instructorHeaders(true),
    body: JSON.stringify(payload),
  });

  return { success: true, course };
};

export const updateCourseService = async (courseId, formData) => {
  const payload = {
    title: formData.title,
    description: formData.description || "",
    price: Number(formData.price) || 0,
    category: formData.category,
    thumbnailUrl: formData.thumbnailUrl || formData.thumbnailPreview || "",
    previewVideoUrl: formData.previewVideoUrl || null,
  };

  const course = await fetchApi(`${API_URL}/instructor/courses/${courseId}`, {
    method: "PUT", // BE dùng PUT không phải PATCH
    headers: instructorHeaders(true),
    body: JSON.stringify(payload),
  });

  return { success: true, course };
};

export const deleteCourseService = async (courseId) => {
  await fetchApi(`${API_URL}/instructor/courses/${courseId}`, {
    method: "DELETE",
    headers: instructorHeaders(),
  });

  return { success: true };
};

export const togglePublishService = async (courseId) => {
  // BE dùng PATCH /instructor/courses/{courseId}/publish
  const course = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/publish`,
    {
      method: "PATCH",
      headers: instructorHeaders(),
    },
  );

  return { success: true, course };
};

//
// ORDERS (user)
//

export const fetchOrdersService = async () => {
  const orders = await fetchApi(`${API_URL}/orders`, {
    headers: authHeaders(),
  });

  return { success: true, orders };
};

export const createOrderService = async (courseId) => {
  const order = await fetchApi(`${API_URL}/orders`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ courseId }),
  });

  return { success: true, order };
};

export const submitPaymentProofService = async (orderId, paymentProofUrl) => {
  const order = await fetchApi(`${API_URL}/orders/${orderId}/proof`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ paymentProofUrl }),
  });

  return { success: true, order };
};

//
// ENROLLMENTS
//

export const fetchEnrollmentsService = async () => {
  const enrollments = await fetchApi(`${API_URL}/learning/enrollments`, {
    headers: authHeaders(),
  });

  return { success: true, enrollments };
};

export const checkCourseAccessService = async (courseId) => {
  const data = await fetchApi(
    `${API_URL}/learning/courses/${courseId}/access`,
    { headers: authHeaders() },
  );

  return { success: true, ...data };
};

export const completeLessonService = async (courseId, lessonId) => {
  await fetchApi(`${API_URL}/learning/courses/${courseId}/complete`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ lessonId }),
  });

  return { success: true };
};

//
// FAVORITES
//

export const fetchFavoritesService = async () => {
  const favorites = await fetchApi(`${API_URL}/favorites`, {
    headers: authHeaders(),
  });

  return { success: true, favorites };
};

export const addFavoriteService = async (courseId) => {
  await fetchApi(`${API_URL}/favorites/${courseId}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return { success: true };
};

export const removeFavoriteService = async (courseId) => {
  await fetchApi(`${API_URL}/favorites/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return { success: true };
};

//
// REVIEWS & COMMENTS
//

export const createReviewService = async (courseId, rating, content) => {
  const review = await fetchApi(`${API_URL}/courses/${courseId}/reviews`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ rating, content }),
  });

  return { success: true, review };
};

export const createCommentService = async (courseId, content) => {
  const comment = await fetchApi(`${API_URL}/courses/${courseId}/comments`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ content }),
  });

  return { success: true, comment };
};

//
// ACTIVATION
//

export const activateCourseService = async (activationCode) => {
  const data = await fetchApi(`${API_URL}/activations/activate`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ activationCode }),
  });

  return { success: true, ...data };
};

//
// PUBLIC COURSES
//

export const fetchPublicCoursesService = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.sort) query.set("sort", params.sort);

  const courses = await fetchApi(`${API_URL}/courses?${query.toString()}`);

  return { success: true, courses };
};

export const fetchCourseDetailService = async (courseId) => {
  const course = await fetchApi(`${API_URL}/courses/${courseId}`);
  return { success: true, course };
};

export const fetchCategoriesService = async () => {
  const categories = await fetchApi(`${API_URL}/categories`);
  return { success: true, categories };
};
