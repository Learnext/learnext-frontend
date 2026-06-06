import { useState, useEffect } from "react";
import { fetchDiscoveryCourses } from "../services/discoveryService";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscoveryCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading };
};
