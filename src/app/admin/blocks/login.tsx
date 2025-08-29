"use client";
import { useState } from "react";
export default function BlocksLogin() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setMsg("Login realizado!");
        window.location.href = "/admin/blocks";
      } else {
        const data = await res.json();
        setMsg(data?.error || "Senha incorreta.");
      }
    } catch {
      setMsg("Erro de conexão.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4 text-center">Área de Bloqueios</h2>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400" placeholder="Digite a senha" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-yellow-400 text-white font-bold rounded hover:bg-yellow-500">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
        {msg && <div className="mt-2 text-center font-semibold text-red-600">{msg}</div>}
      </form>
    </div>
  );
}
