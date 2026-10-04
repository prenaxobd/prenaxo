export default function AdminLoading() {
	return (
		<section className="admin-route-loading" role="status" aria-label="Loading admin page">
			<div className="admin-route-loading-heading">
				<span className="admin-loading-bar admin-loading-eyebrow" />
				<span className="admin-loading-bar admin-loading-title" />
				<span className="admin-loading-bar admin-loading-description" />
			</div>
			<div className="admin-route-loading-stats" aria-hidden="true">
				{[0, 1, 2, 3].map(item => <span className="admin-loading-card" key={item} />)}
			</div>
			<div className="admin-route-loading-table" aria-hidden="true">
				{[0, 1, 2, 3, 4].map(item => <span className="admin-loading-row" key={item} />)}
			</div>
			<span className="admin-route-loading-label">Loading your workspace...</span>
		</section>
	);
}
