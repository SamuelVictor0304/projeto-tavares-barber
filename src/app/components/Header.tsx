import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-base-100 text-base-content shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary">
              Tavares Barber
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link href="/#about" className="text-white hover:text-primary transition-colors">
                Nossa Marca
              </Link>
              <Link href="/#services" className="text-white hover:text-primary transition-colors">
                Serviços
              </Link>
              <Link href="/#units" className="text-white hover:text-primary transition-colors">
                Unidades
              </Link>
              <Link href="/#contact" className="text-white hover:text-primary transition-colors">
                Contato
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
