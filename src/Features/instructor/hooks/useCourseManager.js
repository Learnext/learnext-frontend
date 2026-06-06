// src/Features/instructor/hooks/useCourseManager.js
import { useState, useEffect } from "react";
import {
  fetchCoursesService,
  createCourseService,
  updateCourseService,
  deleteCourseService,
  togglePublishService,
} from "../services/instructorService";

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  category: "",
  thumbnailUrl: "",
  previewVideoUrl: "",
  thumbnail: null,
  thumbnailPreview: null,
};

export const useCourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [view, setView] = useState("list"); // "list" | "create" | "edit"
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── Fetch danh sách ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);

      try {
        const data = await fetchCoursesService();
        console.log(
          "Courses status:",
          data.courses.map((c) => ({ title: c.title, status: c.status })),
        );
        if (data.success) {
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Lỗi tải khóa học:", err);
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, []);

  // ─── Form handlers ─────────────────────────────────────────
  const changeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tạo preview để hiển thị trên UI
    const previewUrl = URL.createObjectURL(file);

    if (formData.thumbnailPreview?.startsWith("blob:"))
      URL.revokeObjectURL(formData.thumbnailPreview);

    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: previewUrl,
    }));
  };

  const revokePreview = () => {
    if (formData.thumbnailPreview?.startsWith("blob:"))
      URL.revokeObjectURL(formData.thumbnailPreview);
  };

  const openCreate = () => {
    revokePreview();
    setFormData(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
    setEditingCourse(null);
    setView("create");
  };

  const openEdit = (course) => {
    revokePreview();
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price || 0,

      category: course.categoryName || course.category || "",

      thumbnailUrl: course.thumbnailUrl || "",
      previewVideoUrl: course.previewVideoUrl || "",

      thumbnail: null,
      thumbnailPreview: course.thumbnailUrl || null,
    });
    setFormError("");
    setFormSuccess("");
    setEditingCourse(course);
    setView("edit");
  };

  // ─── UC05: Tạo khóa học ────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const data = await createCourseService(formData);
      if (!data.success) {
        setFormError(data.message || "Tạo khóa học thất bại");
        return;
      }
      setCourses((prev) => [data.course, ...prev]);
      setFormSuccess("✓ Tạo khóa học thành công!");
      setTimeout(() => {
        setFormSuccess("");
        setView("list");
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── UC07: Sửa khóa học ────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const data = await updateCourseService(editingCourse.id, formData);
      if (!data.success) {
        setFormError(data.message || "Cập nhật thất bại");
        return;
      }
      const updated = data.course || {
        ...editingCourse,
        ...formData,
        thumbnailUrl: formData.thumbnailPreview || editingCourse.thumbnailUrl,
      };
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? updated : c)),
      );
      setFormSuccess("✓ Cập nhật khóa học thành công!");
      setTimeout(() => {
        setFormSuccess("");
        setView("list");
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── UC07: Xóa khóa học ────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const data = await deleteCourseService(id);
      if (!data.success) return;
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };
  // ─── Publish / Unpublish ──────────────────────────

  const togglePublish = async (course) => {
    try {
      console.log(`[BƯỚC 1] Gọi API đổi trạng thái cho ID: ${course.id}`);

      const resData = await togglePublishService(course.id);

      console.log(`[BƯỚC 2] API đã chạy xong! Kết quả:`, resData);

      // Chủ động ép trạng thái đảo ngược lại (từ Đã đăng -> Nháp và ngược lại)
      const currentStatus = course.status?.toUpperCase() || "";
      const newStatus =
        currentStatus === "PUBLISHED" || currentStatus === "ACTIVE"
          ? "DRAFT"
          : "PUBLISHED";

      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === course.id) {
            return { ...c, status: newStatus }; // Ghi đè trạng thái mới ngay lập tức
          }
          return c;
        }),
      );

      alert(
        `Đã đổi thành công sang: ${newStatus === "DRAFT" ? "NHÁP" : "ĐÃ ĐĂNG"}`,
      );
    } catch (err) {
      console.error("[BƯỚC LỖI] Đã xảy ra lỗi hệ thống:", err);
      alert("Lỗi: Không thể kết nối hoặc Backend từ chối. Xem Console F12.");
    }
  };

  return {
    courses,
    loadingList,
    view,
    setView,
    editingCourse,
    formData,
    formLoading,
    formError,
    formSuccess,
    deleteConfirm,
    setDeleteConfirm,
    changeHandler,
    handleThumbnail,
    openCreate,
    openEdit,
    handleCreate,
    handleEdit,
    handleDelete,
    togglePublish,
  };
};
