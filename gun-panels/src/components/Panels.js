import React, { useState, useEffect, useRef } from "react";

export const Panels = ({ url }) => {
  const [frames, setFrames] = useState([{ url }]);
  useEffect(() => {
    const onMessage = e => {
      switch (e.data.type) {
        case "open-child":
          setFrames(frames => {
            const frame = +e.data.name.substr(6);
            const newFrames = frames.slice(0, frame + 1);
            let url = e.data.url;
            if (e.data.message && frames[frame + 1]) {
              const urlObject = new URL(url);
              const frameUrlObject = new URL(frames[frame + 1].url);
              if (
                urlObject.origin + urlObject.pathname ===
                frameUrlObject.origin + frameUrlObject.pathname
              ) {
                url = frames[frame + 1].url;
              }
            }
            newFrames.push({ url, message: e.data.message });
            return newFrames;
          });
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <div className="panels">
      {frames.map(({ url, message }, i) => (
        <Panel key={i} url={url} message={message} i={i} />
      ))}
    </div>
  );
};

const Panel = ({ url, message, i }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && message) {
      ref.current.contentWindow.postMessage(message, new URL(url).origin);
    }
  }, [ref.current, message]);
  return (
    <div className="panel">
      <iframe
        ref={ref}
        name={`panel-${i}`}
        src={url + `&parent=${window.location.origin}`}
        frameBorder="0"
      ></iframe>
    </div>
  );
};
