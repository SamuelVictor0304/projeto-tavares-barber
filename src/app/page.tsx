import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-[60vh] text-white">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'url(/hero-bg.jpg?v=2025)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center p-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-golden">
            Tradição e Estilo em Cada Corte
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl">
            Uma experiência única que une o clássico e o moderno, para o homem
            que valoriza a excelência.
          </p>
          <Link
            href="/agendamento"
            className="mt-8 inline-block px-8 py-4 bg-white text-black font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 border-2 border-white"
          >
            Agende seu Horário
          </Link>
        </div>
      </section>

      {/* Nossa Marca Section */}
      <section id="about" className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-golden mb-8">Nossa Marca</h2>
          <p className="max-w-3xl mx-auto text-lg">
            A Barbearia Tavares é mais do que um lugar para cortar o cabelo e
            fazer a barba. É um refúgio para o homem moderno, um espaço onde a

            tradição da barbearia clássica encontra as últimas tendências.
            Nossa equipe de mestres barbeiros se dedica a oferecer um serviço
            impecável, com atendimento personalizado e produtos de alta
            qualidade.
          </p>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="services" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-golden text-center mb-12">
            Nossos Serviços
          </h2>
          
          {/* Imagem de Exemplo dos Serviços */}
          <div className="mb-12 text-center">
            <div className="max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/hero-bg.jpg"
                alt="Exemplo dos nossos serviços - Barbeiro em ação"
                width={800}
                height={600}
                className="w-full h-96 object-cover"
                priority
              />
            </div>
            <p className="mt-4 text-lg text-gray-300 italic">
              "O estilo é uma maneira de dizer quem você é sem ter que falar." - Rachel Zoe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Serviço 1 */}
            <div className="bg-black p-6 rounded-lg text-center border border-gray-700 hover:border-golden transition-colors">
              <h3 className="text-2xl font-semibold text-golden mb-4">
                Corte de Cabelo
              </h3>
              <p className="mb-4">
                Do clássico ao contemporâneo, nossos barbeiros dominam todas as
                técnicas para um corte perfeito.
              </p>
              <div className="text-golden font-bold text-xl">R$ 35</div>
            </div>
            {/* Serviço 2 */}
            <div className="bg-black p-6 rounded-lg text-center border border-gray-700 hover:border-golden transition-colors">
              <h3 className="text-2xl font-semibold text-golden mb-4">
                Barba Tradicional
              </h3>
              <p className="mb-4">
                A arte da barboterapia com toalha quente, navalha e os melhores
                produtos para um barbear impecável.
              </p>
              <div className="text-golden font-bold text-xl">R$ 25</div>
            </div>
            {/* Serviço 3 */}
            <div className="bg-black p-6 rounded-lg text-center border border-gray-700 hover:border-golden transition-colors">
              <h3 className="text-2xl font-semibold text-golden mb-4">
                Combo (Cabelo + Barba)
              </h3>
              <p className="mb-4">
                A experiência completa para um visual renovado, combinando
                corte e barba com um preço especial.
              </p>
              <div className="text-golden font-bold text-xl">R$ 50</div>
            </div>
          </div>
        </div>
      </section>

      {/* Unidades Section */}
      <section id="units" className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-golden mb-8">Nossa Unidade</h2>
          <div className="max-w-md mx-auto">
            {/* Unidade Principal */}
            <div className="border border-golden p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-golden mb-4">
                Barbearia Tavares
              </h3>
              <p className="mb-2 text-lg">Rua Principal, 123 - Centro</p>
              <p className="text-lg">(11) 98765-4321</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-golden text-center mb-8">
            Contato
          </h2>
          <form className="max-w-xl mx-auto">
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2">
                Nome
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block mb-2">
                Mensagem
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-8 py-3 bg-golden text-black font-semibold rounded-lg hover:bg-white transition-colors"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>

      {/* Botão discreto para área administrativa */}
      <div className="text-center py-8">
        <div className="flex justify-center gap-4">
          <Link
            href="/admin"
            className="inline-block px-4 py-2 text-xs text-gray-500 hover:text-golden transition-colors border border-gray-700 hover:border-golden rounded opacity-50 hover:opacity-100"
          >
            Admin
          </Link>
          <Link
            href="/admin/blocks"
            className="inline-block px-4 py-2 text-xs text-gray-500 hover:text-golden transition-colors border border-gray-700 hover:border-golden rounded opacity-50 hover:opacity-100"
          >
            Bloqueios
          </Link>
        </div>
      </div>
    </main>
  );
}
