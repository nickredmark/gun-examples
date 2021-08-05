import { Wiki } from "./Wiki";
import React, { useState, useEffect } from "react";
import { getPub, useGun, getId } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunWiki = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData] = useGun(Gun, gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
	  peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"],
    });
    gun.get(id).on(onData);
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const document = {
    ...data[id]
  };

  return (
    <Wiki getId={getId} priv={priv} epriv={epriv} document={document} id={id} />
  );
};
