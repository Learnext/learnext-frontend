import { FAKE_COURSES } from "../mock/courses.mock";
import { FAKE_STATS } from "../mock/stats.mock";
import { FAKE_CONTENT } from "../mock/content.mock";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const authHeaders = (isJson = false) => {
  const token = localStorage.getItem("auth-token");
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const instructorId = user.instructorId || user.id;

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(instructorId && { "X-Instructor-Id": instructorId }),
    ...(isJson && { "Content-Type": "application/json" }),
  };
};

const ALLOWED_FIELDS = ["title", "description", "price", "category", "tags"];

export const buildPayload = (data) => {
  const payload = new FormData();

  ALLOWED_FIELDS.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      payload.append(key, data[key]);
    }
  });

  if (data.thumbnail instanceof File) {
    payload.append("thumbnail", data.thumbnail);
  }

  if (data.intro_video instanceof File) {
    payload.append("intro_video", data.intro_video);
  }

  return payload;
};

const fetchApi = async (url, options = {}) => {
  console.log("CALL API:", url);
  console.log("OPTIONS:", options);

  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.text();
    console.log("SERVER ERROR:", err);

    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log("SUCCESS:", data);

  return data;
};

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }

  return payload;
};

const toUiCourse = (course) => ({
  id: course.id,
  title: course.title,
  description: course.description || "",
  price: Number(course.price || 0),
  category: course.categoryName || course.category || "",
  tags: course.tags || "",
  thumbnail: course.thumbnailUrl || course.thumbnail || null,
  intro_video: course.previewVideoUrl || course.intro_video || null,
  status: String(course.status || "DRAFT").toLowerCase(),
  students: course.students || 0,
  created_at: course.createdAt || course.created_at,
});

const uploadFile = async (file) => {
  if (!file || !API_URL) {
    return null;
  }

  const signed = unwrap(await fetchApi(`${API_URL}/uploads/signed-url`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  }));

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("UPLOAD_FAILED");
  }

  return signed.publicUrl;
};

//
// DASHBOARD
//

export const fetchStatsService = async () => {
  if (!API_URL) {
    await delay(600);

    return {
      success: true,
      stats: FAKE_STATS,
    };
  }

  const courses = unwrap(await fetchApi(`${API_URL}/instructor/courses`, {
    headers: authHeaders(),
  })).map(toUiCourse);

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
};

//
// COURSES
//

export const fetchCoursesService = async () => {
  if (!API_URL) {
    await delay();

    return {
      success: true,
      courses: FAKE_COURSES,
    };
  }

  const courses = unwrap(await fetchApi(`${API_URL}/instructor/courses`, {
    headers: authHeaders(),
  })).map(toUiCourse);

  return {
    success: true,
    courses,
  };
};

export const createCourseService = async (formData) => {
  if (!API_URL) {
    await delay();

    return {
      success: true,
      course: {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        tags: formData.tags,
        thumbnail: formData.thumbnailPreview || null,
        intro_video: formData.introVideoName || null,
        status: "draft",
        students: 0,
        created_at: new Date().toISOString(),
      },
    };
  }

  const thumbnailUrl = await uploadFile(formData.thumbnail);
  const previewVideoUrl = await uploadFile(formData.intro_video);

  const payload = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    thumbnailUrl: thumbnailUrl || formData.thumbnailPreview || null,
    previewVideoUrl: previewVideoUrl || formData.introVideoName || null,
  };

  const course = unwrap(await fetchApi(`${API_URL}/instructor/courses`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  }));

  return {
    success: true,
    course: toUiCourse(course),
  };
};

export const updateCourseService = async (courseId, formData) => {
  if (!API_URL) {
    await delay();

    return {
      success: true,
      course: {
        id: courseId,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        tags: formData.tags,
        thumbnail: formData.thumbnailPreview || null,
        intro_video: formData.introVideoName || null,
        status: "draft",
        students: 0,
        created_at: new Date().toISOString(),
      },
    };
  }

  const thumbnailUrl = await uploadFile(formData.thumbnail);
  const previewVideoUrl = await uploadFile(formData.intro_video);

  const payload = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    thumbnailUrl: thumbnailUrl || formData.thumbnailPreview || null,
    previewVideoUrl: previewVideoUrl || formData.introVideoName || null,
  };

  const course = unwrap(await fetchApi(`${API_URL}/instructor/courses/${courseId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  }));

  return {
    success: true,
    course: toUiCourse(course),
  };
};

export const deleteCourseService = async (courseId) => {
  if (!API_URL) {
    await delay();
    return { success: true };
  }

  await fetchApi(`${API_URL}/instructor/courses/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return { success: true };
};

export const publishCourseService = async (courseId) => {
  if (!API_URL) {
    await delay();

    return {
      success: true,
      course: {
        id: courseId,
        status: "published",
      },
    };
  }

  const course = unwrap(await fetchApi(`${API_URL}/instructor/courses/${courseId}/publish`, {
    method: "PATCH",
    headers: authHeaders(),
  }));

  return {
    success: true,
    course: toUiCourse(course),
  };
};

//
// CONTENT
//

export const fetchContentService = async () => {
  const chapters = await fetchApi(`${API_URL}/content`, {
    headers: authHeaders(),
  });

  return {
    success: true,
    chapters,
  };
};

//
// CHAPTER
//

export const createChapterService = async (_, title) => {
  if (!API_URL) {
    await delay();

    return {
      success: true,
      chapter: {
        id: Date.now(),
        title,
        order: 1,
        sections: [],
      },
    };
  }

  return fetchApi(`${API_URL}/chapters`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      title,
      order: 1,
      sections: [],
    }),
  });
};

export const updateChapterService = async (_, chapterId, title) =>
  fetchApi(`${API_URL}/chapters/${chapterId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ title }),
  });

export const deleteChapterService = async (_, chapterId) =>
  fetchApi(`${API_URL}/chapters/${chapterId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

//
// SECTION
//

export const createSectionService = async (_, __, title) =>
  fetchApi(`${API_URL}/sections`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      title,
      order: 1,
      lessons: [],
    }),
  });

export const updateSectionService = async (_, __, sectionId, title) =>
  fetchApi(`${API_URL}/sections/${sectionId}`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ title }),
  });

export const deleteSectionService = async (_, __, sectionId) =>
  fetchApi(`${API_URL}/sections/${sectionId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

//
// LESSON
//

export const createLessonService = async (_, __, formData) => {
  const payload = new FormData();

  payload.append("title", formData.title);
  payload.append("type", formData.type);

  if (formData.file) {
    payload.append("file", formData.file);
  }

  return fetchApi(`${API_URL}/lessons`, {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
};

export const updateLessonService = async (_, __, lessonId, formData) => {
  const payload = new FormData();

  payload.append("title", formData.title);
  payload.append("type", formData.type);

  if (formData.file) {
    payload.append("file", formData.file);
  }

  return fetchApi(`${API_URL}/lessons/${lessonId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: payload,
  });
};

export const deleteLessonService = async (_, __, lessonId) =>
  fetchApi(`${API_URL}/lessons/${lessonId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
