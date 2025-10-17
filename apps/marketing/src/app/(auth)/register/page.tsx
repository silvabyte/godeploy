"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import { Logo } from "@/components/Logo";
import { SlimLayout } from "@/components/SlimLayout";
import { initTelemetry, trackEvent } from "@/app/telemetry/telemetry";
import { Potatosaur } from "@/components/Potatosaur";
import "./RegisterAnimations.css";

// Initialize Supabase client
const supabaseUrl = "https://gadyljeftebtastrldaq.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZHlsamVmdGVidGFzdHJsZGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMDE4MjIsImV4cCI6MjA1NzU3NzgyMn0.e23L-rGJcQheuJhhIDnPsZcLs27d9g5KHevW_6pGJaU";

export default function Register() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const supabase = createClient(supabaseUrl, supabaseKey);

			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `https://godeploy-auth--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/authenticate`,
				},
			});

			if (error) throw error;

			trackEvent("signup.success", {
				email,
			});

			setMessage({
				type: "success",
				text: "Magic link sent! Check your email to start deploying.",
			});
		} catch (error: any) {
			trackEvent("signup.failure", {
				email,
				error: error.error_description || error.message || "Unknown error",
			});
			setMessage({
				type: "error",
				text:
					error.error_description ||
					error.message ||
					"An error occurred during signup",
			});
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		initTelemetry();
		trackEvent("page_view", {
			page: "register",
		});
	}, []);

	return (
		<SlimLayout>
			<div className="relative">
				<Link href="/" aria-label="Home">
					<Logo className="h-10 w-auto" />
				</Link>

				<h2 className="mt-8 text-lg font-semibold text-slate-900">
					Deploy your first app in seconds
				</h2>
				<p className="mt-2 text-sm text-slate-700">
					Already registered?{" "}
					<Link
						href="https://godeploy-auth--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app"
						className="font-medium text-green-600 hover:text-green-500"
					>
						Sign in
					</Link>{" "}
					to your account.
				</p>

				<div className="potatosaur-container absolute -top-50 right-0 hidden md:block">
					<div className="potatosaur-mascot rotate-3 transform">
						<Potatosaur />
					</div>
					<div className="potatosaur-speech absolute -top-6 -left-10 z-10 w-40 -rotate-6 transform rounded-lg border border-green-100 bg-green-50 p-3 font-mono text-xs text-slate-700 shadow-md">
						⚠️🚧⛑️ Ready to deploy your app in seconds? 🚀 💥 🔥
					</div>
				</div>
			</div>

			<div className="relative -mx-12 mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-sm shadow-md">
				<div className="flex items-center space-x-2 text-slate-400">
					<div className="h-2 w-2 rounded-full bg-red-500"></div>
					<div className="h-2 w-2 rounded-full bg-yellow-500"></div>
					<div className="h-2 w-2 rounded-full bg-green-500"></div>
				</div>
				<div className="mt-4 space-y-2 whitespace-nowrap">
					<div className="flex items-center space-x-2">
						<span className="text-slate-400">$</span>
						<span className="text-slate-200">
							curl -fsSL https://install.godeploy.app/sh | sh
						</span>
					</div>
					<div className="flex items-center space-x-2">
						<span className="text-slate-400">$</span>
						<span className="text-slate-200">cd my-app && npm run build</span>
					</div>
					<div className="flex items-center space-x-2">
						<span className="text-slate-400">$</span>
						<span className="text-slate-200">godeploy deploy</span>
					</div>
					<div className="text-green-400">
						✓ App deployed to https://my-app.godeploy.app in 0.8s
					</div>
				</div>
			</div>

			{message.text && (
				<div
					className={`mt-4 rounded p-3 font-mono text-sm ${
						message.type === "error"
							? "bg-red-50 text-red-700"
							: "bg-green-50 text-green-700"
					}`}
				>
					{message.text}
				</div>
			)}

			<form onSubmit={handleSignUp} className="mt-8 grid grid-cols-1 gap-y-6">
				<TextField
					className="col-span-full"
					label="Email address"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<div className="col-span-full">
					<Button
						type="submit"
						color="green"
						className="w-full cursor-pointer"
						disabled={loading}
					>
						<span>
							{loading ? "Sending magic link..." : "Get started"}{" "}
							{!loading && <span aria-hidden="true">&rarr;</span>}
						</span>
					</Button>
				</div>

				<div className="text-center">
					<p className="text-xs text-slate-500">
						Everyone gets unlimited access for 14 days
					</p>
					<p className="mt-1 text-xs text-slate-500">
						Then $49/year or free tier
					</p>
				</div>
			</form>
		</SlimLayout>
	);
}
