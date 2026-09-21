import OptimizedImage from '@/components/OptimizedImage';
import { prisma } from '@/lib/prisma';

function initials(name = '') {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase() || 'C';
}

export default async function Customers() {
	const users = await prisma.user.findMany({
		where: { role: 'USER' },
		include: {
			_count: { select: { orders: true } },
			orders: { select: { total: true } },
		},
		orderBy: { createdAt: 'desc' },
	});

	return (
		<>
			<div className="admin-page-heading customer-page-heading">
				<div>
					<div className="eyebrow" style={{ color: 'var(--coral)' }}>People</div>
					<h1>Customers</h1>
					<p className="muted">View customer profiles, activity, and lifetime spend.</p>
				</div>
				<span className="customer-count-badge">{users.length} customers</span>
			</div>

			{users.length ? (
				<div className="admin-table-wrap customer-table-wrap">
					<table className="table customer-table">
						<thead>
							<tr>
								<th>Customer</th>
								<th>Contact</th>
								<th>Orders</th>
								<th>Total spent</th>
								<th>Joined</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => {
								const totalSpent = user.orders.reduce(
									(sum, order) => sum + Number(order.total),
									0
								);

								return (
									<tr key={user.id}>
										<td>
											<div className="admin-customer-identity">
												<div className="admin-customer-avatar">
													{user.image ? (
														<OptimizedImage src={user.image} alt="" />
													) : (
														initials(user.name)
													)}
												</div>
												<div>
													<strong>{user.name}</strong>
													<small>{user.email}</small>
												</div>
											</div>
										</td>
										<td>
											<span className="admin-customer-phone">
												{user.phone || 'No phone number'}
											</span>
										</td>
										<td>
											<span className="customer-orders-badge">{user._count.orders}</span>
										</td>
										<td>
											<strong className="customer-spend">৳{totalSpent.toLocaleString()}</strong>
										</td>
										<td>
											<span className="customer-joined-date">
												{user.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				<div className="admin-empty customer-empty-state">
					<strong>No customers yet.</strong>
					<span>New customer accounts will appear here.</span>
				</div>
			)}
		</>
	);
}
