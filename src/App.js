import "./App.css";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import Main from "./components/main";
import MainIndex from "./MainIndex.js";
import Development from "./Development.js";
import Loader from "./Loader.js";
import Login from "./login.js";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Outerloader from "./Outerloader";
import Configuration from "./Configuration.js";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Outerloader />} />
        <Route path="/outerloader" element={<Outerloader />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/old-index" element={<MainIndex />} />
        <Route exact path="/configuration" element={<Configuration />} />
        <Route path="/dev" element={<Development />} />
        <Route path="*" element={<NotFoundComponent />} />
      </Routes>
    </Router>
  );
}

// For debugging purposes
const NotFoundComponent = () => {
  const location = useLocation();
  console.log("Current path:", location.pathname);

  return (
    <div>
      <h2>Page Not Found</h2>
      <p>
        Sorry, the page you're looking for <code>{location.pathname}</code> does not exist.
      </p>
    </div>
  );
};

export default App;
