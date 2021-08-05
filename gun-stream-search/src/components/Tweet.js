import React, { useRef, useEffect } from "react";

const script = require("scriptjs");

export const Tweet = ({ url }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      script(
        "https://platform.twitter.com/widgets.js",
        "twitter-embed",
        async () => {
          await window.twttr.widgets.createTweet(url, ref.current, {
            conversation: "none"
          });
        }
      );
    }
  }, [ref.current]);

  return <div ref={ref}></div>;
};
