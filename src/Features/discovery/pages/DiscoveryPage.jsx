import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CourseGrid from "../components/CourseGrid";

import { useDiscovery } from "../hooks/useDiscovery";

import "../styles/Discovery.css";

const DiscoveryPage = () => {
  const { filtered, keyword, category, search, filterCategory } =
    useDiscovery();

  return (
    <div className="discovery-page">
      <h1>Khám phá khóa học</h1>

      <div className="discovery-controls">
        <SearchBar keyword={keyword} search={search} />

        <FilterBar category={category} filterCategory={filterCategory} />
      </div>

      <CourseGrid courses={filtered} />
    </div>
  );
};

export default DiscoveryPage;
