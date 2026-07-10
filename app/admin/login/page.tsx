"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailRef = useRef<HTMLInputElement>(null);

    // Focus email on mount (reliable across the Suspense boundary, unlike the autoFocus attr).
    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() || undefined, password }),
            });

            if (res.ok) {
                const redirectTo = searchParams.get("from") || "/admin";
                router.push(redirectTo);
                router.refresh();
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.error || "Invalid email or password");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-brand-dark tracking-wider">XELLÉ</h1>
                    <p className="text-brand-dark/50 text-sm mt-1">Admin Access</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-brand-lilac/10 p-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs text-brand-dark/60 mb-1">
                            Admin Email
                        </label>
                        <input
                            ref={emailRef}
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@xelle.com"
                            autoComplete="username"
                            className="w-full border border-brand-lilac/20 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs text-brand-dark/60 mb-1">
                            Admin Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            autoComplete="current-password"
                            className="w-full border border-brand-lilac/20 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-brand-purple text-white rounded-md py-2.5 text-sm font-medium hover:bg-brand-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

