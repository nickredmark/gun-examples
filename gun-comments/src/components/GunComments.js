import { Comments } from "./Comments";
import React, { useState, useEffect } from "react";
import uuid from "uuid/v4";

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

export const GunComments = ({ id }) => {
  const [gun, setGun] = useState(null);
  const rerender = useRerender();
  const [token, setToken] = useState();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      token = uuid();
      localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

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
        .get("comments")
        .map()
        .on(rerender);
    }
  }, [gun]);

  if (!gun || !token) {
    return <div>Loading...</div>;
  }

  const data = gun._.graph;
  const commentable = {
    ...data[id],
    comments: getSet(data, id, "comments")
  };

  return (
    <Comments
      getId={getId}
      commentable={commentable}
      id={id}
      onCreateComment={content =>
        gun
          .get(id)
          .get("comments")
          .set({
            content
          })
      }
    />
  );
};
