export default function AdminModuleState({ eyebrow, title, heading, message }) {
  return (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <section className="section admin-empty-state">
        <h2>{heading}</h2>
        <p className="muted">{message}</p>
      </section>
    </>
  );
}