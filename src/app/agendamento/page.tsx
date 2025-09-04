"use client";
import { useState, useEffect } from "react";

export default function AgendamentoPage() {
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);
  const [diasComBloqueio, setDiasComBloqueio] = useState<string[]>([]);

  useEffect(() => {
    const inicioMes = new Date(year, month, 1).toISOString().slice(0, 10);
    const fimMes = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    fetch(`/api/blocks/GET?inicio=${inicioMes}&fim=${fimMes}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.blocks)) {
          // Dias com bloqueio de dia inteiro (08:00 às 20:30)
          const bloqueadosInteiros = data.blocks.filter((b: { startTime: string; endTime: string }) => 
            b.startTime === "08:00" && b.endTime === "20:30"
          ).map((b: { date: string }) => b.date.slice(0, 10));
          
          // Dias com qualquer tipo de bloqueio
          const diasComBloqueio = [...new Set(data.blocks.map((b: { date: string }) => b.date.slice(0, 10)))] as string[];
          
          setDiasBloqueados(bloqueadosInteiros);
          setDiasComBloqueio(diasComBloqueio);
        } else {
          setDiasBloqueados([]);
          setDiasComBloqueio([]);
        }
      })
      .catch(() => {
        setDiasBloqueados([]);
        setDiasComBloqueio([]);
      });
  }, [month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  function handleDayClick(day: number | null) {
    if (!day) return;
    const date = new Date(year, month, day);
    setSelectedDate(date.toISOString().slice(0, 10));
    setBloqueioMsg(null); // Limpa mensagem ao trocar de data
  }

  function prevMonth() {
    setMonth(month => month === 0 ? 11 : month - 1);
    setYear(year => month === 0 ? year - 1 : year);
  }
  function nextMonth() {
    setMonth(month => month === 11 ? 0 : month + 1);
    setYear(year => month === 11 ? year + 1 : year);
  }

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [servico, setServico] = useState("");
  type Service = { id: string; name: string };
  const [servicos, setServicos] = useState<Service[]>([]);
  const [qtdPessoas, setQtdPessoas] = useState("1");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [bloqueioMsg, setBloqueioMsg] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServicos(data);
        else if (Array.isArray(data.services)) setServicos(data.services);
        else setServicos([]);
      })
      .catch(() => setServicos([]));
  }, []);

  useEffect(() => {
    if (!servico || !selectedDate || !qtdPessoas) {
      setHorarios([]);
      setHorarioSelecionado("");
      setBloqueioMsg(null);
      return;
    }
    
    setBloqueioMsg(null);
    
    fetch(`/api/availability?serviceId=${servico}&date=${selectedDate}&partySize=${qtdPessoas}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.available)) {
          setHorarios(data.available);
          
          // Se não há horários disponíveis, verificar se é por causa de bloqueios
          if (data.available.length === 0) {
            // Verificar se o dia tem bloqueios parciais
            fetch(`/api/blocks/check?date=${selectedDate}`)
              .then(res => res.json())
              .then(blockData => {
                if (blockData.hasBlocks && !blockData.hasFullDayBlock) {
                  setBloqueioMsg("Este dia possui horários bloqueados. Por favor, escolha outra data.");
                }
              })
              .catch(() => {});
          }
        } else if (Array.isArray(data)) {
          setHorarios(data);
        } else if (Array.isArray(data.slots)) {
          setHorarios(data.slots);
        } else {
          setHorarios([]);
        }
        setHorarioSelecionado("");
      })
      .catch(() => {
        setHorarios([]);
        setHorarioSelecionado("");
      });
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold text-golden text-center">Agende seu Horário</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna da Esquerda: Calendário e Horários */}
        <div className="space-y-6">
          {/* Calendário */}
          <div className="bg-black rounded-lg shadow-lg p-6 border border-golden">
            <h3 className="text-xl font-bold text-golden mb-4">1. Escolha a Data</h3>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="bg-white text-black px-3 py-2 rounded hover:bg-golden transition-colors border border-golden">
                &lt;
              </button>
              <span className="font-semibold text-golden text-lg">
                {new Date(year, month).toLocaleString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <button onClick={nextMonth} className="bg-white text-black px-3 py-2 rounded hover:bg-golden transition-colors border border-golden">
                &gt;
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const dataStr = day ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : "";
                const bloqueadoInteiro = day && diasBloqueados.includes(dataStr);
                const temBloqueio = day && diasComBloqueio.includes(dataStr);
                const weekDay = day ? new Date(year, month, day).getDay() : null;
                const isDomingo = weekDay === 0;
                
                // Dia é desabilitado se for domingo ou estiver totalmente bloqueado (dia inteiro)
                // Dias com bloqueios parciais continuam selecionáveis, mas terão horários limitados
                const disabled = Boolean(day === null || bloqueadoInteiro || isDomingo);
                const isSelected = day === Number(selectedDate.slice(8, 10)) && month === Number(selectedDate.slice(5, 7)) - 1 && year === Number(selectedDate.slice(0, 4));
                
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 text-center text-sm font-medium rounded transition-colors ${
                      day === null ? "cursor-default" : 
                      disabled ? "bg-gray-800 text-gray-500 cursor-not-allowed" : 
                      isSelected ? "bg-golden text-black" : 
                      temBloqueio ? "bg-yellow-900 hover:bg-yellow-800 text-yellow-200 border border-yellow-600" : 
                      "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
                  >
                    {day || ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horários */}
          <div className="bg-black rounded-lg shadow-lg p-6 border border-golden">
            <h3 className="text-xl font-bold text-golden mb-4">2. Escolha o Horário</h3>
            
            {/* Mensagem de bloqueio */}
            {bloqueioMsg && (
              <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded text-yellow-200 text-sm">
                <strong>⚠️ Atenção:</strong> {bloqueioMsg}
              </div>
            )}
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {horarios.length > 0 ? horarios.map(h => (
                <button 
                  key={h} 
                  onClick={() => setHorarioSelecionado(h)}
                  className={`p-2 rounded transition-colors ${horarioSelecionado === h ? 'bg-golden text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                >
                  {h}
                </button>
              )) : <p className="col-span-full text-center text-gray-400">Selecione um serviço e data para ver os horários.</p>}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Formulário */}
        <div className="bg-black rounded-lg shadow-lg p-6 border border-golden">
          <h3 className="text-xl font-bold text-golden mb-4">3. Seus Dados</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-golden mb-1">Serviço *</label>
              <select required value={servico} onChange={e => setServico(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                <option value="">Selecione...</option>
                {servicos.map(s => (<option key={s.id} value={String(s.id)}>{s.name}</option>))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-semibold text-golden mb-1">Nome completo *</label>
              <input type="text" required value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded" placeholder="Seu nome"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-golden mb-1">Telefone/WhatsApp *</label>
              <input type="tel" required value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded" placeholder="(XX) XXXXX-XXXX"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-golden mb-1">E-mail *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded" placeholder="seu@email.com"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-golden mb-1">Quantidade de pessoas *</label>
              <select required value={qtdPessoas} onChange={e => setQtdPessoas(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-golden mb-1">Observações</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded" rows={3}/>
            </div>
            <div>
              <button type="submit" className="w-full bg-white text-black font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-golden transition-colors">
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </div>
            {msg && (
              <div className={`mt-2 text-center font-semibold ${msg.includes("sucesso") ? "text-green-400" : "text-red-400"}`}>{msg}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
