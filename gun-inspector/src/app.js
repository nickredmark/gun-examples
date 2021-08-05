import React from "react";
import { hot } from "react-hot-loader/root";
import { GunInspector } from "./components/GunInspector";

require("gun/lib/open");

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSubscribed = (urlParams.get("id") || "")
    .split(",")
    .filter(Boolean);

  return <GunInspector initialSubscribed={initialSubscribed} />;
};

export default hot(App);
