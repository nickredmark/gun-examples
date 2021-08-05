import React, { useEffect } from "react";
import { hot } from "react-hot-loader/root";
import { GunFeed } from "./components/GunFeed";

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const hashUrlParams = new URLSearchParams(window.location.hash.substr(1));
  const priv = hashUrlParams.get("priv");
  const epriv = hashUrlParams.get("epriv");
  const oepriv = hashUrlParams.get("oepriv");
  const parent = hashUrlParams.get("parent");

  useEffect(() => {
    if (!id) {
      window.location = `https://nmaro.now.sh/gun-create/?oepriv=true&next=${encodeURIComponent(
        window.location.origin
      )}`;
    }
  }, []);

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <GunFeed
      id={id}
      priv={priv}
      epriv={epriv}
      oepriv={oepriv}
      parent={parent}
    />
  );
};

export default hot(App);
