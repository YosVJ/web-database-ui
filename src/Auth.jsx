import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";

export default function Auth({ session }) {
  const navigate = useNavigate();

  // ✅ Step 5: Redirect when logged in
  useEffect(() => {
    if (session) navigate("/companies", { replace: true });
  }, [session, navigate]);

  async function signInWithMicrosoft() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) console.error("Microsoft sign-in error:", error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-2 opacity-80">Sign in to continue.</p>

        <button
          onClick={signInWithMicrosoft}
          className="mt-6 w-full rounded-xl px-4 py-3 border border-white/10 bg-white/10 hover:bg-white/15 transition font-medium"
        >
          Continue with Microsoft
        </button>
      </div>
    </div>
  );
}
