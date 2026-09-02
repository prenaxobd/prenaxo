import { Building2 } from 'lucide-react';

export default function BrandRail({
  brands,
}) {
  if (!brands?.length) return null;

  return (
    <section className="home-section home-brand-section">

      <div className="container">

        <div className="section-head">

          <div>

            <div className="eyebrow home-eyebrow">
              Trusted names
            </div>

            <h2>Our brands</h2>

          </div>

        </div>


        <div className="home-brand-grid">

          {brands.map((brand) => (

            <div
              className="home-brand"
              key={brand}
            >

              <span className="home-brand-icon">
                <Building2 size={20} />
              </span>

              <strong>
                {brand}
              </strong>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}