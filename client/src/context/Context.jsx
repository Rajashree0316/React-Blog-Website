import React, { createContext, useEffect, useReducer } from "react";
import Reducer from "./Reducer";

// ✅ Safe JSON parse
const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// ✅ Initial state from localStorage
const INITIAL_STATE = {
  user: parseJSON(localStorage.getItem("user")),
  token: localStorage.getItem("token") || null,
  isFetching: false,
  error: false,
};

// ✅ Context
export const Context = createContext(INITIAL_STATE);

// ✅ Named Action Creator for followings update
export const UpdateFollowings = (followings) => ({
  type: "UPDATE_FOLLOWINGS",
  payload: followings,
});

// ✅ Provider component
export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);

  // ✅ Persist updated user & token
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", state.token || "");
  }, [state.user, state.token]);

  return (
    <Context.Provider
      value={{
        user: state.user,
        token: state.token,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};
