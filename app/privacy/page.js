import styles from './PrivacyPolicy.module.css';

const sections = [
	['who-we-are', 'Who We Are'],
	['information-we-collect', 'Information We Collect'],
	['account-information', 'Account Information'],
	['order-information', 'Order Information'],
	['payment-information', 'Payment Information'],
	['how-we-use', 'How We Use Your Information'],
	['delivery-partners', 'Delivery Partners'],
	['cookies', 'Cookies'],
	['search-cart-wishlist', 'Search, Cart and Wishlist'],
	['analytics', 'Analytics'],
	['communications', 'Communications'],
	['information-sharing', 'Information Sharing'],
	['data-security', 'Data Security'],
	['password-security', 'Password and Account Security'],
	['data-retention', 'Data Retention'],
	['privacy-choices', 'Customer Privacy Choices'],
	['third-party-websites', 'Third-Party Websites'],
	['childrens-privacy', "Children's Privacy"],
	['fraud-and-law', 'Fraud Prevention and Legal Requirements'],
	['changes', 'Changes to Privacy Policy'],
	['contact-us', 'Contact Us'],
];

function Section({ id, title, children }) {
	return <section className={styles.section} id={id}><h2>{title}</h2>{children}</section>;
}

function BulletList({ children }) {
	return <ul className={styles.list}>{children}</ul>;
}

export default function Privacy() {
	return <main className={styles.page}>
		<div className={styles.hero}>
			<span className={styles.eyebrow}>Prenaxo</span>
			<h1>Privacy Policy</h1>
			<p className={styles.updated}>Last Updated: September 5, 2026</p>
			<p className={styles.lead}>Prenaxo respects your privacy and is committed to handling your information responsibly. This Privacy Policy explains what information we may collect, why we use it, and the choices available to you when you use our online store.</p>
		</div>

		<div className={styles.layout}>
			<aside className={styles.toc} aria-label="Privacy policy contents">
				<strong>On this page</strong>
				<nav>{sections.map(([id, title], index) => <a href={`#${id}`} key={id}><span>{index + 1}</span>{title}</a>)}</nav>
			</aside>

			<article className={styles.content}>
				<Section id="who-we-are" title="1. Who We Are">
					<p>Prenaxo is an online eCommerce platform serving customers in Bangladesh. We provide products, order processing, delivery coordination, account services, and customer support through our website.</p>
					<div className={styles.contactCard}><strong>Prenaxo</strong><span>Phone: <a href="tel:01608069154">01608069154</a></span><span>Address: Asim, Fulbaria, Mymensingh, Bangladesh</span></div>
				</Section>

				<Section id="information-we-collect" title="2. Information We Collect">
					<p>Depending on how you use the website, we may collect information that you provide when creating an account, placing an order, requesting support, or using shopping features, including:</p>
					<BulletList><li>Full name, email address, and phone number.</li><li>Delivery address, city, area, and related delivery details.</li><li>Order information, products purchased, quantities, payment method, delivery information, and order notes.</li><li>Account and profile information where applicable.</li></BulletList>
					<p>We collect information needed for the relevant feature or service. We do not ask for information that is unrelated to operating the store.</p>
				</Section>

				<Section id="account-information" title="3. Account Information"><p>Account information is used to create and manage your account, authenticate customers, maintain account preferences, provide account-related services, and respond to customer support requests.</p></Section>
				<Section id="order-information" title="4. Order Information"><p>We use order and contact information to process and confirm orders, prepare and deliver products, contact you about an order, handle returns or refunds, and provide order support.</p></Section>
				<Section id="payment-information" title="5. Payment Information"><p>Payment information may be processed by the payment provider selected for an order. Prenaxo does not claim to store full card numbers, CVV codes, PINs, or other sensitive payment credentials unless the applicable payment process specifically requires it. For Cash on Delivery, we collect the information needed to confirm and deliver the order and collect payment.</p></Section>

				<Section id="how-we-use" title="6. How We Use Your Information"><p>We may use information reasonably necessary for the following purposes:</p><BulletList><li>Processing orders, payments, delivery, returns, and refunds.</li><li>Providing customer support and managing accounts.</li><li>Sending service notifications about orders, delivery, payments, or important website changes.</li><li>Improving website functionality, security, performance, and the shopping experience.</li><li>Preventing fraud, abuse, unauthorized access, and other harmful activity.</li></BulletList></Section>
				<Section id="delivery-partners" title="7. Delivery Partners"><p>When needed to deliver an order, necessary information such as your name, phone number, delivery address, and relevant order details may be shared with delivery or logistics providers. These providers receive information needed for delivery and related service operations.</p></Section>
				<Section id="cookies" title="8. Cookies"><p>Prenaxo may use cookies and similar technologies to support login and session management, cart functionality, saved preferences, website functionality, and aggregated performance analysis. These technologies help the website remember necessary state and operate reliably. We do not state that the website uses advertising cookies or a particular third-party tracking service unless that service is actually configured.</p></Section>
				<Section id="search-cart-wishlist" title="9. Search, Cart and Wishlist"><p>The website may process information about product searches, products viewed, cart items, wishlist items, and related shopping interactions to provide those features, keep them synchronized, and improve the store experience.</p></Section>
				<Section id="analytics" title="10. Analytics"><p>Prenaxo may use aggregated or technical website information, such as feature usage and performance information, to understand how the website works and where it can be improved. No specific external analytics service is identified in this policy unless one is configured on the website.</p></Section>
				<Section id="communications" title="11. Communications"><p>We may contact customers when reasonably necessary for order confirmation, delivery updates, payment or order status, customer support, return or refund matters, and important service notifications. Promotional communication will be sent only where applicable, and you may request that such communication stop.</p></Section>
				<Section id="information-sharing" title="12. Information Sharing"><p>Prenaxo does not sell customers' personal information. Information may be shared only when reasonably necessary with:</p><BulletList><li>Delivery and logistics providers.</li><li>Payment providers involved in processing a selected payment method.</li><li>Hosting, technology, and other relevant service providers supporting the website.</li><li>Authorities or other parties where disclosure is legally required.</li></BulletList></Section>
				<Section id="data-security" title="13. Data Security"><p>We use reasonable security practices appropriate to the service, including authentication, access controls, password protection, secure communication, server and security controls, and restricted access to customer information. No internet or information system can guarantee absolute security, so customers should also protect their account credentials and contact us if they suspect unauthorized access.</p></Section>
				<Section id="password-security" title="14. Password and Account Security"><p>Keep your password confidential, use a strong password, and do not share your login credentials. Prenaxo will not ask you to send us your password. Contact Prenaxo through the available contact information if you suspect unauthorized access to your account.</p></Section>
				<Section id="data-retention" title="15. Data Retention"><p>We may retain information for as long as reasonably necessary for orders, accounts, customer support, returns and refunds, business records, fraud prevention, dispute resolution, and applicable legal requirements.</p></Section>
				<Section id="privacy-choices" title="16. Customer Privacy Choices"><p>Where applicable, customers may request access to their information, correction of inaccurate information, deletion of certain information, account updates, or information about how their data is used. You may also ask to opt out of promotional communication where applicable. Requests should be directed to Prenaxo using the contact details below. Some information may need to be retained for orders, legal requirements, security, or dispute resolution.</p></Section>
				<Section id="third-party-websites" title="17. Third-Party Websites"><p>Links from Prenaxo to external websites may be provided for convenience. Those websites may have their own privacy policies, and Prenaxo is not responsible for their privacy practices or content.</p></Section>
				<Section id="childrens-privacy" title="18. Children's Privacy"><p>Prenaxo does not intentionally seek to collect personal information from children without appropriate authorization. If you believe that a child has provided personal information improperly, please contact us so that the matter can be reviewed.</p></Section>
				<Section id="fraud-and-law" title="19. Fraud Prevention and Legal Requirements"><p>Information may be processed or disclosed when reasonably necessary to prevent fraud, detect abuse, protect customers or Prenaxo, enforce website terms, comply with applicable law, or respond to lawful requests.</p></Section>
				<Section id="changes" title="20. Changes to Privacy Policy"><p>Prenaxo may update this Privacy Policy from time to time. When it is updated, the “Last Updated” date at the top of this page will also be updated.</p></Section>
				<Section id="contact-us" title="21. Contact Us"><p>For privacy questions or requests, contact Prenaxo using the available information:</p><div className={styles.contactCard}><strong>Prenaxo</strong><span>Phone: <a href="tel:01608069154">01608069154</a></span><span>Address: Asim, Fulbaria, Mymensingh, Bangladesh</span></div><p className={styles.disclaimer}>This Privacy Policy is customer information about the website’s practices and is not legal advice.</p></Section>
			</article>
		</div>
	</main>;
}
