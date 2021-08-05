import { GunContinuousSequence } from "crdt-continuous-sequence";
import { getPub, getSet, getUUID, put, useGun } from "nicks-gun-utils";
import React, { useEffect, useState } from "react";

import { Outliner } from "./Outliner";

const Gun = require("gun/gun");
require("gun/sea");

export const GunOutliner = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData] = useGun(Gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      peers: ["https://gunjs.herokuapp.com/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.items`)
      .on(onData)
      .map()
      .on(onData);
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const cs = new GunContinuousSequence(gun);
  const item = {
    ...data[id],
    items: cs.sort(getSet(data, `${id}.items`))
  };

  return (
    <Outliner
      document={item}
      id={id}
      onSetDocumentTitle={title => put(Gun, gun, id, "title", title, pair)}
      onAddAtom={async (atom, prev, next) => {
        const key = getUUID(gun);
        const atomId = `${id}.atoms.${key}`;
        await put(Gun, gun, atomId, "atom", atom, pair);
        await put(
          Gun,
          gun,
          atomId,
          "index",
          JSON.stringify(cs.getIndexBetween(atomId, prev, next)),
          pair
        );
        await put(Gun, gun, `${id}.atoms`, key, { "#": atomId }, pair);
      }}
      onDeleteAtom={async atomId => {
        await put(Gun, gun, `${id}.atoms`, /\w+$/.exec(atomId)[0], null, pair);
      }}
    />
  );
};
