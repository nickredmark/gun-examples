import { Page } from "./Page";
import React, { useState, useEffect } from "react";
import { useGun, getPub } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunPage = ({ base, id, priv, epriv }) => {
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

  const page = { ...data[id] };

  return <Page base={base} id={id} page={page} priv={priv} epriv={epriv} />;
};
