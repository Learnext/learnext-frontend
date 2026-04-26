import { useMemo } from "react";
import { ShopContext } from "./ShopContext";
import all_product from "../Components/Assets/Frontend_Assets/all_product";
import PropTypes from "prop-types";

const ShopContextProvider = ({ children }) => {
  const contextValue = useMemo(() => {
    return { all_product };
  }, [all_product]);

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node,
};

export default ShopContextProvider;
