import React, { useRef } from "react";
import { hot } from "react-hot-loader/root";
import { GunDraw } from "./components/GunDraw";
import uuid from "uuid/v1";

require("gun/lib/open");

const App = () => {
  const newId = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("drawing");

  if (!id) {
    return (
      <div className="new-drawing">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newId.current.value) {
              window.location.href = `${window.location.origin}?drawing=${newId.current.value}`;
            }
          }}
        >
          <input ref={newId} placeholder="(New) drawing ID e.g. mydoodle" />
        </form>
        or
        <button
          onClick={e =>
            (window.location.href = `${
              window.location.origin
            }?drawing=${uuid()}`)
          }
        >
          Create new drawing with random ID
        </button>
      </div>
    );
  }

  return <GunDraw id={id} />;
};

export default hot(App);
