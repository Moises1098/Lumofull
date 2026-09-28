export default function Shop() {
    const products = Array.from({ length: 12 });

    return (
        <main>
            {/* Shop */}
            <section className="container py-5">
                <div className="text-center py-4">
                    <h1 className="display-4 fw-bold mb-3" style={{ color: "var(--primary)" }}>
                        Shop
                    </h1>
                    <p className="fs-5 mx-auto mb-0" style={{ color: "var(--secondary)", maxWidth: "600px" }}>
                        Browse LUMOFULL's collection of 3D printed objects crafted to bringlight, color, and personality to your space.
                    </p>
                </div>
            </section>

            {/* Products */}
            <section className="container py-5">
                <div className="row g-4">
                    {products.map((_, index) => (
                        <div key={index} className="col-6 col-lg-3">
                            {/* Product Image */}
                            <div className="overflow-hidden rounded-3 mb-3" style={{aspectRatio: "1/1", backgroundColor: "var(--surface)"}}>
                                <img 
                                    src="/placeholder.jpg"
                                    className="w-180 h-100 object-fit-cover"
                                    alt={`Product ${index + 1}`}
                                />
                            </div>

                            {/* Product Info */}
                            <div>
                                <h2 className="fs-6 fw-semibold mb-1" style={{ color: "var(--primary)" }}>
                                    Product {index + 1}
                                </h2>
                                <p className="small mb-1" style={{ color: "var(--secondary)" }}>
                                    A brief description of the product.
                                </p>
                                <p className="fs-semibold mb-0" style={{ color: "var(--foreground)" }}>
                                    $150
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section >
        </main >
    )
}