
'use client';

import {
  Star,
  User,
  Send,
  CheckCircle,
} from 'lucide-react';
import './ProductReviews.css';
import { useState } from 'react';


function Stars({ value = 0, size = 18 }) {
  return (
    <span className="dynamic-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={
            star <= Math.round(value)
              ? 'currentColor'
              : 'none'
          }
        />
      ))}
    </span>
  );
}


export default function ProductReviews({
  productId,
  reviews = [],
}) {

  const [items, setItems] =
    useState(reviews);

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState('');

  const [hoverRating, setHoverRating] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState('');


  /* ===============================================
     REVIEW SUMMARY
  =============================================== */

  const reviewCount =
    items.length;

  const average =
    reviewCount > 0
      ? Number(
          (
            items.reduce(
              (sum, item) =>
                sum + Number(item.rating || 0),
              0
            ) / reviewCount
          ).toFixed(1)
        )
      : 0;


  /* ===============================================
     SUBMIT REVIEW
  =============================================== */

  async function submitReview(event) {
    event.preventDefault();

    if (!rating) {
      setMessage(
        'Please select a star rating.'
      );
      return;
    }

    if (!comment.trim()) {
      setMessage(
        'Please write your review.'
      );
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response =
        await fetch('/api/reviews', {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            productId,
            rating,
            comment,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            'Unable to submit review.'
        );
        return;
      }


      /* =========================================
         REVIEW IS WAITING FOR ADMIN APPROVAL

         Do not add it to public review list
         because API creates it with:
         approved = false
      ========================================= */

      setRating(0);
      setComment('');

      setMessage(
        data.message ||
          'Review submitted successfully. It will appear after approval.'
      );

    } catch {
      setMessage(
        'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <section
      className="product-review-section"
      id="product-reviews"
    >

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="review-header">

        <div className="review-summary">

          <div className="review-score">
            {average || '0.0'}
          </div>

          <Stars
            value={average}
            size={20}
          />

          <div className="review-count">
            {reviewCount}{' '}
            {reviewCount === 1
              ? 'Review'
              : 'Reviews'}
          </div>

        </div>


        {/* =======================================
            REVIEW DISTRIBUTION
        ======================================= */}

        <div className="review-bars">

          {[5, 4, 3, 2, 1].map(
            (star) => {

              const count =
                items.filter(
                  (item) =>
                    Number(
                      item.rating
                    ) === star
                ).length;

              const percentage =
                reviewCount
                  ? Math.round(
                      (count /
                        reviewCount) *
                        100
                    )
                  : 0;

              return (
                <div
                  className="review-bar-row"
                  key={star}
                >

                  <span>
                    {star} ★
                  </span>

                  <div className="review-bar">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {percentage}%
                  </small>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* =========================================
          WRITE REVIEW
      ========================================= */}

      <div className="write-review-box">

        <div>
          <h3>
            Write a Review
          </h3>

          <p>
            Share your experience
            with this product.
          </p>
        </div>


        <form
          onSubmit={submitReview}
          className="review-form"
        >

          {/* STAR SELECTOR */}

          <div className="review-star-selector">

            <span>
              Your rating
            </span>

            <div>
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`${star} stars`}
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    onClick={() =>
                      setRating(star)
                    }
                  >

                    <Star
                      size={28}
                      fill={
                        star <=
                        (hoverRating ||
                          rating)
                          ? 'currentColor'
                          : 'none'
                      }
                    />

                  </button>
                )
              )}
            </div>

          </div>


          {/* COMMENT */}

          <textarea
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            placeholder="Write your review..."
            maxLength={1000}
            rows={4}
          />


          <div className="review-submit-row">

            <small>
              {comment.length}/1000
            </small>

            <button
              type="submit"
              disabled={loading}
            >

              <Send size={16} />

              {loading
                ? 'Submitting...'
                : 'Submit Review'}

            </button>

          </div>


          {/* MESSAGE */}

          {message && (
            <div className="review-message">
              <CheckCircle size={15} />
              {message}
            </div>
          )}

        </form>

      </div>


      {/* =========================================
          REVIEWS LIST
      ========================================= */}

      <div className="review-list">

        {items.length === 0 ? (

          <div className="no-reviews">
            <Star size={30} />

            <h3>
              No reviews yet
            </h3>

            <p>
              Be the first customer
              to review this product.
            </p>
          </div>

        ) : (

          items.map((review) => (

            <article
              className="review-item"
              key={review.id}
            >

              {/* AVATAR */}

              <div className="review-avatar">

                {review.user?.image ? (
                  <img
                    src={review.user.image}
                    alt=""
                  />
                ) : (
                  <User size={20} />
                )}

              </div>


              <div className="review-content">

                {/* USER NAME + VERIFIED */}

                <div className="review-top">

                  <strong>
                    {review.user?.name ||
                      'Customer'}
                  </strong>


                  {/* =================================
                      SHOW VERIFIED ONLY IF TRUE
                  ================================= */}

                  {review.verifiedPurchase && (
                    <span className="verified-review">
                      <CheckCircle size={13} />
                      Verified Purchase
                    </span>
                  )}

                </div>


                {/* RATING + DATE */}

                <div className="review-meta">

                  <Stars
                    value={
                      review.rating
                    }
                    size={15}
                  />

                  <time>
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString(
                      'en-BD',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </time>

                </div>


                {/* COMMENT */}

                {review.comment && (
                  <p>
                    {review.comment}
                  </p>
                )}

              </div>

            </article>

          ))

        )}

      </div>

    </section>
  );
}

