import React, { useState, useRef, useEffect } from "react";
import diff from "fast-diff";
import { getPub, getId } from "nicks-gun-utils";

export const Outliner = ({
  id,
  document,
  onSetDocumentTitle,
  onAddAtom,
  onDeleteAtom
}) => {
  const pub = getPub(id);
  const title =
    (document && document.title) ||
    id.replace(`~${pub}.`, "").replace(`~${pub}`);
  const [editing, setEditing] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const ref = useRef(null);
  const newContent = document.atoms.map(atom => atom.atom).join("");
  const [content, setContent] = useState(newContent);

  useEffect(() => {
    if (ref.current && newContent !== content) {
      const [selectionStart, selectionEnd] = [
        "selectionStart",
        "selectionEnd"
      ].map(key => {
        const value = ref.current[key];
        let index = 0;
        let movement = 0;
        thefor: for (const [action, part] of diff(content, newContent)) {
          switch (action) {
            case diff.INSERT:
              movement += part.length;
              break;
            case diff.EQUAL:
              if (value < index + part.length) {
                break thefor;
              }
              break;
            case diff.DELETE:
              if (value < index + part.length) {
                movement -= value - index;
                break thefor;
              }

              movement -= part.length;
              index += part.length;
              break;
          }
        }
        return ref.current[key] + movement;
      });
      ref.current.value = newContent;
      ref.current.selectionStart = selectionStart;
      ref.current.selectionEnd = selectionEnd;
      setContent(newContent);
    }
  }, [ref, newContent]);

  return (
    <div className="document">
      {editing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            onSetDocumentTitle(newDocumentTitle);
            setEditing(false);
          }}
        >
          <input
            autoFocus
            value={newDocumentTitle}
            onChange={e => setNewDocumentTitle(e.target.value)}
            placeholder="document title"
          />
        </form>
      ) : (
        <h1
          onDoubleClick={e => {
            setNewDocumentTitle(document.title);
            setEditing(true);
          }}
          className="document-title"
        >
          {title}
        </h1>
      )}
      <textarea
        className="document-content"
        ref={ref}
        onChange={e => {
          setContent(e.target.value);
          let index = 0;
          for (const [action, part] of diff(
            content,
            e.target.value,
            ref.current.cursorIndex
          )) {
            switch (action) {
              case diff.INSERT:
                for (const character of part) {
                  onAddAtom(
                    character,
                    document.atoms[index - 1],
                    document.atoms[index]
                  );
                }
                break;
              case diff.EQUAL:
                index += part.length;
                break;
              case diff.DELETE:
                for (let i = 0; i < part.length; i++) {
                  onDeleteAtom(getId(document.atoms[index + i]));
                }
                index += part.length;
                break;
            }
          }
        }}
        defaultValue={content}
        autoFocus
      />
    </div>
  );
};
