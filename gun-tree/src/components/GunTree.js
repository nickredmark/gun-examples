import { Tree } from "./Tree";
import React, { useState, useEffect } from "react";
import { getPub, useGun, getUUID, getSet, getId } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunTree = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.items`)
      .on(onData)
      .map()
      .on(onData)
      .once(item => gun.get(`${getId(item)}.relationships`).on(onData));
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const tree = {
    ...data[id],
    items: getSet(data, `${id}.items`).map(item => ({
      ...item,
      relationships: getSet(data, `${getId(item)}.relationships`)
    }))
  };

  return <Tree tree={tree} />;
};
