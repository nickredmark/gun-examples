import React, { useEffect, useState } from "react";

import { getPub, getMd, qs } from "nicks-gun-utils";

export const Page = ({ id, base, page, priv, epriv }) => {
  const pub = getPub(id);
  const title = page.title;
  useEffect(() => {
    document.title = title;
  }, [title]);
  const hash = qs({ priv, epriv }, "#");
  const [md, setMd] = useState();
  useEffect(() => setMd(getMd({ pub, hash, base })), [id]);

  if (!md) {
    return <div>Loading...</div>;
  }
  return (
    <div className="page">
      {(!pub || priv) && (
        <a
          className="edit"
          href={`https://gun-preview.nmaro.now.sh?id=${id}${hash}`}
          target="_blank"
        >
          edit
        </a>
      )}
      <h1>{title}</h1>
      <div
        className="markdown"
        dangerouslySetInnerHTML={{
          __html: md.render(page.content || "", {
            sanitize: true
          })
        }}
      />
    </div>
  );
};
