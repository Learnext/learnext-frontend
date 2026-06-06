const FilterBar = ({ category, filterCategory }) => {
  return (
    <select value={category} onChange={(e) => filterCategory(e.target.value)}>
      <option value="all">Tất cả</option>
      <option value="Lập trình">Lập trình</option>
      <option value="Thiết kế">Thiết kế</option>
      <option value="Frontend">Frontend</option>
    </select>
  );
};

export default FilterBar;
