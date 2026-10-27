import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareIcon,
  ReplyIcon,
  Trash2Icon,
  SendIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  getReviewCommentsApi,
  addReviewCommentApi,
  deleteReviewCommentApi,
  ReviewCommentItem,
} from '../../api/reviews.api';
import { Avatar } from '../ui/Avatar';
import { formatUserForUi } from '../../utils/user';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewCommentsProps {
  reviewId: string;
  initialCount?: number;
  reviewerUsername?: string;
}

export function ReviewComments({
  reviewId,
  initialCount = 0,
  reviewerUsername,
}: ReviewCommentsProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<ReviewCommentItem[]>([]);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  // Fetch comments when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    getReviewCommentsApi(reviewId)
      .then((data) => {
        if (!isMounted) return;
        setComments(data);
        setCount(data.length);
      })
      .catch((err) => {
        console.error('[ReviewComments] Fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, reviewId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addReviewCommentApi(
        reviewId,
        trimmed,
        replyingTo ? replyingTo.id : undefined
      );

      setComments((prev) => [...prev, newComment]);
      setCount((prev) => prev + 1);
      setText('');
      setReplyingTo(null);
      toast.success(replyingTo ? 'Reply posted' : 'Comment posted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteReviewCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      setCount((prev) => Math.max(0, prev - 1));
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete comment');
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Group top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="mt-3.5">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle hover:text-gold transition-colors focus:outline-none"
      >
        <MessageSquareIcon size={14} className={isOpen ? 'text-gold' : ''} />
        <span>
          {count > 0
            ? `${count} ${count === 1 ? 'comment' : 'comments'}`
            : 'Leave a comment'}
        </span>
      </button>

      {/* Expandable Comments Drawer */}
      {isOpen && (
        <div className="mt-3 rounded-2xl border border-line bg-surface-raised/40 p-4 transition-all">
          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2Icon size={18} className="animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="py-2 text-center text-xs text-fg-subtle">
                  No comments yet. Share your thoughts on this review!
                </p>
              ) : (
                <div className="space-y-3.5">
                  {topLevelComments.map((comment) => {
                    const replies = getReplies(comment.id || comment._id);
                    const uiUser = formatUserForUi(comment.user);
                    const isMyComment =
                      comment.isMine ||
                      (user && (comment.user.id === user.id || (comment.user as any)._id === user.id));

                    return (
                      <div key={comment.id || comment._id} className="space-y-2">
                        {/* Parent Comment */}
                        <div className="group flex items-start gap-2.5 rounded-xl bg-white/[0.02] p-2.5 text-xs ring-1 ring-inset ring-white/[0.04]">
                          <Avatar user={uiUser as any} size="xs" className="mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <Link
                                to={`/app/profile/${comment.user.username}`}
                                className="font-semibold text-fg hover:text-gold transition-colors"
                              >
                                {comment.user.name}
                              </Link>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-fg-subtle">
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                                {isMyComment && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(comment.id || comment._id)}
                                    title="Delete comment"
                                    className="opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-rose-400 transition-opacity"
                                  >
                                    <Trash2Icon size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-fg-muted">{comment.content}</p>
                            <button
                              type="button"
                              onClick={() =>
                                setReplyingTo({
                                  id: comment.id || comment._id,
                                  username: comment.user.username,
                                })
                              }
                              className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-fg-subtle hover:text-gold transition-colors"
                            >
                              <ReplyIcon size={11} />
                              Reply
                            </button>
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {replies.length > 0 && (
                          <div className="ml-6 space-y-2 border-l border-line pl-3">
                            {replies.map((reply) => {
                              const replyUser = formatUserForUi(reply.user);
                              const isMyReply =
                                reply.isMine ||
                                (user && (reply.user.id === user.id || (reply.user as any)._id === user.id));

                              return (
                                <div
                                  key={reply.id || reply._id}
                                  className="group flex items-start gap-2 rounded-xl bg-white/[0.03] p-2 text-xs ring-1 ring-inset ring-white/[0.04]"
                                >
                                  <Avatar user={replyUser as any} size="xs" className="mt-0.5 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <Link
                                        to={`/app/profile/${reply.user.username}`}
                                        className="font-semibold text-fg hover:text-gold transition-colors"
                                      >
                                        {reply.user.name}
                                      </Link>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-fg-subtle">
                                          {formatCommentDate(reply.createdAt)}
                                        </span>
                                        {isMyReply && (
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(reply.id || reply._id)}
                                            title="Delete reply"
                                            className="opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-rose-400 transition-opacity"
                                          >
                                            <Trash2Icon size={11} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="mt-0.5 whitespace-pre-wrap text-fg-muted">{reply.content}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comment Input Form */}
              <form onSubmit={handleSubmit} className="mt-3">
                {replyingTo && (
                  <div className="mb-1.5 flex items-center justify-between rounded-lg bg-gold/10 px-2 py-1 text-[11px] text-gold ring-1 ring-inset ring-gold/30">
                    <span>Replying to @{replyingTo.username}</span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="hover:text-fg"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      replyingTo
                        ? `Reply to @${replyingTo.username}...`
                        : reviewerUsername
                        ? `Comment on @${reviewerUsername}'s review...`
                        : 'Write a comment...'
                    }
                    disabled={submitting}
                    className="h-8 flex-1 rounded-xl bg-surface px-3 text-xs text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold text-canvas hover:bg-gold-light transition-colors disabled:opacity-40"
                  >
                    {submitting ? (
                      <Loader2Icon size={13} className="animate-spin" />
                    ) : (
                      <SendIcon size={13} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default ReviewComments;
