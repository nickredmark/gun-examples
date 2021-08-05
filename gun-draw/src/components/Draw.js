import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import * as d3 from "d3";

export const Draw = ({ drawing, onCreatePath, onSetTitle }) => {
  const [tool, setTool] = useState("pen");
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [line, setLine] = useState();
  const [color, setColor] = useState("rgb(0, 5, 78)");
  const [editColor, setEditColor] = useState(false);
  const [[cx, cy], setCoordinates] = useState([0, 0]);
  const [[mx, my], setMovementStart] = useState([0, 0]);
  const [[mdx, mdy], setPointerPos] = useState([0, 0]);
  const svg = useRef();

  useEffect(() => {
    d3.selectAll("svg > *").remove();
    for (const path of [...drawing.paths, { color, path: line }].filter(
      path => path.path
    )) {
      let thepath = Array.isArray(path.path)
        ? path.path
        : JSON.parse(path.path);
      const line = d3.line().curve(d3.curveNatural)(
        thepath.map(([x, y]) => [cx + x + mdx - mx, cy + y + mdy - my])
      );
      d3.select(svg.current)
        .append("path")
        .attr("d", line)
        .attr("stroke", path.color || "black")
        .attr("fill", "none")
        .attr("stroke-width", "5")
        .attr("stroke-linecap", "round");
    }
  }, [drawing, line, color, cx, cy, mx, my, mdx, mdy]);

  const down = e => {
    e.preventDefault();
    const [x, y] = getPointerPos(svg.current, e);
    switch (tool) {
      case "pen":
        setLine([[x - cx, y - cy]]);
        break;
      case "hand":
        setMovementStart([x, y]);
        setPointerPos([x, y]);
    }
  };

  const move = e => {
    const [x, y] = getPointerPos(svg.current, e);
    switch (tool) {
      case "pen":
        if (line) {
          setLine([...line, [x - cx, y - cy]]);
        }
        break;
      case "hand":
        if (e.buttons && mx !== undefined && my !== undefined) {
          setPointerPos([x, y]);
        }
    }
  };
  const up = e => {
    switch (tool) {
      case "pen":
        if (line) {
          onCreatePath(JSON.stringify(line), color);
          setLine();
        }
        break;
      case "hand":
        setMovementStart([0, 0]);
        setPointerPos([0, 0]);
        setCoordinates([cx + mdx - mx, cy + mdy - my]);
    }
  };

  return (
    <div className="drawing">
      <div className="drawing-header">
        {editing ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              onSetTitle(newTitle);
              setEditing(false);
            }}
          >
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="title of drawing"
            />
          </form>
        ) : (
          <h1
            onDoubleClick={e => {
              setNewTitle(drawing.title);
              setEditing(true);
            }}
            className="drawing-title"
          >
            {(drawing && drawing.title) || "Set title of drawing"}
          </h1>
        )}
      </div>
      <div className={`drawing-content ${tool}`}>
        <div className="drawing-tools">
          <div className="drawing-buttons">
            <button
              onClick={() => setTool("pen")}
              className={`${tool === "pen" ? "active" : ""}`}
            >
              &#x1F58B;
            </button>
            <button
              onClick={() => setTool("hand")}
              className={`${tool === "hand" ? "active" : ""}`}
            >
              &#x1F91A;
            </button>
            <button
              onClick={() => setEditColor(!editColor)}
              className={`${editColor ? "active" : ""}`}
            >
              <span className="color" style={{ backgroundColor: color }}></span>
            </button>
          </div>
          {editColor && (
            <SketchPicker color={color} onChange={({ hex }) => setColor(hex)} />
          )}
        </div>
        <svg
          ref={svg}
          onTouchStart={down}
          onTouchMove={move}
          onTouchEnd={up}
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
        />
      </div>
    </div>
  );
};

const distance = (a, b) =>
  Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));

const getPointerPos = (ref, e) => {
  const rect = ref.getBoundingClientRect();

  // use cursor pos as default
  let clientX = e.clientX;
  let clientY = e.clientY;

  // use first touch if available
  if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  }

  // return mouse/touch position inside canvas
  return [clientX - rect.left, clientY - rect.top];
};
