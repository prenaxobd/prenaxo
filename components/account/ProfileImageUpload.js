'use client';
import OptimizedImage from '@/components/OptimizedImage';

import { useState } from 'react';

export default function ProfileImageUpload({
  currentImage,
  userName,
}) {
  const [preview, setPreview] = useState(
    currentImage || '/images/default-avatar.png'
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setMessage('');
    setError('');

    // =====================================================
    // VALIDATION
    // =====================================================

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please select JPG, PNG or WebP image.'
      );

      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image must be smaller than 5MB.'
      );

      e.target.value = '';
      return;
    }

    // =====================================================
    // LOCAL PREVIEW
    // =====================================================

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
    setLoading(true);

    try {

      const formData = new FormData();

      // IMPORTANT
      // API expects "file"
      formData.append('file', file);

      const response = await fetch(
        '/api/account/profile-image',
        {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        }
      );

      const contentType =
        response.headers.get(
          'content-type'
        ) || '';

      let data;

      if (
        contentType.includes(
          'application/json'
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        throw new Error(
          text ||
          `Server returned ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Upload failed.'
        );
      }

      // ===================================================
      // UPDATE PREVIEW
      // ===================================================

      setPreview(data.image);

      setMessage(
        'Profile image updated successfully.'
      );

      // ===================================================
      // HEADER UPDATE EVENT
      // ===================================================

      window.dispatchEvent(
        new CustomEvent(
          'profile-updated',
          {
            detail: {
              image: data.image,
              name:
                data?.user?.name ||
                userName,
            },
          }
        )
      );

    } catch (error) {

      console.error(
        'PROFILE_IMAGE_UPLOAD_ERROR:',
        error
      );

      // Restore old image
      setPreview(
        currentImage ||
        '/images/default-avatar.png'
      );

      setError(
        error?.message ||
        'Unable to upload image.'
      );

    } finally {

      setLoading(false);

      e.target.value = '';

      URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    <div className="profile-image-editor">

      <div className="profile-large-avatar-wrap">

        <OptimizedImage
          src={preview}
          alt={userName || 'Profile'}
          className="profile-large-avatar"
        />

        <label
          htmlFor="profile-image"
          className="profile-image-camera"
        >
          ✎
        </label>

        <input
          id="profile-image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          hidden
        />

      </div>


      <div>

        <h4>
          {userName}
        </h4>

        <p>
          JPG, PNG or WebP. Maximum file size 5MB.
        </p>

        <label
          htmlFor="profile-image"
          className="account-outline-btn"
        >
          {loading
            ? 'Uploading...'
            : 'Change Photo'}
        </label>


        {message && (
          <small className="profile-upload-message profile-upload-success">
            {message}
          </small>
        )}


        {error && (
          <small className="profile-upload-message profile-upload-error">
            {error}
          </small>
        )}

      </div>

    </div>
  );
}