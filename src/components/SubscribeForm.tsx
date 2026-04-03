"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Email inválido"); return; }

    try {
      // Save to Firestore via a simple fetch (no auth required)
      const res = await fetch("https://us-central1-lupyx-talent.cloudfunctions.net/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Error al suscribirse");
      }
    } catch {
      setError("Error de conexión");
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#2EC4B6]">
        <CheckCircle className="h-4 w-4" />
        ¡Suscrito! Te avisaremos cuando publiquemos nuevas búsquedas.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        placeholder="tu@email.com"
        className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#2EC4B6]"
      />
      <button
        type="submit"
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[#2EC4B6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#26a89c]"
      >
        <Send className="h-3.5 w-3.5" /> Suscribirme
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  );
}
