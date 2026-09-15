'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquarePlus } from 'lucide-react';
import { ProductReview } from '@/lib/types';
import { useToast } from '@/context/toast-context';

interface ProductReviewsProps {
  rating: number;
  reviewsCount: number;
  reviews?: ProductReview[];
}

export function ProductReviews({ rating, reviewsCount, reviews = [] }: ProductReviewsProps) {
  const { success } = useToast();
  const [userReviews, setUserReviews] = useState<ProductReview[]>(reviews);
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [ratingScore, setRatingScore] = useState(5);
  const [commentText, setCommentText] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    const newRev: ProductReview = {
      id: Math.random().toString(),
      author: authorName,
      role: roleName || 'Hardware Engineer',
      rating: ratingScore,
      date: 'Just now',
      comment: commentText,
      verified: true,
    };

    setUserReviews([newRev, ...userReviews]);
    setAuthorName('');
    setRoleName('');
    setCommentText('');
    setShowForm(false);
    success('Review Submitted', 'Thank you for your feedback from the workbench!');
  };

  return (
    <div className="space-y-8">
      {/* Top Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm">
        {/* Left Big Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/10">
          <span className="text-4xl font-extrabold text-neutral-950 dark:text-white font-mono tracking-tight">
            {rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Based on {reviewsCount} verified engineer reviews</p>
        </div>

        {/* Center Rating Bars */}
        <div className="flex flex-col justify-center space-y-2 py-2">
          {[
            { stars: '5 Star', pct: 88 },
            { stars: '4 Star', pct: 10 },
            { stars: '3 Star', pct: 2 },
            { stars: '2 Star', pct: 0 },
            { stars: '1 Star', pct: 0 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">{bar.stars}</span>
              <div className="flex-1 h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${bar.pct}%` }} />
              </div>
              <span className="w-8 text-right font-mono text-neutral-500 dark:text-neutral-400 text-[11px]">{bar.pct}%</span>
            </div>
          ))}
        </div>

        {/* Right CTA */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-white/10">
          <h4 className="text-xs font-bold text-neutral-950 dark:text-white mb-1">Tested on your workbench?</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-xs">
            Help other Bengaluru IoT and embedded founders build robust hardware.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Write Engineer Review</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 rounded-2xl space-y-4 shadow-sm"
        >
          <h4 className="text-sm font-bold text-neutral-950 dark:text-white">Share Your Hardware Experience</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Vikram Iyer"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role & Startup / Lab</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Robotics Engineer at IISc"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRatingScore(s)}
                  className="p-1 text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${s <= ratingScore ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Review</label>
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="How did this component perform? Any notable quirks with logic voltages, thermal stability, or drivers?"
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e51e2b] hover:bg-[#c91823] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* Review Cards List */}
      <div className="space-y-4">
        {userReviews.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center py-8">
            No detailed reviews written yet. Be the first to leave one!
          </p>
        ) : (
          userReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-950 dark:text-white">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Verified Bengaluru Buyer
                      </span>
                    )}
                  </div>
                  {rev.role && <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{rev.role}</p>}
                </div>

                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">{rev.date}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                  />
                ))}
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
