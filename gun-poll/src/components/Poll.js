import React, { useState } from "react";
import { getId } from "nicks-gun-utils";

export const Poll = ({
  poll,
  onCreateAnswer,
  onCreateComment,
  token,
  onVote,
  onSetPollTitle
}) => {
  const [editing, setEditing] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  return (
    <div className="poll">
      {editing ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            onSetPollTitle(newPollTitle);
            setEditing(false);
          }}
        >
          <input
            autoFocus
            value={newPollTitle}
            onChange={e => setNewPollTitle(e.target.value)}
            placeholder="poll title"
          />
        </form>
      ) : (
        <h1
          onDoubleClick={e => {
            setNewPollTitle(poll.title);
            setEditing(true);
          }}
          className="poll-title"
        >
          {(poll && poll.title) || "Set poll title"}
        </h1>
      )}
      {poll.answers.map(answer => (
        <Answer
          key={getId(answer)}
          getId={getId}
          token={token}
          answer={answer}
          onVote={vote => onVote(getId(answer), vote)}
          onCreateComment={comment => onCreateComment(getId(answer), comment)}
        />
      ))}
      <div className="new-answer">
        <form
          onSubmit={e => {
            e.preventDefault();
            onCreateAnswer(newAnswer);
            setEditing(false);
            setNewAnswer("");
          }}
        >
          <input
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            placeholder="new answer"
          />
        </form>
      </div>
    </div>
  );
};

export const Answer = ({ answer, getId, onVote, token, onCreateComment }) => {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="answer">
      <div
        className={`answer-votes ${answer.votes[token] ? "voted" : ""}`}
        onClick={() => onVote(!answer.votes[token])}
      >
        {answer.voteCount}
      </div>
      <div className="answer-stuff">
        <div className="answer-content">{answer.content}</div>
        <div className="answer-comments">
          {answer.comments.map(comment => (
            <Comment id={getId(comment)} comment={comment} />
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
      </div>
    </div>
  );
};

export const Comment = ({ comment }) => (
  <div className="comment">{comment.content}</div>
);
