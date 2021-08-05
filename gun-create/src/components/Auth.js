import React, { useRef, FC } from "react";

export const Auth = ({ user, onLogin, onLogout }) => {
  const alias = useRef(null);
  const password = useRef(null);
  return (
    <div>
      {user ? (
        <div>
          <p>Logged in as {user.alias}</p>
          <div>
            <button onClick={onLogout}>Log out</button>
          </div>
        </div>
      ) : (
        <div>
          <form
            className="auth"
            onSubmit={e => {
              e.preventDefault();
              onLogin(alias.current.value, password.current.value);
            }}
          >
            <input ref={alias} placeholder="alias" />
            <input ref={password} type="password" placeholder="******" />
            <button type="submit">Log in</button>
            <button type="submit">Sign up</button>
          </form>
        </div>
      )}
    </div>
  );
};
