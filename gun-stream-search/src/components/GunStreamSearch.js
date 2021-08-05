import { StreamSearch } from "./StreamSearch";
import React, { useState, useEffect } from "react";
import { useGun, getPub, getSet, getUUID } from "nicks-gun-utils";
import { WordTokenizer, PorterStemmer } from "natural";
import { uniq } from "lodash";

// const commonWords = require("../../etc/customwords.json");
const tokenizer = new WordTokenizer();

const Gun = require("gun/gun");
require("gun/sea");
require("gun/lib/radix");
require("gun/lib/radisk");
require("gun/lib/store");
require("gun/lib/rindexed");

export const GunStreamSearch = ({
  id,
  search: initialSearch,
  priv,
  epriv,
  legacy
}) => {
  const [gun, setGun] = useState(null);
  const pub = getPub(id);
  const pair = pub && { pub, priv, epriv };
  const [data, onData, put] = useGun(Gun, gun, useState, pair);
  const messagesId = legacy ? `messages${id}.` : `${id}.messages`;
  const [search, setSearch] = useState(initialSearch);
  const [stems, setStems] = useState();

  useEffect(() => {
    const gun = Gun({
      localStorage: false,
      peers: ["http://nmr.io:8765/gun", "https://gunjs.herokuapp.com/gun"]
    });
    gun.get(id).on(onData);
    gun
      .get(messagesId)
      .on(onData)
      .map()
      .on(onData);
    setGun(gun);
  }, []);

  useEffect(() => {
    const onMessage = e => {
      switch (e.data.type) {
        case "search":
          setSearch(e.data.search);
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (search) {
      setStems(getStems(search));
    }
  }, [search]);

  if (!gun || !stems) {
    return <div>Loading...</div>;
  }

  const stream = {
    ...data[id],
    messages: getSet(data, messagesId)
  };

  const messagesByStem = {};

  for (const message of stream.messages) {
    if (!message.stems) {
      message.stems = getStems(message.text);
    }
    for (const stem of getStems(message.text)) {
      if (!messagesByStem[stem]) {
        messagesByStem[stem] = [];
      }
      messagesByStem[stem].push(message);
    }
  }

  return (
    <StreamSearch
      stream={stream}
      id={id}
      search={search}
      stems={stems}
      priv={priv}
      epriv={epriv}
      messagesByStem={messagesByStem}
    />
  );
};

const getStems = text =>
  uniq(
    tokenizer
      .tokenize(typeof text === "string" ? text : "")
      .map(token => PorterStemmer.stem(token))
      .filter(word => word.length > 2)
    // .filter(word => !commonWords.includes(word) && word.length > 3)
  );
