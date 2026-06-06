import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CourseGrid from "../components/CourseGrid";
import { useDiscovery } from "../hooks/useDiscovery";
import "../styles/Discovery.css";

const DiscoveryPage = () => {
  const { courses, loading, keyword, setKeyword, categoryId, setCategoryId } =
    useDiscovery();

  return (
    <div className="discovery-page">
      <h1>Khám phá khóa học</h1>
      <div className="discovery-controls">
        <SearchBar keyword={keyword} search={setKeyword} />
        <FilterBar categoryId={categoryId} setCategoryId={setCategoryId} />
      </div>
      <CourseGrid courses={courses} loading={loading} />
    </div>
  );
};

export default DiscoveryPage;
