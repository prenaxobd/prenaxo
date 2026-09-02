'use client';

import { useRef, useState } from 'react';

export default function ProfileForm({ user }) {
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [image, setImage] = useState(user?.image || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // =====================================================
  // SAFE RESPONSE READER
  // =====================================================

  async function readResponse(response) {
    const contentType =
      response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();

    throw new Error(
      text || `Server returned ${response.status}`
    );
  }

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setSuccess('');

    // ---------------------------------------------------
    // TYPE VALIDATION
    // ---------------------------------------------------

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please select a JPG, PNG or WebP image.'
      );

      event.target.value = '';
      return;
    }

    // ---------------------------------------------------
    // SIZE VALIDATION
    // ---------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image size must be less than 5MB.'
      );

      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // IMPORTANT:
      // API expects "file"
      formData.append('file', file);

      // IMPORTANT:
      // Correct API URL
      const response = await fetch(
        '/api/account/profile-image',
        {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Image upload failed.'
        );
      }

      if (!data?.image) {
        throw new Error(
          'Server did not return the uploaded image.'
        );
      }

      // -------------------------------------------------
      // UPDATE IMAGE PREVIEW
      // -------------------------------------------------

      setImage(data.image);

      setSuccess(
        'Profile image uploaded successfully.'
      );

      // -------------------------------------------------
      // RESET FILE INPUT
      // -------------------------------------------------

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // -------------------------------------------------
      // NOTIFY HEADER
      // -------------------------------------------------

      window.dispatchEvent(
        new CustomEvent('profile-updated', {
          detail: {
            image: data.image,
            name: name,
          },
        })
      );

    } catch (err) {
      console.error(
        'PROFILE_IMAGE_UPLOAD_ERROR:',
        err
      );

      setError(
        err?.message ||
        'Unable to upload profile image.'
      );

    } finally {
      setUploading(false);
    }
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(
        '/api/account/profile',
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            name,
            phone,
            image,
          }),

          cache: 'no-store',
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Failed to update profile.'
        );
      }

      // -------------------------------------------------
      // UPDATE LOCAL STATE
      // -------------------------------------------------

      if (data?.user) {
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
        setImage(data.user.image || '');
      }

      setSuccess(
        'Your profile has been updated successfully.'
      );

      // -------------------------------------------------
      // NOTIFY HEADER
      // -------------------------------------------------

      window.dispatchEvent(
        new CustomEvent('profile-updated', {
          detail: {
            image: data?.user?.image || image,
            name: data?.user?.name || name,
          },
        })
      );

    } catch (err) {
      console.error(
        'PROFILE_UPDATE_ERROR:',
        err
      );

      setError(
        err?.message ||
        'Something went wrong.'
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // RESET
  // =====================================================

  function resetForm() {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setImage(user?.image || '');

    setSuccess('');
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // =====================================================
  // FIRST LETTER
  // =====================================================

  const firstLetter =
    name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="profile-content">

      {/* =================================================
          PROFILE PREVIEW
      ================================================= */}

      <aside className="profile-preview">

        <div className="profile-preview-avatar">

          {image ? (
            <img
              src={image}
              alt={name || 'Profile'}
            />
          ) : (
            <div className="profile-preview-letter">
              {firstLetter}
            </div>
          )}

        </div>

        <h2>
          {name || 'Your Name'}
        </h2>

        <p className="profile-preview-email">
          {user?.email}
        </p>

        <div className="profile-account-badge">
          <span>✓</span>

          {user?.role === 'ADMIN'
            ? 'Administrator'
            : 'Verified Account'}
        </div>

        <div className="profile-preview-divider" />

        <div className="profile-preview-detail">
          <span>EMAIL ADDRESS</span>

          <strong>
            {user?.email}
          </strong>
        </div>

        <div className="profile-preview-detail">
          <span>PHONE NUMBER</span>

          <strong>
            {phone || 'Not added yet'}
          </strong>
        </div>

        <div className="profile-preview-detail">
          <span>ACCOUNT TYPE</span>

          <strong>
            {user?.role === 'ADMIN'
              ? 'Administrator'
              : 'Customer'}
          </strong>
        </div>

      </aside>


      {/* =================================================
          EDIT PROFILE
      ================================================= */}

      <section className="profile-editor">

        <div className="profile-editor-header">

          <div>
            <span className="profile-editor-eyebrow">
              PERSONAL DETAILS
            </span>

            <h2>
              Edit Profile
            </h2>

            <p>
              Keep your account information up to date.
            </p>
          </div>

        </div>


        <form onSubmit={handleSubmit}>

          {/* =================================================
              BASIC FIELDS
          ================================================= */}

          <div className="profile-fields">

            {/* NAME */}

            <div className="profile-field">

              <label htmlFor="profile-name">
                Full Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="profile-field">

              <label htmlFor="profile-email">
                Email Address
              </label>

              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
              />

              <small>
                Email address cannot be changed here.
              </small>

            </div>


            {/* PHONE */}

            <div className="profile-field">

              <label htmlFor="profile-phone">
                Phone Number
              </label>

              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
              />

            </div>


            {/* ACCOUNT TYPE */}

            <div className="profile-field">

              <label>
                Account Type
              </label>

              <input
                type="text"
                value={
                  user?.role === 'ADMIN'
                    ? 'Administrator'
                    : 'Customer'
                }
                disabled
              />

            </div>

          </div>


          {/* =================================================
              PROFILE PHOTO
          ================================================= */}

          <div className="profile-photo-upload">

            <div className="profile-photo-upload-header">

              <div>

                <span className="profile-photo-eyebrow">
                  PROFILE PHOTO
                </span>

                <h3>
                  Your Profile Image
                </h3>

                <p>
                  JPG, PNG or WebP · Maximum 5MB
                </p>

              </div>


              <div className="profile-photo-small-preview">

                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                  />
                ) : (
                  <span>
                    {firstLetter}
                  </span>
                )}

              </div>

            </div>


            <div className="profile-upload-box">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                hidden
                id="profile-image-upload"
              />

              <label
                htmlFor="profile-image-upload"
                className="profile-upload-button"
              >

                <span className="profile-upload-icon">
                  ↑
                </span>

                <span>
                  {uploading
                    ? 'Uploading...'
                    : 'Choose Profile Image'}
                </span>

              </label>

              <p>
                Select an image from your computer
              </p>

            </div>

          </div>


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="profile-message profile-message-success">
              <span>✓</span>
              {success}
            </div>
          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="profile-message profile-message-error">
              <span>!</span>
              {error}
            </div>
          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="profile-actions">

            <button
              type="button"
              className="profile-reset-button"
              onClick={resetForm}
              disabled={saving || uploading}
            >
              Reset
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving || uploading}
            >

              {saving ? (
                <>
                  <span className="profile-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <span>→</span>
                </>
              )}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}