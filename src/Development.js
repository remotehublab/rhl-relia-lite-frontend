import "./App.css";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { ReliaWidgetsLite } from "./components/blocks/loaderLite.js";

const Development = () => {
  window.API_BASE_URL = "/api/";
  const [google] = useState(null);
  useEffect(() => {
    console.log("Development");
    // TODO: Brian, why does this happen?
    if (window.reliaLoaded === true) return;

    window.reliaLoaded = true;

    if (!google) {
      const head = document.head;
      let script = document.getElementById("googleChartsScript");
      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.id = "googleChartsScript";
        script.onload = () => {
          if (window.google && window.google.charts) {
            window.google.charts.load("current", { packages: ["corechart"] });
            window.google.charts.setOnLoadCallback(() => loadUI());
          }
        };
        head.appendChild(script);
      } else if (window.google) {
        console.log("loadUI");
        loadUI();
      }
    }

    return () => {
      let script = document.getElementById("googleChartsScript");
      if (script) {
        script.remove();
      }
    };
  }, [google]);

  return (
    <div className="App">
      Development environment (Marcos)
      <div id="all-together" class="row"></div>
      <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossOrigin="anonymous"></script>
    </div>
  );
};

function loadUI() {
  var widgets = new ReliaWidgetsLite($("#all-together"));
}

export default Development;
