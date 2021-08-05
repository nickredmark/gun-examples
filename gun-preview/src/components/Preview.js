import React, { useEffect, useState } from "react";

import { getPub, qs, getMd } from "nicks-gun-utils";

export const Preview = ({ id, priv, epriv, document, onPublish }) => {
  const pub = getPub(id);
  const title =
    document.title || id.replace(`~${pub}.`, "").replace(`~${pub}`, "");

  useEffect(() => {
    window.document.title = title;
  }, [title]);

  const hash = qs({ priv, epriv }, "#");
  const [md, setMd] = useState();
  useEffect(() => setMd(getMd({ pub, hash })), [id]);

  if (!md) {
    return <div>Loading...</div>;
  }

  return (
    <div className="document">
      <div className="editor">
        <iframe
          src={`https://gun-editor.nmaro.now.sh?id=${id}${hash}`}
          frameBorder="0"
        />
      </div>
      <div className="preview">
        <span>preview</span>
        <h1>{title}</h1>
        <div
          className="markdown"
          dangerouslySetInnerHTML={{
            __html: md.render(document.atoms.map(atom => atom.atom).join(""), {
              sanitize: true
            })
          }}
        />
        <div className="controls">
          <button onClick={onPublish}>Publish</button>
        </div>
      </div>
      <div className="public">
        <div>
          {priv ? (
            <>
              <span>
                <a
                  href={`https://gun-pages.nmaro.now.sh?id=${id}${qs(
                    { epriv },
                    "#"
                  )}`}
                  target="_blank"
                >
                  public url
                </a>
              </span>{" "}
              <span>
                <a
                  href={`https://gun-pages.nmaro.now.sh?id=${id}${hash}`}
                  target="_blank"
                >
                  editable url
                </a>
              </span>
            </>
          ) : (
            <span>
              <a
                href={`https://gun-pages.nmaro.now.sh?id=${id}${hash}`}
                target="_blank"
              >
                public url
              </a>
            </span>
          )}
        </div>
        <iframe
          src={`https://gun-pages.nmaro.now.sh?id=${id}${qs({ epriv }, "#")}`}
          frameBorder="0"
        />
      </div>
    </div>
  );
};
