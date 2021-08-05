import React, { useEffect, useRef, useState } from "react";
import { getPub, qs, getId, getMd } from "nicks-gun-utils";
import ReactPlayer from "react-player";
import { Tweet } from "./Tweet";

export const StreamSearch = ({
  id,
  search,
  stems,
  priv,
  epriv,
  messagesByStem
}) => {
  const pub = getPub(id);
  const [md, setMd] = useState();

  useEffect(() => {
    const hash = qs({ priv, epriv }, "#");
    setMd(getMd({ pub, hash }));
  }, [priv]);

  useEffect(() => {}, [search]);

  if (!md) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <h1 className="search">{search}</h1>
      <div className="words">
        {stems
          .filter(stem => (messagesByStem[stem] || []).length > 1)
          .sort((a, b) => messagesByStem[a].length - messagesByStem[b].length)
          .map(stem => (
            <Word
              key={stem}
              stem={stem}
              messagesByStem={messagesByStem}
              md={md}
            />
          ))}
      </div>
    </main>
  );
};

const Word = ({ stem, messagesByStem, md }) => {
  return (
    <div>
      <h2 className="word">
        {stem} ({messagesByStem[stem].length})
      </h2>
      <ul className="messages">
        {messagesByStem[stem]
          // .filter(related => related !== message)
          .map(related => (
            <li key={getId(related)} className="message">
              <MessageContent message={related} md={md} />
            </li>
          ))}
      </ul>
    </div>
  );
};

export const MessageContent = ({ message, md }) => {
  if (/^data:image\//.exec(message.text)) {
    return <img src={message.text} />;
  }
  if (/^data:/.exec(message.text)) {
    return (
      <a href={message.text} target="_blank">
        [unknown attachment]
      </a>
    );
  }
  if (
    /^(https?:\/\/(www\.)?)?youtube\.com\/watch/.exec(message.text) ||
    /^(https?:\/\/(www\.)?)?youtu\.be\//.exec(message.text)
  ) {
    return (
      <div className="player-wrapper">
        <ReactPlayer
          className="react-player"
          url={message.text}
          width="100%"
          height="100%"
        />
      </div>
    );
  }
  if (/twitter.com\/\w+\/status\/\d+/.exec(message.text)) {
    return <Tweet url={message.text.split("/").pop()} />;
  }
  if (/^(\.+|-+|\*+|~+)$/.exec(message.text)) {
    return <hr />;
  }
  if (/^(https?:\/\/|www)/.exec(message.text)) {
    return (
      <a
        href={message.text}
        style={{
          color: "inherit"
        }}
        target="_blank"
      >
        {message.text}
      </a>
    );
  }

  if (typeof message.text === "string") {
    return (
      <span
        style={{
          ...(message.highlighted && {
            fontWeight: "bold"
          })
        }}
        dangerouslySetInnerHTML={{
          __html: message.text && md.render(message.text)
        }}
      />
    );
  }

  return "[unknown message format]";
};
