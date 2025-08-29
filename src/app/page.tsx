"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  // Calendário simples: mês/ano/dia
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());

  // Dias bloqueados (dia todo)
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);

  // Buscar bloqueios de dia inteiro ao mudar mês/ano
  useEffect(() => {
    const inicioMes = new Date(year, month, 1).toISOString().slice(0, 10);
    const fimMes = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    fetch(`/api/blocks/GET?inicio=${inicioMes}&fim=${fimMes}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.blocks)) {
          const bloqueados = data.blocks.filter((b: any) => b.startTime === "08:00" && b.endTime === "20:30")
            .map((b: any) => b.date.slice(0, 10));
          setDiasBloqueados(bloqueados);
        } else {
          setDiasBloqueados([]);
        }
      })
      .catch(() => setDiasBloqueados([]));
  }, [month, year]);

  // Gera grid de dias do mês
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  function handleDayClick(day: number | null) {
    if (!day) return;
    const date = new Date(year, month, day);
    setSelectedDate(date.toISOString().slice(0, 10));
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [servico, setServico] = useState("");
  const [servicos, setServicos] = useState<{ id: string, name: string }[]>([]);
  const [qtdPessoas, setQtdPessoas] = useState("1");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  // Buscar serviços da API ao carregar a página
  useEffect(() => {
    // Buscar serviços
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServicos(data);
        else if (Array.isArray(data.services)) setServicos(data.services);
        else setServicos([]);
      })
      .catch(() => setServicos([]));
  }, []);

  // Buscar horários disponíveis sempre que serviço, data ou quantidade de pessoas mudar
  useEffect(() => {
    // Buscar horários disponíveis
    if (!servico || !selectedDate || !qtdPessoas) {
      setHorarios([]);
      setHorarioSelecionado("");
      return;
    }
    fetch(`/api/availability?serviceId=${servico}&date=${selectedDate}&partySize=${qtdPessoas}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.available)) setHorarios(data.available);
        else if (Array.isArray(data)) setHorarios(data);
        else if (Array.isArray(data.slots)) setHorarios(data.slots);
        else setHorarios([]);
        setHorarioSelecionado("");
      })
      .catch(() => setHorarios([]));
  }, [servico, selectedDate, qtdPessoas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (!horarioSelecionado) {
      setMsg("Selecione um horário disponível.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: nome,
          customerPhone: telefone,
          customerEmail: email,
          serviceId: Number(servico),
          date: selectedDate,
          startTime: horarioSelecionado,
          partySize: Number(qtdPessoas),
          notes: obs,
        }),
      });
      if (res.ok) {
        setMsg("Agendamento realizado com sucesso!");
        setNome(""); setTelefone(""); setEmail(""); setServico(""); setQtdPessoas("1"); setObs(""); setHorarioSelecionado("");
      } else {
        const data = await res.json();
        setMsg(data?.error || "Erro ao agendar. Tente novamente.");
      }
    } catch {
      setMsg("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-white to-yellow-300 flex flex-col items-center justify-center py-8 px-2">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Header / Área Privada */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 rounded-xl shadow-lg p-4 mb-4 flex items-center justify-between border border-yellow-300">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-full border border-yellow-500 shadow" />
            <span className="uppercase text-lg font-extrabold tracking-widest text-yellow-900 drop-shadow">Tavares Barber</span>
          </div>
          <div className="flex gap-4 text-yellow-900 font-semibold">
            <a href="/admin" className="hover:underline hover:text-yellow-700 transition">Área do Barbeiro</a>
            <a href="/admin/blocks" className="hover:underline hover:text-yellow-700 transition">Bloqueios</a>
          </div>
        </div>
        {/* Calendário Moderno */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
          <h2 className="text-2xl font-extrabold mb-4 text-yellow-700 tracking-wide drop-shadow flex items-center gap-2"><span>Calendário</span> <span className="text-base font-normal text-gray-400">(Selecione o dia)</span></h2>
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="px-3 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-300 text-yellow-700 font-bold shadow transition"><span className="text-xl">◀</span></button>
            <span className="font-semibold text-yellow-700 text-lg">
              {new Date(year, month).toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="px-3 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-300 text-yellow-700 font-bold shadow transition"><span className="text-xl">▶</span></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-1">
            <span>dom</span><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sab</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dataStr = day ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : "";
              const bloqueado = day && diasBloqueados.includes(dataStr);
              // Calcular o dia da semana (0=domingo)
              const weekDay = day ? new Date(year, month, day).getDay() : null;
              const isDomingo = weekDay === 0;
              const disabled = Boolean(day === null || bloqueado || isDomingo);
              // Visual cinza para domingos e bloqueados
              const isGray = isDomingo || bloqueado;
                    return (
                      <button
                        key={i}
                        disabled={disabled}
                        onClick={() => handleDayClick(day)}
                        className={`h-10 w-10 rounded-lg flex items-center justify-center font-black shadow transition-all text-xl tracking-widest
                          ${day === null ? "" : isGray ? "bg-gray-200 text-gray-500 cursor-not-allowed" : day === Number(selectedDate.slice(8, 10)) && month === Number(selectedDate.slice(5, 7)) - 1 && year === Number(selectedDate.slice(0, 4)) ? "bg-yellow-400 text-white scale-110" : "bg-yellow-50 hover:bg-yellow-300 text-yellow-900 border border-yellow-600"}`}
                      >
                        {day || ""}
                      </button>
                    );
            })}
          </div>
          <div className="mt-6 text-right">
            <span className="font-medium text-gray-700">Data selecionada:</span> <span className="text-yellow-700 font-bold text-lg">{selectedDate}</span>
          </div>
        </div>
        {/* Formulário Moderno */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
          <h2 className="text-2xl font-extrabold mb-4 text-yellow-700 tracking-wide drop-shadow flex items-center gap-2"><span>Agendar horário</span> <span className="text-base font-normal text-gray-400">(Preencha seus dados)</span></h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Horário *</label>
              <select required value={horarioSelecionado} onChange={e => setHorarioSelecionado(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400" disabled={horarios.length === 0}>
                <option value="">Selecione...</option>
                {horarios.length === 0 && <option disabled>Nenhum horário disponível</option>}
                {horarios.length > 0 && horarios.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome completo *</label>
              <input type="text" required value={nome} onChange={e => setNome(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400 px-3 py-2" placeholder="Digite seu nome" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone/WhatsApp *</label>
              <input type="tel" required value={telefone} onChange={e => setTelefone(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400 px-3 py-2" placeholder="Digite seu telefone" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400 px-3 py-2" placeholder="Digite seu e-mail" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço *</label>
              <select required value={servico} onChange={e => setServico(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2">
                <option value="">Selecione...</option>
                {servicos.length === 0 && <option disabled>Nenhum serviço disponível</option>}
                {servicos.length > 0 && servicos.map(s => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantidade de pessoas *</label>
              <select required value={qtdPessoas} onChange={e => setQtdPessoas(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} className="mt-1 block w-full rounded-lg border-yellow-200 shadow focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 placeholder-gray-400 px-3 py-2" placeholder="Observações" />
            </div>
            <div>
              <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-yellow-500 text-white font-extrabold rounded-lg shadow hover:bg-yellow-600 transition flex items-center justify-center gap-2 text-lg">
                {loading ? <span className="animate-pulse">Agendando...</span> : <>Confirmar agendamento</>}
              </button>
            </div>
            {msg && (
              <div className={`mt-2 text-center font-semibold ${msg.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{msg}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
