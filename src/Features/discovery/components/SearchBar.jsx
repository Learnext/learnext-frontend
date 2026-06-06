const SearchBar = ({ keyword, search }) => {
  return (
    <input
      type="text"
      placeholder="Tìm khóa học..."
      value={keyword}
      onChange={(e) => search(e.target.value)}
    />
  );
};

export default SearchBar;
