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
  tags: "",
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

        if (data.success) {
          const user = JSON.parse(localStorage.getItem("user"));

          const myCourses = data.courses.filter(
            (course) => String(course.instructorId) === String(user?.id),
          );

          setCourses(myCourses);
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
      price: course.price,
      category: course.category,
      tags: course.tags || "",
      thumbnail: null,
      thumbnailPreview: course.thumbnail || null,
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
        thumbnail: formData.thumbnailPreview || editingCourse.thumbnail,
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
    const newStatus = course.status === "published" ? "draft" : "published";

    const data = await togglePublishService(course.id, newStatus);

    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? data.course : c)),
    );
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
