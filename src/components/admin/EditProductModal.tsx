"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type EditProductModalProps = {
    product: any;
    onClose: () => void;
    onUpdated: () => void;
};

type ExistingImage = {
    storage_path: string;
    sort_order: number;
};

type NewImage = {
    file: File;
    preview: string;
};

export default function EditProductModal({
    product,
    onClose,
    onUpdated,
}: EditProductModalProps) {
    const [name, setName] = useState<string>(product.name);
    const [description, setDescription] = useState<string>(
        product.description || ""
    );
    const [price, setPrice] = useState<number | "">(
        Number(product.price)
    );
    const [status, setStatus] = useState(product.status);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>(
        product.product_images || []
    );
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<NewImage[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    function handleNewImages(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;

        if (!files) return;

        const selectedImages: NewImage[] = Array.from(files).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setNewImages((currentImages) => [
            ...currentImages,
            ...selectedImages,
        ]);
    }

    function removeNewImage(index: number) {
        URL.revokeObjectURL(newImages[index].preview);

        setNewImages((currentImages) =>
            currentImages.filter((_, imageIndex) => imageIndex !== index)
        );
    }

    function removeExistingImage(storagePath: string) {
        setRemovedImages((currentImages) => [
            ...currentImages,
            storagePath,
        ]);

        setExistingImages((currentImages) =>
            currentImages.filter(
                (image) => image.storage_path !== storagePath
            )
        );
    }

    async function uploadProductImage(
        image: NewImage,
        productId: number
    ) {
        const filePath =
            `${productId}/${crypto.randomUUID()}-${image.file.name}`;

        const { data, error } = await supabase.storage
            .from("product-images")
            .upload(filePath, image.file);

        if (error) {
            throw error;
        }

        return data.path;
    }

    async function handleSaveChanges() {
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
        setIsSaving(true);
        const { error } = await supabase
            .from("products")
            .update({
                name,
                description,
                price,
                status,
            })
            .eq("id", product.id);

        if (error) {
            console.error("Product update failed:");
            console.error("Message:", error.message);
            console.error("Code:", error.code);
            console.error("Details:", error.details);
            console.error("Hint:", error.hint);

            setIsSaving(false);
            return;
        }

        if (!error && removedImages.length > 0) {
            const { error: imageDeleteError } = await supabase
                .from("product_images")
                .delete()
                .in("storage_path", removedImages);

            console.log("Image database delete error:", imageDeleteError);
            if (imageDeleteError) {
                console.error(
                    "Image database deletion failed:",
                    imageDeleteError
                );
                setIsSaving(false);
                return;
            }
            if (!imageDeleteError) {
                const { error: storageDeleteError } = await supabase.storage
                    .from("product-images")
                    .remove(removedImages);

                console.log(
                    "Storage delete error:",
                    storageDeleteError
                );
                if (storageDeleteError) {
                    console.error(
                        "Storage image deletion failed:",
                        storageDeleteError
                    );
                    setIsSaving(false);
                    return;
                }
            }
        }
        if (!error && newImages.length > 0) {
            for (const [index, image] of newImages.entries()) {
                const storagePath = await uploadProductImage(
                    image,
                    product.id
                );
                if (!storagePath) {
                    console.error("New image upload failed.");
                    setIsSaving(false);
                    return;
                }

                if (storagePath) {
                    const { error: imageInsertError } = await supabase
                        .from("product_images")
                        .insert({
                            product_id: product.id,
                            storage_path: storagePath,
                            sort_order: existingImages.length + index,
                        });
                    if (imageInsertError) {
                        console.error(
                            "Image database insert failed:",
                            imageInsertError
                        );
                        setIsSaving(false);
                        return;
                    }

                    console.log(
                        "Image insert error:",
                        imageInsertError
                    );
                }
            }
        }

        onUpdated();
    }

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
                        Edit Product
                    </h2>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isSaving}
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

                    {existingImages.length > 0 && (
                        <div className="row g-2 mt-1">
                            {existingImages.map((image, index) => (
                                <div
                                    key={image.storage_path}
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
                                            src={
                                                supabase.storage
                                                    .from("product-images")
                                                    .getPublicUrl(image.storage_path)
                                                    .data.publicUrl
                                            }
                                            alt={`Product image ${index + 1}`}
                                            className="w-100 h-100 object-fit-cover"
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                            onClick={() => removeExistingImage(image.storage_path)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Images */}
                <label
                    className="d-flex flex-column align-items-center justify-content-center rounded-3 p-4 text-center mt-3"
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

                    {/* New Image Previews */}
                    {newImages.length > 0 && (
                        <div className="row g-2 mt-2">
                            {newImages.map((image, index) => (
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
                                            alt={`New product preview ${index + 1}`}
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                            onClick={() => removeNewImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
                        onChange={handleNewImages}
                    />
                </label>

                {/* Status */}
                <div className="mb-4">
                    <label className="form-label">
                        Status
                    </label>

                    <select
                        value={status}
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
                        className="btn btn-outline-secondary"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Close"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>


            </div>
        </div>
    );
}