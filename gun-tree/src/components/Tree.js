import React, { useState } from "react";
import { getId } from "nicks-gun-utils";

export const Tree = ({ tree }) => {
  return (
    <div>
      <h1>{tree.title || "untitled"}</h1>
      <ul>
        {tree.items.map(item => (
          <Item key={getId(item)} item={item} tree={tree} />
        ))}
      </ul>
    </div>
  );
};

const Item = ({ item, tree }) => {
  const [expanded, setExpanded] = useState(false);
  const expandable = item.relationships && item.relationships.length;
  return (
    <li>
      <a
        href={expandable ? "#" : undefined}
        onClick={e => {
          e.preventDefault();
          expandable && setExpanded(!expanded);
        }}
      >
        {item.name}
      </a>
      {expanded && (
        <ul>
          {item.relationships.map(subItem => (
            <Item
              key={getId(subItem)}
              item={tree.items.find(si => getId(si) === getId(subItem))}
              tree={tree}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
