export default function Admin() {
    const products = Array.from({ length: 3 });

    return (
        <main className="container py-5">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1
                        className="display-5 fw-bold mb-1"
                        style={{ color: "var(--primary)" }}
                    >
                        Products
                    </h1>

                    <p
                        className="mb-0"
                        style={{ color: "var(--secondary)" }}
                    >
                        Manage your LUMOFULL products.
                    </p>
                </div>

                <a
                    href="/admin/products/new"
                    className="btn px-4 py-2 fw-semibold"
                    style={{
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                    }}
                >
                    + Add Product
                </a>
            </div>


            {/* Product List */}
            <div
                className="border rounded-3 overflow-hidden"
                style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                }}
            >

                {/* Table Header */}
                <div
                    className="row align-items-center px-4 py-3 fw-semibold d-none d-md-flex"
                    style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--secondary)",
                    }}
                >
                    <div className="col-6">Product</div>
                    <div className="col-2">Price</div>
                    <div className="col-2">Status</div>
                    <div className="col-2 text-end">Actions</div>
                </div>


                {/* Products */}
                {products.map((_, index) => (
                    <div
                        key={index}
                        className="row align-items-center px-4 py-3 border-top"
                        style={{ borderColor: "var(--border)" }}
                    >

                        {/* Product */}
                        <div className="col-12 col-md-6 d-flex align-items-center gap-3">

                            <div
                                className="rounded-2 flex-shrink-0"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    backgroundColor: "var(--surface)",
                                }}
                            />

                            <div>
                                <p
                                    className="fw-semibold mb-0"
                                    style={{ color: "var(--primary)" }}
                                >
                                    Product {index + 1}
                                </p>

                                <small style={{ color: "var(--secondary)" }}>
                                    3D printed lighting
                                </small>
                            </div>

                        </div>


                        {/* Price */}
                        <div className="col-4 col-md-2 mt-3 mt-md-0">
                            $150
                        </div>


                        {/* Status */}
                        <div className="col-4 col-md-2 mt-3 mt-md-0">
                            <span
                                className="badge rounded-pill"
                                style={{
                                    backgroundColor: "var(--surface)",
                                    color: "var(--primary)",
                                }}
                            >
                                Published
                            </span>
                        </div>


                        {/* Actions */}
                        <div className="col-4 col-md-2 text-end mt-3 mt-md-0">
                            <button
                                className="btn btn-sm me-2"
                                style={{ color: "var(--accent)" }}
                            >
                                Edit
                            </button>

                            <button
                                className="btn btn-sm"
                                style={{ color: "#dc3545" }}
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))}

            </div>

        </main>
    );
}