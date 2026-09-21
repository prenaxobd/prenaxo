export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Loading">
      <div className="route-loading-spinner" />
      <span>Loading</span>
    </div>
  );
}