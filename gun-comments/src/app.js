import React, { useRef } from "react";
import { hot } from "react-hot-loader/root";
import { GunComments } from "./components/GunComments";

require("gun/lib/open");

const App = () => {
  const newId = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("commentable");

  if (!id) {
    return (
      <div className="new-commentable">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newId.current.value) {
              window.location.href = `${window.location.origin}?commentable=${newId.current.value}`;
            }
          }}
        >
          <input ref={newId} placeholder="ID of the commentable" />
        </form>
      </div>
    );
  }

  return <GunComments id={id} />;
};

export default hot(App);
