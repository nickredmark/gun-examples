import { Inspector } from "./Inspector";
import React, { useState, useEffect } from "react";
import { getId, getUUID, getPub } from "../utils";

const Gun = require("gun/gun");
const SEA = require("gun/sea");

export const GunInspector = ({ initialSubscribed }) => {
  const [gun, setGun] = useState(null);
  const [rerendered, setRender] = useState({});
  const rerender = () => setRender({});
  const [rootSubscribed, setRootSubscribed] = useState(initialSubscribed);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [keys, setKeys] = useState({});
  const [nodes, setNodes] = useState({});
  const [decrypted, setDecrypted] = useState({});

  useEffect(() => {
    setGun(
      Gun({
		  peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
      })
    );
  }, []);

  useEffect(() => {
    if (gun) {
      for (const id of subscribed) {
        gun.get(id).on(rerender);
      }
    }
  }, [gun]);

  useEffect(() => {
    if (gun) {
      (async () => {
        const nodes = {};
        for (const id of Object.keys(gun._.graph)) {
          const node = { ...gun._.graph[id] };
          const pub = getPub(id);
          if (pub) {
            for (const key of Object.keys(node).filter(
              key => !["_", "pub"].includes(key)
            )) {
              const value = node[key];
              let verified;
              try {
                // gun provides auth values as stringified object ¯\_(ツ)_/¯
                verified = JSON.parse(value);
              } catch (e) {
                verified = await SEA.verify(value, pub);
              }
              node[key] = verified[":"];
            }
          }
          nodes[id] = node;
        }
        setNodes(nodes);
      })();
    }
  }, [gun, rerendered]);

  if (!gun) {
    return <div>Loading...</div>;
  }

  return (
    <Inspector
      getId={getId}
      nodes={nodes}
      subscribed={rootSubscribed}
      keys={keys}
      user={gun.user().is}
      decrypted={decrypted}
      onSubscribe={(id, root) => {
        if (root && !rootSubscribed.includes(id)) {
          setRootSubscribed([...rootSubscribed, id]);
        }
        if (!subscribed.includes(id)) {
          setSubscribed([...subscribed, id]);
          gun.get(id).on(rerender);
        }
      }}
      onSetValue={async (id, key, value, epriv) => {
        if (epriv) {
          value = await SEA.encrypt(value, { epriv });
        }
        const pub = getPub(id);
        if (pub && !(gun.user()._.sea && gun.user()._.sea.pub === pub)) {
          const priv = keys[pub];
          if (!priv) {
            return;
          }
          value = await SEA.sign(
            {
              "#": id,
              ".": key,
              ":": value,
              ">": Gun.state()
            },
            { priv, pub }
          );
        }
        gun
          .get(id)
          .get(key)
          .put(value);
      }}
      onCreateSubNode={async (id, key, subId) => {
        const pub = getPub(id);
        if (!subId) {
          subId = getUUID(gun);
        }
        if (pub) {
          subId = `${subId}~${pub}.`;
        }
        if (!key) {
          key = subId;
        }
        let value = {
          "#": subId
        };
        if (pub) {
          const priv = keys[pub];
          if (!priv) {
            return;
          }
          value = await SEA.sign(
            {
              "#": id,
              ".": key,
              ":": value,
              ">": Gun.state()
            },
            { priv, pub }
          );
        }
        gun
          .get(id)
          .get(key)
          .put(value);
      }}
      onCreateNode={() => {
        const id = getUUID(gun);
        setRootSubscribed([...rootSubscribed, id]);
        setSubscribed([...subscribed, id]);
        gun.get(id).on(rerender);
      }}
      onCreateProtectedNode={async () => {
        const { priv, pub } = await SEA.pair();
        const id = `~${pub}`;
        setRootSubscribed([...rootSubscribed, id]);
        setSubscribed([...subscribed, id]);
        setKeys({ ...keys, [pub]: priv });
        gun.get(id).on(rerender);
      }}
      onLogin={async (alias, pass) => {
        await new Promise(res => gun.user().auth(alias, pass, res));
        const { epub, epriv, pub, priv } = gun.user()._.sea;
        setKeys({ ...keys, [pub]: priv, [epub]: epriv });
      }}
      onLogout={async () => {
        gun.user().leave();
        rerender();
      }}
      onDecrypt={async (value, epriv) => {
        setDecrypted({
          ...decrypted,
          [typeof value === "object"
            ? JSON.stringify(value)
            : value]: await SEA.decrypt(value, { epriv })
        });
      }}
      onAddKeys={(pub, priv) => {
        setKeys({ ...keys, [pub]: priv });
      }}
    />
  );
};
