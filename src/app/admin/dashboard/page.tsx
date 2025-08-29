"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  // Proteção de rota: verifica cookie de sessão
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const session = cookies.find(c => c.startsWith('admin_session='));
      if (!session || session.split('=')[1] !== 'ok') {
        window.location.href = '/admin';
      }
    }
  }, []);
  type DashboardData = {
    porServico?: Record<string, { quantidade: number; total: number }>;
    totalAppointments?: number;
    faturamento?: number;
    appointments?: Array<{
      id: number;
      nome: string;
      email: string;
      telefone: string;
      servico: string;
      data: string;
      horario: string;
      pessoas: number;
      observacoes?: string;
      status: string;
    }>;
  };
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?date=${selectedDate}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setMsg("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
  <div className="max-w-2xl mx-auto mt-4 bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg p-4 md:p-8 border border-yellow-200">
      <div className="flex justify-end mb-2">
        <button
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold text-sm"
          onClick={() => {
            document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/admin';
          }}
        >
          Sair
        </button>
      </div>
      <h2 className="text-2xl font-extrabold mb-6 text-center text-yellow-700 tracking-wide drop-shadow">Dashboard Administrativo</h2>
      {/* Filtro de data */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 relative">
        <label className="font-semibold text-gray-700">Selecionar data:
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="ml-2 px-2 py-1 rounded border border-yellow-300 focus:ring-yellow-400 focus:border-yellow-400" />
        </label>
        {/* Gráfico de agendamentos por serviço */}
        {data?.porServico && Object.keys(data.porServico).length > 0 && (
          <div className="w-full md:w-1/2">
            <span className="block text-sm text-gray-500 mb-2">Gráfico: Agendamentos por serviço</span>
            <div className="flex items-end gap-2 h-24">
              {Object.entries(data.porServico).map(([nome, info]) => (
                <div key={nome} className="flex flex-col items-center justify-end h-full">
                  <div style={{height: `${info.quantidade * 20}px`}} className="w-8 bg-yellow-400 rounded-t shadow flex items-end justify-center">
                    <span className="text-xs text-white font-bold pb-1">{info.quantidade}</span>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 text-center break-words w-12">{nome}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Mensagem lateral */}
        {msg && (
          <div className="absolute right-0 top-0 md:top-auto md:right-0 md:bottom-0 bg-white border border-yellow-300 rounded px-3 py-2 shadow text-xs text-red-600 font-semibold z-10">
            {msg}
          </div>
        )}
      </div>
  {loading ? (
        <div className="text-center text-gray-400 text-lg">Carregando...</div>
      ) : (
        <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex flex-col items-center border border-yellow-100">
              <span className="text-sm text-gray-500 mb-2">Agendamentos hoje</span>
              <span className="text-3xl font-bold text-yellow-600">{data?.totalAppointments ?? 0}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 flex flex-col items-center border border-yellow-100">
              <span className="text-sm text-gray-500 mb-2">Faturamento previsto</span>
              <span className="text-3xl font-bold text-yellow-600">R$ {(data?.faturamento ?? 0) / 100}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-yellow-100">
              <span className="text-sm text-gray-500 mb-2 block text-center">Serviços mais agendados</span>
              <ul className="mt-2 space-y-2">
                {data?.porServico && Object.keys(data.porServico).length > 0 ? (
                  Object.entries(data.porServico).map(([nome, info]: any) => (
                    <li key={nome} className="flex justify-between text-yellow-700 font-semibold">
                      <span>{nome}</span>
                      <span className="bg-yellow-100 rounded px-2 py-0.5 text-xs font-bold ml-2">{info.quantidade}</span>
                    </li>
                  ))
                ) : <li className="text-gray-400">Nenhum serviço</li>}
              </ul>
            </div>
          </div>
          {/* Lista de agendamentos do dia */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-yellow-100 mt-8">
            <span className="text-lg font-bold text-yellow-700 block mb-4">Agendamentos do dia</span>
            {data?.appointments?.length ? (
              <ul className="divide-y divide-yellow-100">
                {data.appointments.map((a) => (
                    <li key={a.id} className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <span className="font-semibold text-gray-700">{a.nome}</span>
                        <span className="ml-2 text-xs text-gray-500">({a.email} / {a.telefone})</span>
                      </div>
                      <div className="text-sm text-gray-600">{a.servico} | {a.horario} | {a.pessoas} pessoa(s)</div>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${a.status === 'booked' ? 'bg-green-100 text-green-700' : a.status === 'done' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status === 'booked' ? 'Ativo' : a.status === 'done' ? 'Concluído' : 'Cancelado'}
                      </span>
                    </div>
                    {a.observacoes && <div className="text-xs text-gray-500 mt-1">Obs: {a.observacoes}</div>}
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-200" onClick={async () => {
                        setMsg(null);
                        setLoading(true);
                        const res = await fetch(`/api/appointments/DELETE?id=${a.id}`, { method: 'DELETE' });
                        const r = await res.json();
                        if (r.success) setMsg('Agendamento cancelado.');
                        else setMsg(r.error || 'Erro ao cancelar.');
                        setLoading(false);
                        setSelectedDate(selectedDate); // força reload
                      }}>Cancelar</button>
                      <button className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" onClick={async () => {
                        setMsg(null);
                        setLoading(true);
                        const res = await fetch(`/api/appointments/PUT?id=${a.id}`, { method: 'PUT', body: JSON.stringify({ status: 'done' }), headers: { 'Content-Type': 'application/json' } });
                        const r = await res.json();
                        if (r.success) setMsg('Agendamento concluído.');
                        else setMsg(r.error || 'Erro ao concluir.');
                        setLoading(false);
                        setSelectedDate(selectedDate);
                      }}>Concluir</button>
                      <button className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200" onClick={async () => {
                        const novoNome = prompt('Editar nome do cliente:', a.nome);
                        if (!novoNome) return;
                        setMsg(null);
                        setLoading(true);
                        const res = await fetch(`/api/appointments/PUT?id=${a.id}`, { method: 'PUT', body: JSON.stringify({ customerName: novoNome }), headers: { 'Content-Type': 'application/json' } });
                        const r = await res.json();
                        if (r.success) setMsg('Nome atualizado.');
                        else setMsg(r.error || 'Erro ao editar.');
                        setLoading(false);
                        setSelectedDate(selectedDate);
                      }}>Editar</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">Nenhum agendamento para hoje.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
