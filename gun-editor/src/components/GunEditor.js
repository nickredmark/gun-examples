import { Editor } from "./Editor";
import { GunContinuousSequence } from "crdt-continuous-sequence";
import React, { useState, useEffect } from "react";
import { useGun, getId, getUUID, getPub, getSet } from "nicks-gun-utils";
import diff from "fast-diff";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunEditor = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"],
      uuid: () => Gun.state.lex() + "-" + Gun.text.random()
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.atoms`)
      .on(onData)
      .map()
      .on(onData);
    setGun(gun);
  }, []);

  const [document, setDocument] = useState();
  const cs = new GunContinuousSequence(gun);
  useEffect(() => {
    if (gun) {
      const atoms = cs
        .sort(getSet(data, `${id}.atoms`))
        .filter(atom => atom.atom !== undefined);
      setDocument({
        ...data[id],
        atoms,
        content: atoms.map(atom => atom.atom).join("")
      });
    }
  }, [gun, data]);

  if (!document) {
    return <div>Loading...</div>;
  }

  return (
    <Editor
      document={document}
      id={id}
      timeout={2000}
      onSetDocumentTitle={title => put([id, "title", title])}
      onContent={(innerAtoms, innerContent, newContent, cursor) => {
        let index = 0;
        const puts = [];
        for (const [action, part] of diff(innerContent, newContent, cursor)) {
          switch (action) {
            case diff.INSERT:
              const prev = innerAtoms[index - 1];
              const next = innerAtoms[index];
              for (const atom of part) {
                const key = getUUID(gun);
                const atomId = `${id}.atoms.${key}`;
                puts.push(
                  [atomId, "atom", atom],
                  [
                    atomId,
                    "index",
                    JSON.stringify(cs.getIndexBetween(atomId, prev, next))
                  ],
                  [`${id}.atoms`, key, { "#": atomId }]
                );
              }
              break;
            case diff.EQUAL:
              index += part.length;
              break;
            case diff.DELETE:
              for (let i = 0; i < part.length; i++) {
                const atomId = getId(innerAtoms[index + i]);
                puts.push([`${id}.atoms`, /[\w\-]+$/.exec(atomId)[0], null]);
              }
              index += part.length;
              break;
          }
        }
        put(...puts);
      }}
    />
  );
};
