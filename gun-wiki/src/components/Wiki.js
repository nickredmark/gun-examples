import React, { useEffect, useState } from "react";
import { stringify } from "qs";

import MD from "markdown-it";
import WikiLinks from "markdown-it-wikilinks";
import { getPub } from "nicks-gun-utils";

const s = (o, p) => {
  const object = {};
  for (const key of Object.keys(o)) {
    if (o[key]) {
      object[key] = o[key];
    }
  }
  const stringified = stringify(object);
  return stringified ? `${p}${stringified}` : "";
};

export const Wiki = ({ id, priv, epriv, document, onPublish }) => {
  const pub = getPub(id);
  const base = pub ? `~${pub}.` : "";
  const title =
    document.title || id.replace(`~${pub}.`, "").replace(`~${pub}`, "");

  useEffect(() => {
    window.document.title = title;
  }, [title]);

  const hash = s({ priv, epriv }, "#");
  const [md, setMd] = useState();
  useEffect(() => {
    const md = MD().use(
      WikiLinks({
        baseURL: `?id=${base}`,
        uriSuffix: hash,
        makeAllLinksAbsolute: true,
        postProcessPageName: pageName => encodeURIComponent(pageName.trim())
      })
    );
    setMd(md);
  }, [id]);

  if (!md) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main">
      <div className="navigation">
        <iframe
          src={`https://gun-pages.nmaro.now.sh?id=${base}navigation&base=${encodeURIComponent(
            window.location.origin
          )}${s({ priv, epriv }, "#")}`}
          frameBorder="0"
        />
      </div>
      <div className="page">
        <iframe
          src={`https://gun-pages.nmaro.now.sh?id=${id}&base=${encodeURIComponent(
            window.location.origin
          )}${s({ priv, epriv }, "#")}`}
          frameBorder="0"
        />
      </div>
    </div>
  );
};
