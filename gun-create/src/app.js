import React, { useState, useEffect } from "react";
import { hot } from "react-hot-loader/root";
import { NewGunResource } from "./components/NewGunResource";

const Gun = require("gun/gun");
require("gun/sea");

const App = () => {
  const [gun, setGun] = useState(null);

  useEffect(() => {
    const gun = Gun({
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const next = urlParams.get("next");
  const oepriv = urlParams.get("oepriv");

  return <NewGunResource Gun={Gun} gun={gun} next={next} oepriv={oepriv} />;
};

export default hot(App);
