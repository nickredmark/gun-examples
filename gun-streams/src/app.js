import React, { useEffect } from "react";
import { hot } from "react-hot-loader/root";
import { GunStreams } from "./components/GunStreams";

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const legacy = urlParams.get("legacy");
  const hashUrlParams = new URLSearchParams(window.location.hash.substr(1));
  const priv = hashUrlParams.get("priv");
  const epriv = hashUrlParams.get("epriv");
  const parent = hashUrlParams.get("parent");

  useEffect(() => {
    if (!id) {
      window.location = `https://nmaro.now.sh/gun-create/?next=${encodeURIComponent(
        window.location.origin
      )}`;
    }
  }, []);

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <GunStreams
      id={id}
      legacy={legacy}
      priv={priv}
      epriv={epriv}
      parent={parent}
    />
  );
};

export default hot(App);
