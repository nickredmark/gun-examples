import { Streams } from "./Streams";
import React, { useState, useEffect } from "react";
import { useGun, getPub, getSet, getUUID } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunStreams = ({ id, priv, epriv, legacy, parent }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);
  const messagesId = legacy ? `messages${id}.` : `${id}.messages`;

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(messagesId)
      .on(onData)
      .map()
      .on(onData);
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const stream = {
    ...data[id],
    messages: getSet(data, messagesId)
  };

  return (
    <Streams
      stream={stream}
      id={id}
      priv={priv}
      epriv={epriv}
      parent={parent}
      legacy={legacy}
      onSetStreamName={(nameField, name) => put([id, nameField, name])}
      onCreateMessage={text => {
        const key = getUUID(gun);
        const messageId = legacy ? `${key}${id}.` : `${id}.messages.${key}`;
        put(
          [messageId, "text", text],
          [messageId, "created", +new Date()],
          [messagesId, key, { "#": messageId }],
          [id, "updated", +new Date()],
          [id, "lastUpdate", text]
        );
        return messageId;
      }}
      onUpdateMessage={(id, key, value) => put([id, key, value])}
    />
  );
};
