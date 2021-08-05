import { Draw } from "./Draw";
import React, { useState, useEffect } from "react";

const Gun = require("gun/gun");

const getId = element => element["_"]["#"];

const useRerender = () => {
  const [, setRender] = useState({});
  const rerender = () => setRender({});
  return rerender;
};

const getSet = (data, id, key) => {
  if (!id) {
    throw new Error("No id defined");
  }
  const entity = data[id];
  if (!entity || !entity[key]) {
    return [];
  }
  const set = data[entity[key]["#"]];
  if (!set) {
    return [];
  }
  const arr = Object.keys(set)
    .filter(key => key !== "_")
    .map(key => set[key])
    .filter(Boolean)
    .map(ref => data[ref["#"]])
    .filter(Boolean);
  return arr;
};

export const GunDraw = ({ id }) => {
  const [gun, setGun] = useState(null);
  const rerender = useRerender();

  useEffect(() => {
    const gun = Gun({
	  peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"],
    });
    setGun(gun);
  }, []);

  useEffect(() => {
    if (gun) {
      gun
        .get(id)
        .on(rerender)
        .get("paths")
        .map()
        .on(rerender);
    }
  }, [gun]);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const data = gun._.graph;
  const drawing = {
    ...data[id],
    paths: getSet(data, id, "paths")
  };

  return (
    <Draw
      getId={getId}
      drawing={drawing}
      id={id}
      onCreatePath={(path, color) =>
        gun
          .get(id)
          .get("paths")
          .set({
            path,
            color
          })
      }
      onSetTitle={title =>
        gun
          .get(id)
          .get("title")
          .put(title)
      }
    />
  );
};
