// src/pages/single/SingleWrapper.jsx
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import { CommentProvider } from "../../context/CommentContext";
import Single from "./Single";

export default function SingleWrapper() {
  const { postId } = useParams();
  const { user } = useContext(Context);

  return (
    <CommentProvider postId={postId} currentUser={user}>
  {postId && user && <Single postId={postId} currentUser={user} />}
    </CommentProvider>
  );
}
