import { FAKE_STATS } from "../mock/stats.mock";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const authHeaders = (isJson = false) => {
  const token = localStorage.getItem("auth-token");

  return {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),

    ...(isJson && {
      "Content-Type": "application/json",
    }),
  };
};

const fetchApi = async (url, options = {}) => {
  console.log("CALL API:", url);

  const res = await fetch(url, options);

  if (!res.ok) {
    const err = await res.text();

    console.error("SERVER ERROR:", err);

    throw new Error(`HTTP ${res.status}`);
  }

  return await res.json();
};

//
// DASHBOARD
//

export const fetchStatsService = async () => {
  try {
    const courses = await fetchApi(`${API_URL}/courses`, {
      headers: authHeaders(),
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

    await delay();

    return {
      success: true,
      stats: FAKE_STATS,
    };
  }
};

//
// COURSES
//

export const fetchCoursesService = async () => {
  const courses = await fetchApi(`${API_URL}/courses`, {
    headers: authHeaders(),
  });

  return {
    success: true,
    courses,
  };
};

export const createCourseService = async (formData) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const thumbnail = formData.thumbnailUrl || null;

  const payload = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    instructorId: user.id,
    tags: formData.tags,
    thumbnail,
    status: "draft",
    students: 0,
    created_at: new Date().toISOString().split("T")[0],
  };

  const course = await fetchApi(`${API_URL}/courses`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  return { success: true, course };
};

export const updateCourseService = async (courseId, formData) => {
  const payload = {
    title: formData.title,
    description: formData.description,
    price: Number(formData.price),
    category: formData.category,
    tags: formData.tags,
    // Ưu tiên URL nhập tay, nếu không có dùng preview cũ (URL thật từ server)
    thumbnail: formData.thumbnailUrl || formData.thumbnailPreview || null,
  };

  const course = await fetchApi(`${API_URL}/courses/${courseId}`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  return { success: true, course };
};

export const deleteCourseService = async (courseId) => {
  await fetchApi(`${API_URL}/courses/${courseId}`, {
    method: "DELETE",

    headers: authHeaders(),
  });

  return {
    success: true,
  };
};

//
// CONTENT
//

export const fetchContentService = async (courseId) => {
  const chapters = await fetchApi(`${API_URL}/chapters`, {
    headers: authHeaders(),
  });

  const sections = await fetchApi(`${API_URL}/sections`, {
    headers: authHeaders(),
  });

  const lessons = await fetchApi(`${API_URL}/lessons`, {
    headers: authHeaders(),
  });

  // lọc theo khóa học
  const courseChapters = chapters.filter(
    (chapter) => chapter.courseId === courseId,
  );

  const courseSections = sections.filter(
    (section) => section.courseId === courseId,
  );

  const courseLessons = lessons.filter(
    (lesson) => lesson.courseId === courseId,
  );

  const mappedSections = courseSections.map((section) => ({
    ...section,

    lessons: courseLessons.filter((lesson) => lesson.sectionId === section.id),
  }));

  const mappedChapters = courseChapters.map((chapter) => ({
    ...chapter,

    sections: mappedSections.filter(
      (section) => section.chapterId === chapter.id,
    ),
  }));

  return {
    success: true,
    chapters: mappedChapters,
  };
};

//
// CHAPTER
//

export const createChapterService = async (courseId, title) => {
  const chapter = await fetchApi(`${API_URL}/chapters`, {
    method: "POST",
    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,
      title,
      order: 1,
    }),
  });

  return {
    success: true,
    chapter,
  };
};

export const updateChapterService = async (courseId, chapterId, title) => {
  const chapter = await fetchApi(`${API_URL}/chapters/${chapterId}`, {
    method: "PATCH",

    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,

      title,
    }),
  });

  return {
    success: true,
    chapter,
  };
};

export const deleteChapterService = async (_, chapterId) => {
  await fetchApi(`${API_URL}/chapters/${chapterId}`, {
    method: "DELETE",

    headers: authHeaders(),
  });

  return {
    success: true,
  };
};

//
// SECTION
//

export const createSectionService = async (courseId, chapterId, title) => {
  const section = await fetchApi(`${API_URL}/sections`, {
    method: "POST",
    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,
      chapterId,
      title,
      order: 1,
    }),
  });

  return {
    success: true,
    section,
  };
};

export const updateSectionService = async (
  courseId,
  chapterId,
  sectionId,
  title,
) => {
  const section = await fetchApi(`${API_URL}/sections/${sectionId}`, {
    method: "PATCH",

    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,

      chapterId,

      title,
    }),
  });

  return {
    success: true,
    section,
  };
};

export const deleteSectionService = async (_, __, sectionId) => {
  await fetchApi(`${API_URL}/sections/${sectionId}`, {
    method: "DELETE",

    headers: authHeaders(),
  });

  return {
    success: true,
  };
};

//
// LESSON
//

export const createLessonService = async (courseId, sectionId, formData) => {
  const lesson = await fetchApi(`${API_URL}/lessons`, {
    method: "POST",
    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,
      sectionId,
      title: formData.title,
      type: formData.type,
      file: formData.videoUrl || formData.fileName || "",
      duration: formData.duration || "10:00",
    }),
  });

  return {
    success: true,
    lesson,
  };
};

export const updateLessonService = async (
  courseId,
  sectionId,
  lessonId,
  formData,
) => {
  const lesson = await fetchApi(`${API_URL}/lessons/${lessonId}`, {
    method: "PATCH",
    headers: authHeaders(true),

    body: JSON.stringify({
      courseId,
      sectionId,
      title: formData.title,
      type: formData.type,
      file: formData.videoUrl || formData.fileName || "",
    }),
  });

  return {
    success: true,
    lesson,
  };
};

export const deleteLessonService = async (courseId, sectionId, lessonId) => {
  await fetchApi(`${API_URL}/lessons/${lessonId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return {
    success: true,
  };
};
export const togglePublishService = async (courseId, status) => {
  const course = await fetchApi(`${API_URL}/courses/${courseId}`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify({
      status,
    }),
  });

  return {
    success: true,
    course,
  };
};
