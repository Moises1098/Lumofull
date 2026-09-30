"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type AddProductModalProps = {
    show: boolean;
    onClose: () => void;
    onAdded: () => void;
};

type ProductImage = {
    file: File;
    preview: string;
};



export default function AddProductModal({
    show,
    onClose,
    onAdded,
}: AddProductModalProps) {

    const [images, setImages] = useState<ProductImage[]>([]);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [price, setPrice] = useState<number | "">("");
    const [isAdding, setIsAdding] = useState(false);
    const [status, setStatus] = useState("draft");
    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    // Add Images
    function handleImages(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;

        if (!files) return;

        const newImages: ProductImage[] = Array.from(files).map((file) => ({
            file: file,
            preview: URL.createObjectURL(file),
        }));

        setImages((currentImages) => [
            ...currentImages,
            ...newImages,
        ]);
    }

    // Remove Images
    function removeImage(index: number) {
        setImages((currentImages) => {
            URL.revokeObjectURL(currentImages[index].preview);

            return currentImages.filter((_, i) => i !== index);
        });
    }

    async function uploadProductImage(image: ProductImage, productId: number) {
        const filePath = `${productId}/${crypto.randomUUID()}-${image.file.name}`;

        const { data, error } = await supabase.storage
            .from("product-images")
            .upload(filePath, image.file);

        console.log("Image upload:", data);
        console.log("Image upload error:", error);

        if (error) {
            return null;
        }

        return data.path;
    }

    async function handleAddProduct() {
        setNameError("");
        setPriceError("");

        let hasError = false;

        if (name.trim() === "") {
            setNameError("Please enter a product name.");
            hasError = true;
        }

        if (price === "") {
            setPriceError("Please enter a price.");
            hasError = true;
        } else if (price <= 0) {
            setPriceError("Price must be greater than $0.");
            hasError = true;
        }

        if (hasError) {
            return;
        }
        setIsAdding(true);
        const { data, error } = await supabase
            .from("products")
            .insert({
                name: name,
                description: description,
                price: price,
                status: status,
                sku: `LUM-${Date.now()}`,
            })
            .select();

        console.log("Product:", data);
        console.log("Error:", error);
        if (error) {
            setIsAdding(false);
            return;
        }

        if (data && data.length > 0) {
            const productId = data[0].id;

            for (const [index, image] of images.entries()) {
                const storagePath = await uploadProductImage(image, productId);
                if (!storagePath) {
                    setIsAdding(false);
                    return;
                }
                if (storagePath) {
                    const { error: imageError } = await supabase
                        .from("product_images")
                        .insert({
                            product_id: productId,
                            storage_path: storagePath,
                            sort_order: index,
                        });

                    console.log("Image database error:", imageError);
                    if (imageError) {
                        setIsAdding(false);
                        return;
                    }
                }
            }
        }
        setIsAdding(false);
        onAdded();
    }

    if (!show) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1050,
            }}
        >
            <div
                className="rounded-4 shadow p-4 w-100 mx-3"
                style={{
                    maxWidth: "600px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    backgroundColor: "var(--background)",
                }}
            >

                {/* Modal Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2
                        className="fw-bold mb-0"
                        style={{ color: "var(--primary)" }}
                    >
                        Add Product
                    </h2>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isAdding}
                    />
                </div>


                {/* Product Name */}
                <div className="mb-3">
                    <label className="form-label">
                        Product Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && (
                        <div
                            className="small mt-2"
                            style={{ color: "#dc3545" }}
                        >
                            {nameError}
                        </div>
                    )}
                </div>


                {/* Description */}
                <div className="mb-3">
                    <label className="form-label">
                        Description
                    </label>

                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Enter product description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>


                {/* Price */}
                <div className="mb-3">
                    <label className="form-label">
                        Price
                    </label>

                    <div className="input-group">
                        <span className="input-group-text">
                            $
                        </span>

                        <input
                            type="number"
                            className="form-control"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) =>
                                setPrice(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                        {priceError && (
                            <div
                                className="small mt-2"
                                style={{ color: "#dc3545" }}
                            >
                                {priceError}
                            </div>
                        )}
                    </div>
                </div>


                {/* Product Images */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Product Images
                    </label>

                    {/* Add Images */}
                    <label
                        className="d-flex flex-column align-items-center justify-content-center rounded-3 p-4 text-center"
                        style={{
                            border: "2px dashed var(--border)",
                            backgroundColor: "var(--surface)",
                            cursor: "pointer",
                            minHeight: "150px",
                        }}
                    >
                        <span
                            className="fw-semibold mb-1"
                            style={{ color: "var(--primary)" }}
                        >
                            + Add Images
                        </span>

                        <span
                            className="small"
                            style={{ color: "var(--secondary)" }}
                        >
                            Upload Product Images (JPG, PNG, GIF)
                        </span>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="d-none"
                            onChange={handleImages}
                        />
                    </label>


                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="row g-2 mt-2">

                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="col-3"
                                >
                                    <div
                                        className="position-relative overflow-hidden rounded-2"
                                        style={{
                                            aspectRatio: "1 / 1",
                                            backgroundColor: "var(--surface)",
                                        }}
                                    >
                                        <img
                                            src={image.preview}
                                            alt={`Product preview ${index + 1}`}
                                            className="w-100 h-100 object-fit-cover"
                                        />

                                        {/* Remove Image */}
                                        <button
                                            type="button"
                                            className="btn-close position-absolute top-0 end-0 m-1 bg-white"
                                            aria-label="Remove image"
                                            onClick={() => removeImage(index)}
                                        />
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>


                {/* Status */}
                <div className="mb-4">
                    <label className="form-label">
                        Status
                    </label>

                    <select value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="form-select"
                    >
                        <option value="published">
                            Published
                        </option>

                        <option value="draft">
                            Draft
                        </option>
                    </select>
                </div>


                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={onClose}
                        disabled={isAdding}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn fw-semibold"
                        style={{
                            backgroundColor: "var(--accent)",
                            color: "#fff",
                        }}
                        onClick={handleAddProduct}
                        disabled={isAdding}
                    >
                        {isAdding ? "Adding..." : "Add Product"}
                    </button>
                </div>

            </div>
        </div>
    );
}