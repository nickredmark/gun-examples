import React, { useEffect } from "react";
import { hot } from "react-hot-loader/root";
import { GunStreamSearch } from "./components/GunStreamSearch";

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const search = urlParams.get("search");
  const legacy = urlParams.get("legacy");
  const hashUrlParams = new URLSearchParams(window.location.hash.substr(1));
  const priv = hashUrlParams.get("priv");
  const epriv = hashUrlParams.get("epriv");

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <GunStreamSearch
      id={id}
      search={search}
      legacy={legacy}
      priv={priv}
      epriv={epriv}
    />
  );
};

export default hot(App);
