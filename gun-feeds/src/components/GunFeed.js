import { Feed } from "./Feed";
import React, { useState, useEffect } from "react";
import { getPub, useGun, getSet, getId } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunFeed = ({ id, priv, epriv, oepriv, parent }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && { pub, priv, epriv, oepriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.subs`)
      .on(onData)
      .map()
      .on(onData)
      .get("sub")
      .on(onData)
      .get("lastMessage")
      .on(onData);
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const feed = {
    ...data[id],
    subs: getSet(data, `${id}.subs`).map(sub => {
      return {
        ...sub,
        sub: sub.sub &&
          data[sub.sub["#"]] && {
            ...data[sub.sub["#"]],
            lastMessage:
              data[sub.sub["#"]].lastMessage &&
              data[data[sub.sub["#"]].lastMessage["#"]]
          }
      };
    })
  };

  return (
    <Feed
      getId={getId}
      priv={priv}
      epriv={epriv}
      feed={feed}
      id={id}
      onSetFeedName={name => put([id, "name", name])}
      onDeleteSub={async subId => put([`${id}.subs`, subId, null])}
      parent={parent}
      onAddSub={async url => {
        let origin;
        let subId;
        let legacy;
        let subPriv;
        let subEpriv;
        const puts = [];
        try {
          const parsed = new URL(url);
          origin = parsed.origin + parsed.pathname;
          subId = parsed.searchParams.get("id");
          if (!subId) {
            throw new Error("Could not detect id in url");
          }
          legacy = parsed.searchParams.get("legacy");
          const hashUrlParams = new URLSearchParams(parsed.hash.substr(1));
          subPriv = hashUrlParams.get("priv");
          subEpriv = hashUrlParams.get("epriv");
        } catch (e) {
          // TODO: create new stream
          origin = "https://nmaro.now.sh/gun-streams/";
          const pair = await Gun.SEA.pair();
          subId = `~${pair.pub}`;
          subPriv = pair.priv;
          subEpriv = pair.epriv;
          puts.push(
            [subId, "created", +new Date(), pair],
            [subId, "name", url, pair]
          );
        }
        try {
          const subLinkId = `${id}.subs.${subId}`;
          puts.push(
            ...[
              [`${id}.subs`, subId, { "#": subLinkId }],
              [subLinkId, "sub", { "#": subId }],
              [subLinkId, "origin", origin]
            ]
          );
          if (legacy) {
            puts.push([subLinkId, "legacy", true]);
          }
          if (subPriv) {
            puts.push([subLinkId, "priv", subPriv]);
          }
          if (subEpriv) {
            puts.push([subLinkId, "epriv", subEpriv]);
          }
          put(...puts);
        } catch (e) {
          alert(e.message);
          throw e;
        }
      }}
    />
  );
};
