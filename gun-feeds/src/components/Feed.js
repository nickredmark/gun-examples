import moment from "moment";
import React, { useEffect, useState, useRef } from "react";

import { getPub, qs, getMd, getId } from "nicks-gun-utils";

export const Feed = ({
  id,
  priv,
  epriv,
  feed,
  parent,
  onSetFeedName,
  onAddSub,
  onDeleteSub
}) => {
  const pub = getPub(id);
  const editable = !pub || !!priv;
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [md, setMd] = useState();
  const isWritable = !pub || !!priv;

  useEffect(() => {
    if (feed.name) {
      window.document.title = feed.name;
    }
  }, [feed.name]);

  const hash = qs({ priv, epriv }, "#");
  useEffect(() => {
    setMd(getMd({ pub, hash }));
  }, [id]);

  if (!md) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <header>
        {editing ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              onSetFeedName(newName);
              setEditing(false);
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="feed name"
            />
          </form>
        ) : (
          <h1
            className={editable ? "editable" : ""}
            onDoubleClick={
              editable
                ? () => {
                    setNewName(document.name);
                    setEditing(true);
                  }
                : undefined
            }
          >
            {feed.name || "unnamed"}
            <a
              className="feed-permalink"
              href={`${qs({ id }, "?")}${qs({ epriv }, "#")}`}
              target="_blank"
              onClick={e => {
                e.preventDefault();
                navigator.clipboard.writeText(
                  `${location.origin}${qs({ id }, "?")}${qs({ epriv }, "#")}`
                );
                alert("Readonly URL copied to clipboard!");
              }}
            >
              #
            </a>
          </h1>
        )}
      </header>
      <main>
        <div className="content">
          <ul>
            {feed.subs
              .filter(sub => sub.sub)
              .sort(subComparator)
              .map(({ origin, sub, epriv, priv, legacy }) => {
                const id = getId(sub);
                const url = `${origin}${qs({ id, legacy }, "?")}${qs(
                  { epriv, priv },
                  "#"
                )}`;
                return (
                  <li key={id} className="sub-item-li">
                    <a
                      href={url}
                      target="_blank"
                      className="sub-item"
                      onClick={e => {
                        if (parent) {
                          e.preventDefault();
                          window.parent.postMessage(
                            {
                              type: "open-child",
                              url,
                              name: window.name
                            },
                            parent
                          );
                        }
                      }}
                    >
                      <span className="sub-item-name">
                        {sub.name || sub.title}
                      </span>
                      <span className="sub-item-date">
                        {formatTime(getSubTimestamp(sub))}
                      </span>
                      <span className="sub-item-last-message">
                        {formatLastUpdate(
                          sub.lastUpdate ||
                            (sub.lastMessage && sub.lastMessage.text)
                        )}
                      </span>
                    </a>
                    {isWritable && (
                      <a
                        className="sub-item-remove"
                        onClick={() => onDeleteSub(id)}
                      >
                        X
                      </a>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </main>
      {isWritable && <AddSub onAddSub={onAddSub} />}
    </>
  );
};

export const AddSub = ({ onAddSub }) => {
  const url = useRef(null);
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        onAddSub(url.current.value);
        url.current.value = "";
      }}
    >
      <input ref={url} placeholder="new feed url" className="new-sub" />
    </form>
  );
};

const formatTime = timestamp => {
  if (moment().subtract(2, "day") < moment(timestamp)) {
    return moment(timestamp).fromNow();
  }

  if (moment().subtract(7, "day") < moment(timestamp)) {
    return moment(timestamp).format("dddd");
  }

  return moment(timestamp).format("YYYY/MM/DD");
};

const getSubTimestamp = sub => sub.updated || sub.created;

const subComparator = (a, b) => getSubTimestamp(b.sub) - getSubTimestamp(a.sub);

export const formatLastUpdate = lastUpdate => {
  if (!lastUpdate) {
    return "";
  }

  if (typeof lastUpdate !== "string") {
    return "[unknown message format]";
  }

  if (/^data:image\//.exec(lastUpdate)) {
    return "[image]";
  }
  if (/^data:/.exec(lastUpdate)) {
    return "[attachment]";
  }
  if (
    /youtube\.com\/watch/.exec(lastUpdate) ||
    /youtu\.be\//.exec(lastUpdate)
  ) {
    return "[youtube video]";
  }
  if (/twitter.com\/\w+\/status\/\d+/.exec(lastUpdate)) {
    return "[twitter status]";
  }
  if (/^(\.+|-+|\*+|~+)$/.exec(lastUpdate)) {
    return "[end]";
  }

  const LENGTH = 50;
  if (lastUpdate.length > LENGTH) {
    return `${lastUpdate.substr(0, LENGTH)}...`;
  }

  return lastUpdate;
};
