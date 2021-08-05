import React, { useEffect, useRef, useState } from "react";
import { getPub, qs, getId, getMd } from "nicks-gun-utils";
import ReactPlayer from "react-player";
import { Tweet } from "./Tweet";
import dragDrop from "drag-drop";

const nameFields = ["name", "title", "text"];

export const Streams = ({
  id,
  stream,
  priv,
  epriv,
  parent,
  legacy,
  onSetStreamName,
  onUpdateMessage,
  onCreateMessage
}) => {
  const pub = getPub(id);
  const editable = !pub || !!priv;
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [md, setMd] = useState();
  const [{ messageId, view }, setFocus] = useState(false);
  const message = stream.messages.find(m => getId(m) === messageId);

  let name = stream.name;
  let nameField = "name";
  for (const nf of nameFields) {
    if (stream[nf]) {
      name = stream[nf];
      nameField = nf;
      break;
    }
  }
  if (!name) {
    name = id.replace(`~${pub}.`, "").replace(`~${pub}`, "") || "Stream";
  }
  useEffect(() => {
    document.title = name;
  }, [name]);
  const hash = qs({ priv, epriv }, "#");
  useEffect(() => {
    setMd(getMd({ pub, hash }));
    if (priv) {
      dragDrop("body", async files => {
        for (const file of files) {
          const message = await toBase64(file);
          if (message.length > 1000000) {
            throw new Error(`File too large: ${message.length}`);
          }
          setMessageId(onCreateMessage(message));
        }
      });
    }
  }, [priv]);

  useEffect(() => {
    if (parent && message && view) {
      switch (view) {
        case "search":
          window.parent.postMessage(
            {
              name: window.name,
              type: "open-child",
              url: `https://nmaro.now.sh/gun-stream-search/${qs(
                { id, search: message.text, legacy },
                "?"
              )}${hash}`,
              message: {
                type: "search",
                search: message.text
              }
            },
            parent
          );
          break;
        case "stream":
          window.parent.postMessage(
            {
              name: window.name,
              type: "open-child",
              url: `https://nmaro.now.sh/gun-streams/${qs(
                { id: getId(message) },
                "?"
              )}${hash}`
            },
            parent
          );
          break;
      }
    }
  }, [messageId, view]);

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
              onSetStreamName(nameField, newName);
              setEditing(false);
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="stream name"
            />
          </form>
        ) : (
          <h1
            className={editable ? "editable" : ""}
            onDoubleClick={
              editable &&
              (() => {
                setNewName(document.name);
                setEditing(true);
              })
            }
          >
            {name}
            <a
              className="stream-permalink"
              href={`?id=${id}${qs({ epriv }, "#")}`}
              target="_blank"
              onClick={e => {
                e.preventDefault();
                navigator.clipboard.writeText(
                  `${location.origin}?id=${id}${qs({ epriv }, "#")}`
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
          {stream.messages
            .filter(
              message => message.text !== null && message.text !== undefined
            )
            .map(message => {
              const id = getId(message);
              return (
                <MessageComponent
                  key={id}
                  id={id}
                  message={message}
                  editable={editable}
                  onUpdateMessage={onUpdateMessage}
                  selected={messageId === id}
                  onSelect={view => setFocus({ messageId: id, view })}
                  md={md}
                />
              );
            })}
        </div>
      </main>
      {editable && (
        <NewMessage
          onCreateMessage={text =>
            setFocus({ view: "search", messageId: onCreateMessage(text) })
          }
        />
      )}
    </>
  );
};

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

const MessageComponent = ({
  id,
  message,
  editable,
  onUpdateMessage,
  md,
  selected,
  onSelect
}) => {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.scrollIntoView();
  }, []);

  return (
    <div
      id={id}
      className={`message ${selected ? "selected" : ""}`}
      ref={ref}
      onClick={() => onSelect("stream")}
      onDoubleClick={() => onSelect("search")}
    >
      <a id={id} />
      <MessageContent message={message} md={md} />
      <div className="message-meta">
        {editable && (
          <a
            href="#"
            className="message-permalink"
            style={{
              marginLeft: "0.25rem",
              color: "lightgray",
              textDecoration: "none",
              fontSize: "0.8rem"
            }}
            onClick={e => {
              e.preventDefault();
              onUpdateMessage(id, "highlighted", !message.highlighted);
            }}
          >
            !
          </a>
        )}
      </div>
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

export const NewMessage = ({ onCreateMessage }) => {
  const text = useRef(null);
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        onCreateMessage(text.current.value);
        text.current.value = "";
      }}
    >
      <input
        ref={text}
        placeholder="new thought"
        style={{
          width: "100%",
          padding: "1rem",
          borderRadius: "none",
          border: "none",
          borderTop: "1px solid lightgray"
        }}
      />
    </form>
  );
};
