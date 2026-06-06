import { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { useCourses } from "./useCourses";

export const useDiscovery = () => {
  const { courses } = useCourses(); // ← không tự fetch nữa
  const [filtered, setFiltered] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");

  // Sync filtered khi courses load xong
  useEffect(() => {
    setFiltered(courses);
  }, [courses]);

  const filterCourses = useCallback(
    (searchKeyword, selectedCategory) => {
      let result = [...courses];
      if (searchKeyword.trim()) {
        result = result.filter((c) =>
          c.title.toLowerCase().includes(searchKeyword.toLowerCase()),
        );
      }
      if (selectedCategory !== "all") {
        result = result.filter((c) => c.category === selectedCategory);
      }
      setFiltered(result);
    },
    [courses],
  );

  // useRef để debounce không bị tạo lại
  const debouncedSearch = useRef(
    debounce((value, cat, filterFn) => {
      filterFn(value, cat);
    }, 300),
  ).current;

  useEffect(() => () => debouncedSearch.cancel(), []);

  const search = useCallback(
    (value) => {
      setKeyword(value);
      debouncedSearch(value, category, filterCourses);
    },
    [category, filterCourses],
  );

  const filterCategory = useCallback(
    (value) => {
      setCategory(value);
      filterCourses(keyword, value);
    },
    [keyword, filterCourses],
  );

  return { filtered, keyword, category, search, filterCategory };
};
