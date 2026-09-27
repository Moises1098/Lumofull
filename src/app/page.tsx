export default function Home() {
  return (
    <main>

      {/* Hero */}
      <section className="container py-5">
        <div
          className="d-flex flex-column justify-content-center"
          style={{ minHeight: "70vh" }}
        >
          <div style={{ maxWidth: "760px" }}>

            {/* Eyebrow */}
            <p
              className="text-uppercase fw-semibold mb-3"
              style={{
                color: "var(--accent)",
                letterSpacing: "0.12em",
              }}
            >
              Designed • Printed • Illuminated
            </p>

            {/* Heading */}
            <h1
              className="display-1 fw-bold mb-4"
              style={{
                color: "var(--primary)",
                letterSpacing: "-0.04em",
              }}
            >
              Light up your space.
            </h1>

            {/* Description */}
            <p
              className="fs-4 mb-4"
              style={{
                color: "var(--secondary)",
                maxWidth: "620px",
              }}
            >
              Custom 3D printed lighting and objects designed
              to make your space yours.
            </p>

            {/* Actions */}
            <div className="d-flex flex-wrap gap-3">
              <a
                href="/shop"
                className="btn btn-lg px-4 py-3 fw-semibold"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                }}
              >
                Shop
              </a>

              <a
                href="/custom-orders"
                className="btn btn-lg px-4 py-3 fw-semibold"
                style={{
                  color: "var(--primary)",
                  borderColor: "var(--secondary)",
                }}
              >
                Custom Orders
              </a>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}