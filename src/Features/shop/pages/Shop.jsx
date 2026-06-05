import React, { useEffect, useState } from "react";
import Hero from "../../../Components/Hero/Hero";
import Popular from "../../../Components/Popular/Popular";
import Offer from "../../../Components/Offer/Offer";
import NewCollections from "../../../Components/NewCollections/NewCollections";
import NewsLetter from "../../../Components/NewsLetter/NewsLetter";
import { fetchPublicCourses } from "../services/courseService";
import "./Shop.css";

const Shop = () => {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    fetchPublicCourses({ sort: "newest" })
      .then((data) => {
        if (mounted) {
          setCourses(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus("error");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const popularCourses = courses.slice(0, 4);
  const newestCourses = courses.slice(4, 8);

  return (
    <div>
      <Hero />
      {status === "loading" && <div className="shop-status">Loading courses...</div>}
      {status === "error" && <div className="shop-status">Unable to load courses.</div>}
      {status === "success" && <Popular items={popularCourses} />}
      <Offer />
      {status === "success" && <NewCollections items={newestCourses.length ? newestCourses : popularCourses} />}
      <NewsLetter />
    </div>
  );
};

export default Shop;
