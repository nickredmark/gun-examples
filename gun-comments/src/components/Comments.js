import React, { useState } from "react";

export const Comments = ({ commentable, getId, onCreateComment }) => {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="comments">
      {commentable.comments.map(comment => (
        <Comment key={getId(comment)} id={getId(comment)} comment={comment} />
      ))}
      <div className="new-comment">
        <form
          onSubmit={e => {
            e.preventDefault();
            onCreateComment(newComment);
            setNewComment("");
          }}
        >
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="new comment"
          />
        </form>
      </div>
    </div>
  );
};

export const Comment = ({ comment }) => (
  <div className="comment">{comment.content}</div>
);
