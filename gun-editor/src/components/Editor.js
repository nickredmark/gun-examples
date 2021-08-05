import React, { useState, useRef, useEffect } from "react";
import diff from "fast-diff";
import { getPub } from "nicks-gun-utils";

export const Editor = ({
  id,
  document,
  onSetDocumentTitle,
  onContent,
  timeout
}) => {
  const pub = getPub(id);
  const title =
    (document && document.title) ||
    id.replace(`~${pub}.`, "").replace(`~${pub}`);
  const [editing, setEditing] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");

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
          onDoubleClick={() => {
            setNewDocumentTitle(document.title);
            setEditing(true);
          }}
          className="document-title"
        >
          {title}
        </h1>
      )}
      <OuterBufferEditor
        atoms={document.atoms}
        content={document.content}
        onContent={onContent}
        timeout={timeout}
      />
    </div>
  );
};

// Notify inner changes after timeout since last inner change
// Apply outer changes after timeout since last outer change or change notification
const OuterBufferEditor = ({ atoms, content, timeout, onContent }) => {
  const [dirty, setDirty] = useState(false);
  const [[innerAtoms, innerContent], setInnerContent] = useState([
    atoms,
    content
  ]);
  useEffect(() => {
    if (dirty) {
      return;
    }
    // just went from dirty to clean, or content changed
    setInnerContent([atoms, content]);
  }, [content, dirty]);
  return (
    <BufferedEditor
      content={innerContent}
      onDirty={() => setDirty(true)}
      timeout={timeout}
      onContent={(newContent, cursor) => {
        onContent(innerAtoms, innerContent, newContent, cursor);
        setDirty(false);
      }}
    />
  );
};

// Immediately applies outer changes
// Notifies dirty
// Notifies inner changes after timeout since last inner change
const BufferedEditor = ({ content, onDirty, onContent, timeout }) => {
  const [[newContent, cursor], set] = useState([content]);
  useEffect(() => {
    if (newContent === content) {
      return;
    }
    const handler = setTimeout(() => onContent(newContent, cursor), timeout);
    return () => clearTimeout(handler);
  }, [newContent]);
  return (
    <RealTimeEditor
      content={content}
      onContent={(content, cursor) => {
        onDirty();
        set([content, cursor]);
      }}
    />
  );
};

// Immediately applies and notifies changes
const RealTimeEditor = ({ content, onContent }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref) {
      return;
    }

    const [selectionStart, selectionEnd] = [
      "selectionStart",
      "selectionEnd"
    ].map(key => {
      const value = ref.current[key];
      let index = 0;
      let movement = 0;
      thefor: for (const [action, part] of diff(ref.current.value, content)) {
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
      return (ref.current[key] += movement);
    });
    ref.current.value = content;
    ref.current.selectionStart = selectionStart;
    ref.current.selectionEnd = selectionEnd;
  }, [ref, content]);

  return (
    <textarea
      className="document-content"
      ref={ref}
      defaultValue={content}
      onChange={e =>
        onContent(
          e.target.value,
          ref.current.cursorIndex,
          ref.current.selectionStart,
          ref.current.selectionEnd
        )
      }
      autoFocus
    />
  );
};
