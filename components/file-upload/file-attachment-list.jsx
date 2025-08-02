"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Download, Trash2, FileIcon, ImageIcon, FileText } from "lucide-react";
import { getFileAttachments, deleteFileAttachment } from "@/actions/file-uploads";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function FileAttachmentList({ issueId }) {
  const [attachments, setAttachments] = useState([]);
  
  const {
    loading,
    error,
    fn: fetchAttachments,
    data: fetchedAttachments,
  } = useFetch(getFileAttachments);
  
  const {
    loading: deleteLoading,
    error: deleteError,
    fn: deleteAttachmentFn,
    data: deleteResult,
  } = useFetch(deleteFileAttachment);
  
  useEffect(() => {
    fetchAttachments(issueId);
  }, [issueId]);
  
  useEffect(() => {
    if (fetchedAttachments) {
      setAttachments(fetchedAttachments);
    }
  }, [fetchedAttachments]);
  
  const handleDelete = async (attachmentId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteAttachmentFn(attachmentId);
      
      // Update the attachments list
      setAttachments(attachments.filter(a => a.id !== attachmentId));
    }
  };
  
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (mimeType.startsWith("text/")) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <FileIcon className="h-5 w-5" />;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Attachments</h3>
      
      {loading && <BarLoader width={"100%"} color="#36d7b7" />}
      
      {error && <p className="text-red-500">Error loading attachments: {error.message}</p>}
      
      {attachments.length === 0 && !loading && (
        <p className="text-muted-foreground">No attachments yet.</p>
      )}
      
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-card border rounded-md"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(attachment.mimeType)}
              <div>
                <div className="font-medium">{attachment.originalName}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)} • Uploaded by {attachment.uploader.name} {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDelete(attachment.id)}
                disabled={deleteLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
