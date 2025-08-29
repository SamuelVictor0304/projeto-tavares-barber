"use client";
import React, { useEffect, useState } from "react";

export default function BlocksAdmin() {
  // Proteção de rota: verifica cookie de sessão
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const session = cookies.find(c => c.startsWith('admin_session='));
      if (!session || session.split('=')[1] !== 'ok') {
        window.location.href = '/admin/blocks/login';
      }
    }
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  type Block = {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
    createdAt?: string;
  };
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBlocks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blocks/GET?date=${selectedDate}`);
      if (!res.ok) throw new Error('Erro ao buscar bloqueios');
      const data = await res.json();
      setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
    } catch {
      setBlocks([]);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, startTime, endTime, reason }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Bloqueio criado com sucesso!");
      setStartTime(""); setEndTime(""); setReason("");
      fetchBlocks();
    } else {
      setMsg(data.error || "Erro ao criar bloqueio.");
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    setMsg(null);
    setLoading(true);
    const res = await fetch(`/api/blocks?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setMsg("Bloqueio removido.");
      fetchBlocks();
    } else {
      setMsg(data.error || "Erro ao remover bloqueio.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg p-6 border border-yellow-200">
      <div className="flex justify-end mb-2">
        <button
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold text-sm"
          onClick={() => {
            document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/admin/blocks/login';
          }}
        >
          Sair
        </button>
      </div>
      <h2 className="text-2xl font-extrabold mb-6 text-center text-yellow-700 tracking-wide drop-shadow">Gerenciar Bloqueios</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold text-gray-700">Selecionar data:
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="ml-2 px-2 py-1 rounded border border-yellow-300 focus:ring-yellow-400 focus:border-yellow-400" />
        </label>
      </div>
      <form className="space-y-4 mb-6" onSubmit={handleBlock}>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Início *</label>
            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full rounded border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 font-extrabold text-xl text-gray-900 bg-yellow-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fim *</label>
            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full rounded border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 font-extrabold text-xl text-gray-900 bg-yellow-50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Motivo</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400" placeholder="Motivo do bloqueio" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600">
            {loading ? "Bloqueando..." : "Criar bloqueio"}
          </button>
          <button type="button" disabled={loading} className="w-full py-2 px-4 bg-red-500 text-white font-bold rounded hover:bg-red-600" onClick={async () => {
            setMsg(null);
            setLoading(true);
            const res = await fetch("/api/blocks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ date: selectedDate, startTime: "08:00", endTime: "20:30", reason: "Bloqueio do dia todo" }),
            });
            const data = await res.json();
            if (data.success) {
              setMsg("Dia inteiro bloqueado!");
              setStartTime(""); setEndTime(""); setReason("");
              fetchBlocks();
            } else {
              setMsg(data.error || "Erro ao bloquear o dia.");
            }
            setLoading(false);
          }}>
            Bloquear o dia todo (SIM)
          </button>
        </div>
      </form>
      {msg && <div className={`mb-4 text-center font-semibold ${msg.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{msg}</div>}
      <div>
        <h3 className="text-lg font-bold mb-2 text-yellow-700">Bloqueios do dia</h3>
        {loading ? <div className="text-gray-400">Carregando...</div> : (
          <ul className="divide-y divide-yellow-100">
            {blocks.length === 0 ? <li className="text-gray-400">Nenhum bloqueio para o dia.</li> : blocks.map(b => (
              <li key={b.id} className="py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-semibold text-gray-700">{b.startTime} - {b.endTime}</span>
                  {b.reason && <span className="ml-2 text-xs text-gray-500">({b.reason})</span>}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-200" onClick={() => handleDelete(b.id)}>Remover</button>
                  <button className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200" onClick={() => {
                    setStartTime(b.startTime);
                    setEndTime(b.endTime);
                    setReason(b.reason || "");
                  }}>Editar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
