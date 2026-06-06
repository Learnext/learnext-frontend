import { useState, useEffect } from "react";

const API_URL = "http://localhost:1201/api/v1";

const FilterBar = ({ categoryId, setCategoryId }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Gọi API lấy danh mục thực tế thay vì cào từ danh sách khóa học
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((json) => setCategories(json.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
      <option value="all">Tất cả danh mục</option>
      {categories.map((cat) => (
        // Value phải là ID để backend filter, text hiển thị là Name
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default FilterBar;
