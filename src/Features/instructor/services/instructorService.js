import { INSTRUCTORS } from "../../../config/instructors";

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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const instructorId =
    INSTRUCTORS[user.email] || localStorage.getItem("instructorId") || "";

  return {
    "X-Instructor-Id": instructorId,
    ...(isJson && { "Content-Type": "application/json" }),
  };
};

const fetchApi = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  if (res.status === 204) {
    return null;
  }

  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};

const contentTypeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

const getUploadContentType = (file) => {
  if (file.type) {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();
  const extension = Object.keys(contentTypeByExtension).find((ext) =>
    lowerName.endsWith(ext),
  );

  return extension ? contentTypeByExtension[extension] : "";
};

const uploadFile = async (file) => {
  if (!file || !API_URL) {
    return null;
  }

  const contentType = getUploadContentType(file);

  const signed = await fetchApi(`${API_URL}/uploads/signed-url`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      size: file.size,
    }),
  });

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`UPLOAD_FAILED ${uploadResponse.status}: ${errorText}`);
  }

  return signed.publicUrl;
};

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

export const fetchCoursesService = async () => {
  const courses = await fetchApi(`${API_URL}/instructor/courses`, {
    headers: instructorHeaders(),
  });

  return { success: true, courses };
};

export const createCourseService = async (formData) => {
  const uploadedThumbnailUrl = await uploadFile(formData.thumbnail);

  const payload = {
    title: formData.title,
    description: formData.description || "",
    price: Number(formData.price) || 0,
    category: formData.category,
    thumbnailUrl: uploadedThumbnailUrl || formData.thumbnailUrl || "",
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
  const uploadedThumbnailUrl = await uploadFile(formData.thumbnail);

  const payload = {
    title: formData.title,
    description: formData.description || "",
    price: Number(formData.price) || 0,
    category: formData.category,
    thumbnailUrl:
      uploadedThumbnailUrl ||
      formData.thumbnailUrl ||
      formData.thumbnailPreview ||
      "",
    previewVideoUrl: formData.previewVideoUrl || null,
  };

  const course = await fetchApi(`${API_URL}/instructor/courses/${courseId}`, {
    method: "PUT",
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
  const course = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/publish`,
    {
      method: "PATCH",
      headers: instructorHeaders(),
    },
  );

  return { success: true, course };
};

export const fetchContentService = async (courseId) => {
  const chapters = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content`,
    { headers: instructorHeaders() },
  );

  return { success: true, chapters };
};

export const createChapterService = async (courseId, title) => {
  const chapter = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters`,
    {
      method: "POST",
      headers: instructorHeaders(true),
      body: JSON.stringify({ title }),
    },
  );

  return { success: true, chapter };
};

export const updateChapterService = async (courseId, chapterId, title) => {
  const chapter = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters/${chapterId}`,
    {
      method: "PATCH",
      headers: instructorHeaders(true),
      body: JSON.stringify({ title }),
    },
  );

  return { success: true, chapter };
};

export const deleteChapterService = async (courseId, chapterId) => {
  await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters/${chapterId}`,
    {
      method: "DELETE",
      headers: instructorHeaders(),
    },
  );

  return { success: true };
};

export const createSectionService = async (courseId, chapterId, title) => {
  const section = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters/${chapterId}/sections`,
    {
      method: "POST",
      headers: instructorHeaders(true),
      body: JSON.stringify({ title }),
    },
  );

  return { success: true, section };
};

export const updateSectionService = async (
  courseId,
  chapterId,
  sectionId,
  title,
) => {
  const section = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters/${chapterId}/sections/${sectionId}`,
    {
      method: "PATCH",
      headers: instructorHeaders(true),
      body: JSON.stringify({ title }),
    },
  );

  return { success: true, section };
};

export const deleteSectionService = async (courseId, chapterId, sectionId) => {
  await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/chapters/${chapterId}/sections/${sectionId}`,
    {
      method: "DELETE",
      headers: instructorHeaders(),
    },
  );

  return { success: true };
};

const lessonPayload = async (formData) => {
  const uploadedUrl = await uploadFile(formData.file);
  const type = formData.type || "video";
  const fileUrl = uploadedUrl || formData.file || formData.fileName || "";

  return {
    title: formData.title,
    type,
    videoUrl: type === "video" ? formData.videoUrl || fileUrl : "",
    documentUrl: type === "pdf" ? fileUrl : "",
    file: fileUrl,
  };
};

export const createLessonService = async (courseId, sectionId, formData) => {
  const lesson = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/sections/${sectionId}/lessons`,
    {
      method: "POST",
      headers: instructorHeaders(true),
      body: JSON.stringify(await lessonPayload(formData)),
    },
  );

  return { success: true, lesson };
};

export const updateLessonService = async (
  courseId,
  sectionId,
  lessonId,
  formData,
) => {
  const lesson = await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/sections/${sectionId}/lessons/${lessonId}`,
    {
      method: "PATCH",
      headers: instructorHeaders(true),
      body: JSON.stringify(await lessonPayload(formData)),
    },
  );

  return { success: true, lesson };
};

export const deleteLessonService = async (courseId, sectionId, lessonId) => {
  await fetchApi(
    `${API_URL}/instructor/courses/${courseId}/content/sections/${sectionId}/lessons/${lessonId}`,
    {
      method: "DELETE",
      headers: instructorHeaders(),
    },
  );

  return { success: true };
};

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

export const submitPaymentProofService = async (orderId, proofFile) => {
  const token = localStorage.getItem("auth-token");
  const formData = new FormData();
  formData.append("proofFile", proofFile);

  const res = await fetch(`${API_URL}/orders/${orderId}/proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
  return { success: true, order: json.data };
};

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

export const activateCourseService = async (activationCode) => {
  const data = await fetchApi(`${API_URL}/activations/activate`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ code: activationCode }),
  });

  return { success: true, ...data };
};

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
