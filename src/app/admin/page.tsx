"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import AddProductModal from "../../components/admin/AddProductModal";
import EditProductModal from "@/components/admin/EditProductModal";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    const router = useRouter();

    async function fetchProducts() {
        const { data, error } = await supabase
            .from("products")
            .select(`
                *,
                product_images (
                    storage_path,
                    sort_order
                )
            `)
            .order("created_at", { ascending: false })
            .order("sort_order", {
                referencedTable: "product_images",
                ascending: true,
            });

        console.log("Products:", data);
        console.log("Products error:", error);

        if (data) {
            setProducts(data);
        }
    }

    useEffect(() => {
        async function checkSession() {
            const { data } = await supabase.auth.getSession();

            console.log("Admin session:", data.session);

            if (!data.session) {
                router.replace("/admin/login");
                return;
            }

            setCheckingAuth(false);
        }

        checkSession();
        fetchProducts();
    }, []);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/admin/login");
    }

    async function handleDeleteProduct(product: any) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        const imagePaths =
            product.product_images?.map(
                (image: any) => image.storage_path
            ) || [];

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", product.id);

        console.log("Delete error:", error);

        if (!error) {
            if (imagePaths.length > 0) {
                await supabase.storage
                    .from("product-images")
                    .remove(imagePaths);
            }

            setSelectedProducts((current) =>
                current.filter((id) => id !== product.id)
            );

            fetchProducts();
        }
    }

    function handleProductSelection(
        productId: number,
        checked: boolean
    ) {
        if (checked) {
            setSelectedProducts((current) => {
                if (current.includes(productId)) {
                    return current;
                }

                return [...current, productId];
            });
        } else {
            setSelectedProducts((current) =>
                current.filter((id) => id !== productId)
            );
        }
    }

    function handleSelectAll(checked: boolean) {
        if (checked) {
            setSelectedProducts(
                products.map((product) => product.id)
            );
        } else {
            setSelectedProducts([]);
        }
    }

    async function handleBulkStatus(
        status: "published" | "draft"
    ) {
        if (selectedProducts.length === 0) return;

        const { error } = await supabase
            .from("products")
            .update({ status })
            .in("id", selectedProducts);

        console.log("Bulk status update error:", error);

        if (!error) {
            setSelectedProducts([]);
            fetchProducts();
        }
    }

    if (checkingAuth) {
        return null;
    }

    const allProductsSelected =
        products.length > 0 &&
        products.every((product) =>
            selectedProducts.includes(product.id)
        );

    return (
        <main className="container py-5">

            {/* ================= HEADER ================= */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
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

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn px-4 py-2 fw-semibold"
                        style={{
                            backgroundColor: "var(--accent)",
                            color: "#fff",
                        }}
                        onClick={() =>
                            setShowAddProduct(true)
                        }
                    >
                        + Add Product
                    </button>

                    <button
                        type="button"
                        className="btn"
                        style={{
                            color: "var(--secondary)",
                        }}
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </div>


            {/* ================= PRODUCT LIST ================= */}

            <div
                className="border rounded-3 overflow-hidden"
                style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--background)",
                }}
            >

                {/* Selection Toolbar */}

                <div
                    className="d-flex flex-wrap align-items-center gap-2 px-4 py-3"
                    style={{
                        borderBottom:
                            "1px solid var(--border)",
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                            handleSelectAll(true)
                        }
                    >
                        Check All
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                            handleSelectAll(false)
                        }
                    >
                        Uncheck All
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={
                            selectedProducts.length === 0
                        }
                        onClick={() =>
                            handleBulkStatus("published")
                        }
                    >
                        Publish Selected
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={
                            selectedProducts.length === 0
                        }
                        onClick={() =>
                            handleBulkStatus("draft")
                        }
                    >
                        Move to Draft
                    </button>

                    <div
                        className="vr mx-2"
                        style={{
                            color: "var(--border)",
                        }}
                    />

                    <span
                        className="small"
                        style={{
                            color: "var(--secondary)",
                        }}
                    >
                        {selectedProducts.length} out of{" "}
                        {products.length}{" "}
                        {products.length === 1
                            ? "product"
                            : "products"}
                    </span>
                </div>


                {/* ================= DESKTOP HEADER ================= */}

                <div
                    className="row align-items-center g-0 px-4 py-3 fw-semibold d-none d-md-flex"
                    style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--secondary)",
                    }}
                >
                    <div
                        className="col-auto d-flex align-items-center justify-content-center"
                        style={{ width: "46px" }}
                    >
                        <input
                            type="checkbox"
                            className="form-check-input m-0"
                            checked={allProductsSelected}
                            onChange={(event) =>
                                handleSelectAll(
                                    event.target.checked
                                )
                            }
                            aria-label="Select all products"
                        />
                    </div>

                    <div className="col">
                        Product
                    </div>

                    <div style={{ width: "120px" }}>
                        Price
                    </div>

                    <div style={{ width: "120px" }}>
                        Status
                    </div>

                    <div
                        className="text-end"
                        style={{ width: "150px" }}
                    >
                        Actions
                    </div>
                </div>


                {/* ================= PRODUCTS ================= */}

                {products.length === 0 ? (
                    <div
                        className="text-center px-4 py-5"
                        style={{
                            color: "var(--secondary)",
                        }}
                    >
                        No products yet.
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="px-4 py-3"
                            style={{
                                borderTop:
                                    "1px solid var(--border)",
                            }}
                        >

                            {/* ============= DESKTOP PRODUCT ============= */}

                            <div className="row align-items-center g-0 d-none d-md-flex">

                                {/* ONE product checkbox */}

                                <div
                                    className="col-auto d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "46px",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="form-check-input m-0"
                                        checked={selectedProducts.includes(
                                            product.id
                                        )}
                                        onChange={(event) =>
                                            handleProductSelection(
                                                product.id,
                                                event.target.checked
                                            )
                                        }
                                        aria-label={`Select ${product.name}`}
                                    />
                                </div>


                                {/* Product */}

                                <div className="col d-flex align-items-center gap-3 pe-3">
                                    {product.product_images
                                        ?.length > 0 ? (
                                        <img
                                            src={
                                                supabase.storage
                                                    .from(
                                                        "product-images"
                                                    )
                                                    .getPublicUrl(
                                                        product
                                                            .product_images[0]
                                                            .storage_path
                                                    ).data
                                                    .publicUrl
                                            }
                                            alt={
                                                product.name
                                            }
                                            className="rounded-2 flex-shrink-0"
                                            style={{
                                                width: 60,
                                                height: 60,
                                                objectFit:
                                                    "cover",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-2 flex-shrink-0"
                                            style={{
                                                width: 60,
                                                height: 60,
                                                backgroundColor:
                                                    "var(--surface)",
                                            }}
                                        />
                                    )}

                                    <div
                                        style={{
                                            minWidth: 0,
                                            width: "100%",
                                        }}
                                    >
                                        <p
                                            className="fw-semibold mb-0"
                                            style={{
                                                color: "var(--primary)",
                                            }}
                                        >
                                            {product.name}
                                        </p>

                                        <small
                                            className="d-block"
                                            style={{
                                                color: "var(--secondary)",
                                                overflowWrap:
                                                    "break-word",
                                            }}
                                        >
                                            {
                                                product.description
                                            }
                                        </small>
                                    </div>
                                </div>


                                {/* Price */}

                                <div
                                    style={{
                                        width: "120px",
                                    }}
                                >
                                    $
                                    {Number(
                                        product.price
                                    ).toFixed(2)}
                                </div>


                                {/* Status */}

                                <div
                                    style={{
                                        width: "120px",
                                    }}
                                >
                                    <span
                                        className="badge rounded-pill"
                                        style={{
                                            backgroundColor:
                                                product.status ===
                                                "published"
                                                    ? "#e8f5e9"
                                                    : "#f1f3f5",

                                            color:
                                                product.status ===
                                                "published"
                                                    ? "#2e7d32"
                                                    : "var(--secondary)",
                                        }}
                                    >
                                        {product.status ===
                                        "published" ? (
                                            <span className="d-inline-flex align-items-center gap-2">
                                                <motion.span
                                                    animate={{
                                                        opacity: [
                                                            1,
                                                            0.25,
                                                            1,
                                                        ],
                                                        scale: [
                                                            1,
                                                            0.7,
                                                            1,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat:
                                                            Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                    style={{
                                                        width: 7,
                                                        height: 7,
                                                        minWidth: 7,
                                                        borderRadius:
                                                            "50%",
                                                        backgroundColor:
                                                            "#2e7d32",
                                                        display:
                                                            "inline-block",
                                                    }}
                                                />

                                                Published
                                            </span>
                                        ) : (
                                            <span className="d-inline-flex align-items-center gap-2">
                                                <span
                                                    style={{
                                                        width: 7,
                                                        height: 7,
                                                        minWidth: 7,
                                                        borderRadius:
                                                            "50%",
                                                        backgroundColor:
                                                            "var(--secondary)",
                                                        display:
                                                            "inline-block",
                                                    }}
                                                />

                                                Draft
                                            </span>
                                        )}
                                    </span>
                                </div>


                                {/* Actions */}

                                <div
                                    className="d-flex justify-content-end"
                                    style={{
                                        width: "150px",
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-sm me-2"
                                        style={{
                                            color: "var(--accent)",
                                        }}
                                        onClick={() =>
                                            setEditingProduct(
                                                product
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        style={{
                                            color: "#dc3545",
                                        }}
                                        onClick={() =>
                                            handleDeleteProduct(
                                                product
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>


                            {/* ============= MOBILE PRODUCT ============= */}

                            <div className="d-md-none">

                                {/* Product Name */}

                                <p
                                    className="fw-semibold mb-3"
                                    style={{
                                        color: "var(--primary)",
                                    }}
                                >
                                    {product.name}
                                </p>


                                <div className="d-flex align-items-start gap-2">

                                    {/* Selection + Image */}

                                    <div className="d-flex align-items-start gap-2 flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            className="form-check-input m-0 mt-1"
                                            checked={selectedProducts.includes(
                                                product.id
                                            )}
                                            onChange={(event) =>
                                                handleProductSelection(
                                                    product.id,
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                            aria-label={`Select ${product.name}`}
                                        />

                                        {product
                                            .product_images
                                            ?.length >
                                        0 ? (
                                            <img
                                                src={
                                                    supabase.storage
                                                        .from(
                                                            "product-images"
                                                        )
                                                        .getPublicUrl(
                                                            product
                                                                .product_images[0]
                                                                .storage_path
                                                        )
                                                        .data
                                                        .publicUrl
                                                }
                                                alt={
                                                    product.name
                                                }
                                                className="rounded-2"
                                                style={{
                                                    width: 70,
                                                    height: 70,
                                                    objectFit:
                                                        "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-2"
                                                style={{
                                                    width: 70,
                                                    height: 70,
                                                    backgroundColor:
                                                        "var(--surface)",
                                                }}
                                            />
                                        )}
                                    </div>


                                    {/* Description */}

                                    <div
                                        className="flex-grow-1"
                                        style={{
                                            minWidth: 0,
                                        }}
                                    >
                                        <small
                                            className="d-block"
                                            style={{
                                                color: "var(--secondary)",
                                                overflowWrap:
                                                    "break-word",
                                            }}
                                        >
                                            {
                                                product.description
                                            }
                                        </small>
                                    </div>


                                    {/* Price / Status / Actions */}

                                    <div
                                        className="flex-shrink-0"
                                        style={{
                                            width: "135px",
                                        }}
                                    >
                                        {/* Price + Status */}

                                        <div className="d-flex align-items-start gap-3 mb-3">
                                            <div>
                                                <small
                                                    className="d-block mb-1"
                                                    style={{
                                                        color: "var(--secondary)",
                                                    }}
                                                >
                                                    Price
                                                </small>

                                                <span className="small">
                                                    $
                                                    {Number(
                                                        product.price
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>

                                            <div>
                                                <small
                                                    className="d-block mb-1"
                                                    style={{
                                                        color: "var(--secondary)",
                                                    }}
                                                >
                                                    Status
                                                </small>

                                                <span
                                                    className="badge rounded-pill"
                                                    style={{
                                                        backgroundColor:
                                                            product.status ===
                                                            "published"
                                                                ? "#e8f5e9"
                                                                : "#f1f3f5",

                                                        color:
                                                            product.status ===
                                                            "published"
                                                                ? "#2e7d32"
                                                                : "var(--secondary)",
                                                    }}
                                                >
                                                    {product.status ===
                                                    "published" ? (
                                                        <span className="d-inline-flex align-items-center gap-1">
                                                            <motion.span
                                                                animate={{
                                                                    opacity:
                                                                        [
                                                                            1,
                                                                            0.25,
                                                                            1,
                                                                        ],
                                                                    scale:
                                                                        [
                                                                            1,
                                                                            0.7,
                                                                            1,
                                                                        ],
                                                                }}
                                                                transition={{
                                                                    duration: 1.2,
                                                                    repeat:
                                                                        Infinity,
                                                                    ease: "easeInOut",
                                                                }}
                                                                style={{
                                                                    width: 7,
                                                                    height: 7,
                                                                    minWidth: 7,
                                                                    borderRadius:
                                                                        "50%",
                                                                    backgroundColor:
                                                                        "#2e7d32",
                                                                    display:
                                                                        "inline-block",
                                                                }}
                                                            />

                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="d-inline-flex align-items-center gap-1">
                                                            <span
                                                                style={{
                                                                    width: 7,
                                                                    height: 7,
                                                                    minWidth: 7,
                                                                    borderRadius:
                                                                        "50%",
                                                                    backgroundColor:
                                                                        "var(--secondary)",
                                                                    display:
                                                                        "inline-block",
                                                                }}
                                                            />

                                                            Draft
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>


                                        {/* Edit + Delete */}

                                        <div className="d-flex gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-sm p-0"
                                                style={{
                                                    color: "var(--accent)",
                                                }}
                                                onClick={() =>
                                                    setEditingProduct(
                                                        product
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm p-0"
                                                style={{
                                                    color: "#dc3545",
                                                }}
                                                onClick={() =>
                                                    handleDeleteProduct(
                                                        product
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


            {/* ================= MODALS ================= */}

            <AddProductModal
                show={showAddProduct}
                onClose={() =>
                    setShowAddProduct(false)
                }
                onAdded={() => {
                    setShowAddProduct(false);
                    fetchProducts();
                }}
            />

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() =>
                        setEditingProduct(null)
                    }
                    onUpdated={() => {
                        setEditingProduct(null);
                        fetchProducts();
                    }}
                />
            )}
        </main>
    );
}