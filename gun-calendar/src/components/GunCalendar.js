import { Calendar } from "./Calendar";
import React, { useState, useEffect } from "react";
import { useGun, getUUID, getPub, getSet } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunCalendar = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);

  useEffect(() => {
    const gun = Gun({
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.events`)
      .on(onData)
      .map()
      .on(onData);
    setGun(gun);
  }, []);

  if (!gun) {
    return <div>Loading...</div>;
  }

  const calendar = {
    ...data[id],
    events: getSet(data, `${id}.events`).sort((a, b) => a.start - b.start)
  };

  return (
    <Calendar
      calendar={calendar}
      id={id}
      onCreateEvent={(start, title) => {
        const key = getUUID(gun);
        const eventId = `${id}.events.${key}`;
        put(
          [eventId, "start", start],
          [eventId, "title", title],
          [`${id}.events`, key, { "#": eventId }],
          [id, "updated", +new Date()],
          [id, "lastUpdate", title]
        );
      }}
      onSetCalendarTitle={title => put([id, "title", title])}
      onUpdateEvent={(id, key, value) => put([id, key, value])}
    />
  );
};
