"use client";

import { useState, useEffect } from "react";
import { getComments, createComment } from "@/actions/comments";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";

export default function CommentSection({ issueId }) {
  const [comments, setComments] = useState([]);
  
  const {
    loading,
    error,
    fn: fetchComments,
    data: fetchedComments,
  } = useFetch(getComments);

  const {
    loading: createLoading,
    error: createError,
    fn: createCommentFn,
    data: newComment,
  } = useFetch(createComment);

  useEffect(() => {
    fetchComments(issueId);
  }, [issueId]);

  useEffect(() => {
    if (fetchedComments) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  useEffect(() => {
    if (newComment) {
      // Add the new comment to the list
      setComments([newComment, ...comments]);
    }
  }, [newComment]);

  const handleSubmit = async (content) => {
    await createCommentFn(issueId, { content });
  };

  const handleReply = async (parentId, content) => {
    const reply = await createCommentFn(issueId, { content, parentId });
    
    if (reply) {
      // Update the parent comment with the new reply
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>
      
      <CommentForm onSubmit={handleSubmit} loading={createLoading} />
      
      {loading && <BarLoader width={"100%"} color="#36d7b7" />}
      
      {error && <p className="text-red-500">Error loading comments: {error.message}</p>}
      
      {comments.length === 0 && !loading && (
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      )}
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
}
