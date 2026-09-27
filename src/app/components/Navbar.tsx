"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header>

            {/* Navbar */}
            <nav
                className="navbar"
                style={{ backgroundColor: "var(--surface)" }}
            >
                <div className="container-fluid">

                    {/* LUMOFULL Brand */}
                    <a href="/" className="navbar-brand fw-bold" style={{ color: "var(--foreground)" }}>
                        LUMOFULL
                    </a>

                    {/* Desktop Navigation */}
                    <div className="d-none d-lg-flex gap-2">
                        <a href="/shop" className="nav-link">
                            Shop
                        </a>

                        <a href="/stl-files" className="nav-link">
                            STL Files
                        </a>

                        <a href="/custom-orders" className="nav-link">
                            Custom Orders
                        </a>

                        <a href="/about" className="nav-link">
                            About
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        type="button"
                        className="btn d-lg-none p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={
                            mobileMenuOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        animate={mobileMenuOpen ? "open" : "closed"}
                        style={{
                            width: "48px",
                            height: "48px",
                            position: "relative",
                        }}
                    >
                        {/* Top Line */}
                        <motion.span
                            className="position-absolute"
                            style={{
                                width: "24px",
                                left: "12px",
                                top: "17px",
                                borderTop: "2px solid var(--icon)",
                            }}
                            variants={{
                                closed: {
                                    rotate: 0,
                                    y: 0,
                                },
                                open: {
                                    rotate: 45,
                                    y: 7,
                                },
                            }}
                        />

                        {/* Middle Line */}
                        <motion.span
                            className="position-absolute"
                            style={{
                                width: "24px",
                                left: "12px",
                                top: "24px",
                                borderTop: "2px solid var(--icon)",
                            }}
                            variants={{
                                closed: {
                                    opacity: 1,
                                    transition: {
                                        duration: 0,
                                    }
                                },
                                open: {
                                    opacity: 0,
                                    transition: {
                                        duration: 0,
                                    }
                                },
                            }}
                        />

                        {/* Bottom Line */}
                        <motion.span
                            className="position-absolute"
                            style={{
                                width: "24px",
                                left: "12px",
                                top: "31px",
                                borderTop: "2px solid var(--icon)",
                            }}
                            variants={{
                                closed: {
                                    rotate: 0,
                                    y: 0,
                                },
                                open: {
                                    rotate: -45,
                                    y: -7,
                                },
                            }}
                        />
                    </motion.button>

                </div>
            </nav>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
                <motion.div
                    className="d-lg-none border-top"
                    style={{ backgroundColor: "var(--surface)" }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                >
                    <div className="container-fluid py-3">

                        {/* Mobile Navigation */}
                        <div className="d-flex flex-column gap-2">

                            <a
                                href="/shop"
                                className="nav-link fs-5 p-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Shop
                            </a>

                            <a
                                href="/stl-files"
                                className="nav-link fs-5 p-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                STL Files
                            </a>

                            <a
                                href="/custom-orders"
                                className="nav-link fs-5 p-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Custom Orders
                            </a>

                            <a
                                href="/about"
                                className="nav-link fs-5 p-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </a>

                        </div>

                    </div>
                </motion.div>
            )}

        </header>
    );
}