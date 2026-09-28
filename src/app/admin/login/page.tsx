"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
async function handleSignIn() {
    console.log("Email state:", email);
    console.log("Password entered:", password.length > 0);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    console.log("Login data:", data);
    console.log("Login error:", error);
}
    return (
        <main className="container py-5">
            <div
                className="mx-auto p-4 rounded-3"
                style={{
                    maxWidth: "420px",
                    backgroundColor: "var(--surface)",
                }}
            >
                <h1 className="h3 fw-semibold mb-4">
                    Admin Login
                </h1>

                <div className="mb-3">
                    <label className="form-label">
                        Email
                    </label>

                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label">
                        Password
                    </label>

                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="btn w-100 fw-semibold"
                    style={{
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                    }}
                    onClick={handleSignIn}
                >
                    Sign In
                </button>
            </div>
        </main>
    );
}