'use client';

import { useMemo, useState } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ShoppingBag,
  Clock,
} from 'lucide-react';

export default function ReviewManager({ initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState(null);

  const filteredReviews = useMemo(() => {
    if (filter === 'PENDING') {
      return reviews.filter((review) => !review.approved);
    }

    if (filter === 'APPROVED') {
      return reviews.filter((review) => review.approved);
    }

    if (filter === 'VERIFIED') {
      return reviews.filter((review) => review.verifiedPurchase);
    }

    return reviews;
  }, [reviews, filter]);

  const pendingCount = reviews.filter(
    (review) => !review.approved
  ).length;

  const approvedCount = reviews.filter(
    (review) => review.approved
  ).length;

  const verifiedCount = reviews.filter(
    (review) => review.verifiedPurchase
  ).length;

  async function updateReview(id, approved) {
    setLoadingId(id);

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Unable to update review.');
        return;
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === id
            ? {
                ...review,
                approved: data.review.approved,
              }
            : review
        )
      );
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteReview(id) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this review?'
    );

    if (!confirmed) return;

    setLoadingId(id);

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Unable to delete review.');
        return;
      }

      setReviews((current) =>
        current.filter((review) => review.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="admin-reviews">

      <div className="admin-reviews-header">
        <div>
          <h1>Reviews</h1>
          <p>
            Manage customer reviews and verified purchases.
          </p>
        </div>
      </div>

      <div className="review-stats">

        <button
          className={filter === 'ALL' ? 'active' : ''}
          onClick={() => setFilter('ALL')}
        >
          <strong>{reviews.length}</strong>
          <span>All Reviews</span>
        </button>

        <button
          className={filter === 'PENDING' ? 'active' : ''}
          onClick={() => setFilter('PENDING')}
        >
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </button>

        <button
          className={filter === 'APPROVED' ? 'active' : ''}
          onClick={() => setFilter('APPROVED')}
        >
          <strong>{approvedCount}</strong>
          <span>Approved</span>
        </button>

        <button
          className={filter === 'VERIFIED' ? 'active' : ''}
          onClick={() => setFilter('VERIFIED')}
        >
          <strong>{verifiedCount}</strong>
          <span>Verified</span>
        </button>

      </div>

      <div className="review-filter-tabs">

        <button
          className={filter === 'ALL' ? 'active' : ''}
          onClick={() => setFilter('ALL')}
        >
          All
        </button>

        <button
          className={filter === 'PENDING' ? 'active' : ''}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </button>

        <button
          className={filter === 'APPROVED' ? 'active' : ''}
          onClick={() => setFilter('APPROVED')}
        >
          Approved
        </button>

        <button
          className={filter === 'VERIFIED' ? 'active' : ''}
          onClick={() => setFilter('VERIFIED')}
        >
          Verified Purchase
        </button>

      </div>

      <div className="review-admin-list">

        {filteredReviews.length === 0 ? (

          <div className="empty-reviews">
            <Clock size={40} />
            <h3>No reviews found</h3>
            <p>
              There are no reviews in this category.
            </p>
          </div>

        ) : (

          filteredReviews.map((review) => (

            <article
              className="admin-review-card"
              key={review.id}
            >

              <div className="admin-review-main">

                <div className="admin-review-user">

                  <div className="admin-review-avatar">

                    {review.user?.image ? (
                      <img
                        src={review.user.image}
                        alt=""
                      />
                    ) : (
                      <span>
                        {(review.user?.name || 'C')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}

                  </div>

                  <div>
                    <strong>
                      {review.user?.name || 'Customer'}
                    </strong>

                    <small>
                      {review.user?.email || ''}
                    </small>
                  </div>

                </div>

                <div className="admin-review-product">

                  <span>Product</span>

                  <strong>
                    {review.product?.name || 'Unknown Product'}
                  </strong>

                </div>

                <div className="admin-review-rating">

                  <div className="admin-stars">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <Star
                        key={star}
                        size={16}
                        fill={
                          star <= Number(review.rating)
                            ? 'currentColor'
                            : 'none'
                        }
                      />

                    ))}

                  </div>

                  <strong>
                    {review.rating}/5
                  </strong>

                </div>

              </div>

              {review.comment && (
                <div className="admin-review-comment">
                  “{review.comment}”
                </div>
              )}

              <div className="admin-review-footer">

                <div className="admin-review-badges">

                  {review.verifiedPurchase && (
                    <span className="badge verified">
                      <ShoppingBag size={14} />
                      Verified Purchase
                    </span>
                  )}

                  {review.approved ? (
                    <span className="badge approved">
                      <CheckCircle size={14} />
                      Approved
                    </span>
                  ) : (
                    <span className="badge pending">
                      <Clock size={14} />
                      Pending
                    </span>
                  )}

                  <time>
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString('en-BD', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>

                </div>

                <div className="admin-review-actions">

                  {!review.approved ? (

                    <button
                      className="approve-btn"
                      disabled={loadingId === review.id}
                      onClick={() =>
                        updateReview(review.id, true)
                      }
                    >
                      <CheckCircle size={16} />
                      {loadingId === review.id
                        ? 'Updating...'
                        : 'Approve'}
                    </button>

                  ) : (

                    <button
                      className="reject-btn"
                      disabled={loadingId === review.id}
                      onClick={() =>
                        updateReview(review.id, false)
                      }
                    >
                      <XCircle size={16} />
                      {loadingId === review.id
                        ? 'Updating...'
                        : 'Reject'}
                    </button>

                  )}

                  <button
                    className="delete-btn"
                    disabled={loadingId === review.id}
                    onClick={() =>
                      deleteReview(review.id)
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>

              </div>

            </article>

          ))

        )}

      </div>

    </div>
  );
}