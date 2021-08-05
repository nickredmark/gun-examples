import React, { useState, useRef } from "react";
import { getPub } from "../utils";

export const Inspector = ({
  nodes,
  subscribed,
  decrypted,
  onSetValue,
  onCreateSubNode,
  onSubscribe,
  onCreateNode,
  onCreateProtectedNode,
  keys,
  onDecrypt,
  onAddKeys,
  user,
  onLogin,
  onLogout
}) => {
  const newSubscription = useRef(null);
  return (
    <div>
      <h1>GUN Data Inspector</h1>
      <h2>Nodes</h2>
      {subscribed.length > 0 && (
        <div className="nodes">
          {subscribed.map(id => (
            <Node
              key={id}
              id={id}
              keys={keys}
              nodes={nodes}
              onDecrypt={onDecrypt}
              decrypted={decrypted}
              onSetValue={onSetValue}
              onCreateSubNode={onCreateSubNode}
              onSubscribe={onSubscribe}
            />
          ))}
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubscribe(newSubscription.current.value, true);
          newSubscription.current.value = "";
        }}
      >
        <input ref={newSubscription} placeholder="insert any GUN id" />
      </form>
      or
      <div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onCreateNode();
          }}
        >
          Create new node
        </a>
      </div>
      or
      <div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onCreateProtectedNode();
          }}
        >
          Create new protected node
        </a>
      </div>
      <Keys keys={keys} onAddKeys={onAddKeys} />
      <Login user={user} onLogin={onLogin} onLogout={onLogout} />
    </div>
  );
};

export const Node = ({
  id,
  nodes,
  decrypted,
  keys,
  onDecrypt,
  onSetValue,
  onSubscribe,
  onCreateSubNode
}) => {
  const node = nodes[id] || {};
  const newKey = useRef(null);
  const newValue = useRef(null);
  const newSubNodeKey = useRef(null);
  const newSubNodeId = useRef(null);

  return (
    <div className="node">
      <div className="node-id">{`"${id}": {`}</div>
      <div className="node-attributes">
        {Object.keys(node).length > 0 && (
          <div className="node-fixed-attributes">
            {Object.keys(node)
              .filter(key => key !== "_")
              .map(key =>
                node[key] && typeof node[key] === "object" && node[key]["#"] ? (
                  <div key={key} className="reference-attribute">
                    <div className="key">{`"${key}" ->`}</div>
                    <Reference
                      decrypted={decrypted}
                      reference={node[key]}
                      onDecrypt={onDecrypt}
                      keys={keys}
                      onSubscribe={onSubscribe}
                      nodes={nodes}
                      onSetValue={onSetValue}
                      onCreateSubNode={onCreateSubNode}
                    />
                  </div>
                ) : (
                  <div key={key} className="attribute">
                    <div className="key">{`"${key}": `}</div>
                    <Value
                      value={node[key]}
                      decrypted={decrypted}
                      keys={keys}
                      onDecrypt={onDecrypt}
                      onSetValue={(value, epriv) =>
                        onSetValue(id, key, value, epriv)
                      }
                    />
                  </div>
                )
              )}
          </div>
        )}
        {getPub(id) && !keys[getPub(id)] ? (
          <span className="disabled">Can't edit this object without priv</span>
        ) : (
          <>
            <form
              className="new-attribute"
              onSubmit={e => {
                e.preventDefault();
                onSetValue(id, newKey.current.value, newValue.current.value);
                newKey.current.value = "";
                newValue.current.value = "";
              }}
            >
              "
              <input
                className="new-attribute-key"
                ref={newKey}
                placeholder="key"
              />
              ": "
              <input
                className="new-attribute-value"
                ref={newValue}
                placeholder="value"
              />
              "
              <input
                type="submit"
                style={{ visibility: "hidden", width: "0" }}
              />
              {Object.keys(keys).length > 0 && (
                <span>
                  {" "}
                  encrypt with{" "}
                  {Object.keys(keys).map(pub => (
                    <span key={pub}>
                      <a
                        href="#"
                        className="encrypt-pub"
                        onClick={e => {
                          e.preventDefault();
                          onSetValue(
                            id,
                            newKey.current.value,
                            newValue.current.value,
                            keys[pub]
                          );
                          newKey.current.value = "";
                          newValue.current.value = "";
                        }}
                      >
                        {pub.substr(0, 5)}...
                      </a>{" "}
                    </span>
                  ))}
                </span>
              )}
            </form>
            <form
              className="new-attribute"
              onSubmit={e => {
                e.preventDefault();
                onCreateSubNode(
                  id,
                  newSubNodeKey.current.value,
                  newSubNodeId.current.value
                );
                newSubNodeKey.current.value = "";
                newSubNodeId.current.value = "";
              }}
            >
              "
              <input
                className="new-attribute-key"
                ref={newSubNodeKey}
                placeholder="key"
              />
              {'" -> '}
              <input
                className="new-attribute-value"
                ref={newSubNodeId}
                placeholder="id"
              />
              <input
                type="submit"
                style={{ visibility: "hidden", width: "0" }}
              />
            </form>
          </>
        )}
      </div>
      <div>}</div>
    </div>
  );
};

const Value = ({ value, onSetValue, decrypted, keys, onDecrypt }) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState("");

  let decryptable = false;
  let actualValue = value;
  if (
    typeof actualValue === "object" ||
    (typeof actualValue === "string" && actualValue.startsWith("SEA{"))
  ) {
    if (typeof actualValue === "object") {
      actualValue = JSON.stringify(actualValue);
    }
    if (decrypted[actualValue] !== undefined) {
      actualValue = decrypted[actualValue];
    } else {
      decryptable = true;
    }
  }
  if (typeof actualValue === "object") {
    actualValue = JSON.stringify(actualValue);
  }

  return (
    <div
      className="value"
      onDoubleClick={() => {
        if (editing) {
          return;
        }
        setNewValue(actualValue);
        setEditing(true);
      }}
      onKeyDown={e => {
        if (e.keyCode === 27) {
          setEditing(false);
        }
      }}
    >
      {editing ? (
        <form
          className="edit-value"
          onSubmit={e => {
            e.preventDefault();
            onSetValue(newValue);
            setEditing(false);
          }}
        >
          "
          <input
            autoFocus
            className="value-input"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder="value"
          />
          "
          {Object.keys(keys).length > 0 && (
            <span>
              {" "}
              encrypt with{" "}
              {Object.keys(keys).map(pub => (
                <span key={pub}>
                  <a
                    href="#"
                    className="encrypt-pub"
                    onClick={e => {
                      e.preventDefault();
                      onSetValue(newValue, keys[pub]);
                      setEditing(false);
                    }}
                  >
                    {pub.substr(0, 5)}...
                  </a>{" "}
                </span>
              ))}
            </span>
          )}
        </form>
      ) : (
        <span>"{actualValue}"</span>
      )}
      {decryptable && !editing && Object.keys(keys).length > 0 && (
        <span>
          {" "}
          decrypt with{" "}
          {Object.keys(keys).map(pub => (
            <span key={pub}>
              <a
                href="#"
                className="decrypt-pub"
                onClick={e => {
                  e.preventDefault();
                  onDecrypt(value, keys[pub]);
                }}
              >
                {pub.substr(0, 5)}...
              </a>{" "}
            </span>
          ))}
        </span>
      )}
    </div>
  );
};

const Reference = ({
  reference,
  onSubscribe,
  nodes,
  keys,
  onDecrypt,
  onSetValue,
  onCreateSubNode,
  decrypted
}) => {
  if (!reference) {
    return <div>deleted</div>;
  }
  const id = reference["#"];
  const [open, setOpen] = useState(false);

  return (
    <div className="reference">
      {open ? (
        <Node
          id={id}
          nodes={nodes}
          keys={keys}
          onDecrypt={onDecrypt}
          decrypted={decrypted}
          onSetValue={onSetValue}
          onCreateSubNode={onCreateSubNode}
          onSubscribe={onSubscribe}
        />
      ) : (
        <a
          href="#"
          className="reference-link"
          onClick={e => {
            e.preventDefault();
            setOpen(true);
            onSubscribe(id);
          }}
        >
          {id}
        </a>
      )}
    </div>
  );
};

const Keys = ({ keys, onAddKeys }) => {
  const pub = useRef();
  const priv = useRef();

  return (
    <div>
      <h2>Keys</h2>
      {Object.keys(keys).map(pub => (
        <Pair key={pub} pub={pub} priv={keys[pub]} />
      ))}
      <form
        className="add-keys"
        onSubmit={e => {
          e.preventDefault();
          onAddKeys(pub.current.value, priv.current.value);
        }}
      >
        <input ref={pub} placeholder="pub" />
        <input ref={priv} placeholder="priv" />
        <button type="submit">Add key pair</button>
      </form>
    </div>
  );
};

export const Pair = ({ priv, pub }) => {
  const [see, setSee] = useState(false);
  return (
    <div className="pair">
      <div className="pub">
        <b>Pub:</b> {pub}
      </div>
      <div className="priv">
        <b>Priv:</b>{" "}
        <span onClick={() => setSee(!see)}>{see ? priv : "*********"}</span>
      </div>
    </div>
  );
};

export const Login = ({ user, onLogin, onLogout }) => {
  const alias = useRef();
  const password = useRef();
  return (
    <div>
      <h2>User</h2>
      {user ? (
        <div>
          {user.alias}
          <div>
            <button onClick={onLogout}>Log out</button>
          </div>
        </div>
      ) : (
        <div>
          <form
            className="auth"
            onSubmit={e => {
              e.preventDefault();
              onLogin(alias.current.value, password.current.value);
            }}
          >
            <input ref={alias} placeholder="alias" />
            <input ref={password} type="password" placeholder="******" />
            <button type="submit">Log in</button>
            <button type="submit">Sign up</button>
          </form>
        </div>
      )}
    </div>
  );
};
