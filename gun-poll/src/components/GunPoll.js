import { Poll } from "./Poll";
import React, { useState, useEffect } from "react";
import uuid from "uuid/v4";
import { getPub, useGun, getUUID, getSet, getId } from "nicks-gun-utils";

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunPoll = ({ id, priv, epriv }) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && priv && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);
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
      peers: ["https://gunjs.herokuapp.com/gun", "http://nmr.io:8765/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(`${id}.answers`)
      .on(onData)
      .map()
      .on(onData)
      .once(answer => {
        const answerId = getId(answer);
        gun.get(`${answerId}.votes`).on(onData);
        gun
          .get(`${answerId}.comments`)
          .on(onData)
          .map()
          .on(onData);
      });
    setGun(gun);
  }, []);

  if (!gun || !token) {
    return <div>Loading...</div>;
  }

  const poll = {
    ...data[id],
    answers: getSet(data, `${id}.answers`)
      .map(answer => {
        const answerId = getId(answer);
        const res = {
          ...answer,
          votes: { ...data[`${answerId}.votes`] },
          comments: getSet(data, `${answerId}.comments`)
        };
        res.voteCount = Object.keys(res.votes)
          .filter(key => key !== "_")
          .map(key => res.votes[key])
          .filter(Boolean).length;
        return res;
      })
      .sort((a, b) => b.voteCount - a.voteCount)
  };

  return (
    <Poll
      getId={getId}
      poll={poll}
      id={id}
      token={token}
      onCreateAnswer={content => {
        const key = getUUID(gun);
        const answerId = `${id}.answers.${key}`;
        put(
          [answerId, "content", content],
          [`${id}.answers`, key, { "#": answerId }],
          [id, "updated", +new Date()],
          [id, "lastUpdate", content]
        );
      }}
      onCreateComment={(answerId, content) => {
        const key = getUUID(gun);
        const commentId = `${answerId}.comments.${key}`;
        put(
          [commentId, "content", content],
          [`${answerId}.comments`, key, { "#": commentId }]
        );
      }}
      onVote={(answerId, vote) => put([`${answerId}.votes`, token, vote])}
      onSetPollTitle={title => put([id, "title", title])}
    />
  );
};
