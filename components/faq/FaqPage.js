'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import styles from './FaqPage.module.css';

const faqGroups = [
  {
    id: 'orders',
    label: 'Orders',
    icon: PackageCheck,
    questions: [
      {
        question: 'How do I place an order?',
        answer:
          'Choose your products, add them to your cart, then enter your contact and delivery details at checkout. Review the order and available payment options before submitting it.',
      },
      {
        question: 'How can I check my order status?',
        answer:
          'Use the Track Your Order page with your order number and phone number. If you have an account, you can also check the orders section after signing in.',
      },
      {
        question: 'Can I change or cancel an order?',
        answer:
          'Contact us as soon as possible with your order number. A change or cancellation may only be possible before the order has progressed too far in processing or delivery.',
      },
      {
        question: 'What if an item becomes unavailable?',
        answer:
          'Orders depend on product availability. If an item cannot be fulfilled, Prenaxo may contact you about the affected item and the next steps.',
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payments & pricing',
    icon: CreditCard,
    questions: [
      {
        question: 'Which payment methods can I use?',
        answer:
          'Payment options can vary and are shown at checkout. Available options may include Cash on Delivery, mobile wallet or bank transfer, and online payment where enabled.',
      },
      {
        question: 'Is Cash on Delivery available?',
        answer:
          'Cash on Delivery may be available for eligible orders and locations. Check the payment options shown for your order during checkout.',
      },
      {
        question: 'Are delivery charges included in the product price?',
        answer:
          'Delivery charges, if applicable, are calculated using the delivery details you provide and shown during checkout before you place your order.',
      },
      {
        question: 'What should I do if my payment is not confirmed?',
        answer:
          'Keep your order number and payment reference, then contact Prenaxo so the payment and order can be checked. Never share your payment PIN or password.',
      },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery & tracking',
    icon: Truck,
    questions: [
      {
        question: 'Where does Prenaxo deliver?',
        answer:
          'Prenaxo serves customers across Bangladesh. Available delivery options and charges depend on the address and delivery zone selected at checkout.',
      },
      {
        question: 'How long will delivery take?',
        answer:
          'Delivery timing can vary by location, product availability and logistics. Your order status may be checked from Track Your Order, and our team can help with order-specific updates.',
      },
      {
        question: 'How do I track my parcel?',
        answer:
          'Open Track Your Order and enter the order number and phone number used for the order. You can also contact support if you need help finding those details.',
      },
      {
        question: 'What if I entered the wrong delivery details?',
        answer:
          'Contact us quickly with your order number and the correct details. We will check whether an update is still possible based on the order status.',
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns & product help',
    icon: ShieldCheck,
    questions: [
      {
        question: 'What should I do if an item is damaged, incorrect or missing?',
        answer:
          'Please contact Prenaxo with your order number and a description of the issue as soon as reasonably possible. Keep the product and packaging where possible so the request can be reviewed.',
      },
      {
        question: 'How do I request a return, exchange or refund?',
        answer:
          'Contact Prenaxo with your order details and explain what happened. Requests are reviewed based on the order status, product condition and circumstances; any available resolution will be explained by our team.',
      },
      {
        question: 'How can I contact Prenaxo?',
        answer:
          'Call 01608069154 or email prenaxo@gmail.com. You can also send a message through the Contact Us page.',
      },
    ],
  },
];

export default function FaqPage() {
  const [activeGroup, setActiveGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [openQuestion, setOpenQuestion] = useState(null);

  const visibleGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return faqGroups
      .filter((group) => activeGroup === 'all' || group.id === activeGroup)
      .map((group) => ({
        ...group,
        questions: group.questions.filter(({ question, answer }) =>
          !normalizedSearch ||
          `${question} ${answer}`.toLowerCase().includes(normalizedSearch)
        ),
      }))
      .filter((group) => group.questions.length > 0);
  }, [activeGroup, search]);

  function selectGroup(groupId) {
    setActiveGroup(groupId);
    setOpenQuestion(null);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Help &amp; FAQs</span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>PRENAXO HELP CENTRE</span>
            <h1>How can we <span>help?</span></h1>
            <p>
              Quick answers about shopping, payments and getting your order
              delivered.
            </p>
            <label className={styles.searchBox}>
              <Search size={19} aria-hidden="true" />
              <span className={styles.visuallyHidden}>Search questions</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpenQuestion(null);
                }}
                placeholder="Search for an answer..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </label>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.artHalo} />
            <div className={styles.artCard}>
              <span><CircleHelp size={35} /></span>
              <strong>Here to help</strong>
              <small>Answers, made easy</small>
            </div>
            <span className={styles.artDot} />
          </div>
        </section>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeading}>Browse by topic</div>
            <button
              className={`${styles.topicButton} ${activeGroup === 'all' ? styles.topicActive : ''}`}
              type="button"
              onClick={() => selectGroup('all')}
            >
              <CircleHelp size={17} />
              <span>All questions</span>
              <small>{faqGroups.reduce((total, group) => total + group.questions.length, 0)}</small>
            </button>
            {faqGroups.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  className={`${styles.topicButton} ${activeGroup === group.id ? styles.topicActive : ''}`}
                  key={group.id}
                  type="button"
                  onClick={() => selectGroup(group.id)}
                >
                  <Icon size={17} />
                  <span>{group.label}</span>
                  <small>{group.questions.length}</small>
                </button>
              );
            })}
            <div className={styles.helpCard}>
              <span className={styles.helpIcon}><Headphones size={19} /></span>
              <strong>Still need help?</strong>
              <p>Our team can help with your order or product question.</p>
              <Link href="/contact">Contact support <ArrowRight size={15} /></Link>
              <a href="tel:01608069154">Call 01608069154</a>
            </div>
          </aside>

          <section className={styles.questions} aria-live="polite">
            <div className={styles.questionsHeading}>
              <div>
                <span className={styles.eyebrow}>HELP &amp; SUPPORT</span>
                <h2>{search ? 'Search results' : activeGroup === 'all' ? 'Frequently asked questions' : faqGroups.find((group) => group.id === activeGroup)?.label}</h2>
              </div>
              <span className={styles.resultCount}>
                {visibleGroups.reduce((total, group) => total + group.questions.length, 0)} answers
              </span>
            </div>

            {visibleGroups.length ? visibleGroups.map((group) => {
              const Icon = group.icon;
              return (
                <section className={styles.questionGroup} key={group.id}>
                  {activeGroup === 'all' && !search && (
                    <h3><Icon size={18} />{group.label}</h3>
                  )}
                  <div className={styles.accordion}>
                    {group.questions.map(({ question, answer }, index) => {
                      const questionId = `${group.id}-${index}`;
                      const isOpen = openQuestion === questionId;
                      return (
                        <article
                          className={`${styles.question} ${isOpen ? styles.questionOpen : ''}`}
                          key={question}
                          style={{ '--faq-index': index }}
                        >
                          <h4>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`${questionId}-answer`}
                              onClick={() => setOpenQuestion(isOpen ? null : questionId)}
                            >
                              <span>{question}</span>
                              <ChevronDown size={18} aria-hidden="true" />
                            </button>
                          </h4>
                          <div
                            className={styles.answer}
                            id={`${questionId}-answer`}
                            aria-hidden={!isOpen}
                          >
                            <div>
                              <p>{answer}</p>
                              {question.toLowerCase().includes('track') && (
                                <Link href="/track-order" tabIndex={isOpen ? 0 : -1}>Track your order <ArrowRight size={14} /></Link>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            }) : (
              <div className={styles.noResults}>
                <span><Search size={22} /></span>
                <h3>No matching answers</h3>
                <p>Try another search, or contact our support team for help.</p>
                <button type="button" onClick={() => { setSearch(''); setActiveGroup('all'); }}>
                  Clear search
                </button>
              </div>
            )}

            <div className={styles.bottomHelp}>
              <div>
                <strong>Didn&apos;t find what you were looking for?</strong>
                <span>We&apos;re happy to help with your Prenaxo order.</span>
              </div>
              <Link href="/contact">Get in touch <ArrowRight size={16} /></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
