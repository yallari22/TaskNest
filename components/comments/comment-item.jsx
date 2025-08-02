"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reply, MoreVertical } from "lucide-react";
import CommentForm from "./comment-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateComment, deleteComment } from "@/actions/comments";
import useFetch from "@/hooks/use-fetch";

export default function CommentItem({ comment, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    loading: updateLoading,
    error: updateError,
    fn: updateCommentFn,
    data: updatedComment,
  } = useFetch(updateComment);
  
  const {
    loading: deleteLoading,
    error: deleteError,
    fn: deleteCommentFn,
    data: deleteResult,
  } = useFetch(deleteComment);
  
  const handleReplySubmit = (content) => {
    onReply(comment.id, content);
    setShowReplyForm(false);
  };
  
  const handleEditSubmit = async (content) => {
    await updateCommentFn(comment.id, { content });
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteCommentFn(comment.id);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.imageUrl} alt={comment.author.name} />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isEditing ? (
            <CommentForm
              onSubmit={handleEditSubmit}
              loading={updateLoading}
              initialValue={comment.content}
              placeholder="Edit your comment..."
            />
          ) : (
            <div className="mt-1 text-sm">{comment.content}</div>
          )}
          
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
          
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder="Write a reply..."
              />
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.author.imageUrl} alt={reply.author.name} />
                    <AvatarFallback>{getInitials(reply.author.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reply.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm">{reply.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
