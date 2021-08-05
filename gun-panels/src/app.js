import React, { useRef } from "react";
import { hot } from "react-hot-loader/root";
import { Panels } from "./components/Panels";

const App = () => {
  const hashUrlParams = new URLSearchParams(window.location.hash.substr(1));
  const urlRef = useRef(null);
  const url = hashUrlParams.get("url");

  if (!url) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          window.location = `${window.location.origin}${
            window.location.pathname
          }#url=${encodeURIComponent(urlRef.current.value)}`;
          window.location.reload();
        }}
      >
        <input ref={urlRef} placeholder="start url" />
      </form>
    );
  }

  return <Panels url={url} />;
};

export default hot(App);
