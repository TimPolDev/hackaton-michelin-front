import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Gomme Michelin', href: '/gamme-michelin' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
  { label: 'Mentions légales', href: '/mentions-legales' },
];

export const Footer = () => {
  return (
    <footer className="bg-michelin-blue px-4 py-6 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Marque */}
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-lg font-bold italic text-white sm:text-xl">
            PaceLine
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-michelin-yellow sm:text-[11px] sm:tracking-[0.25em]">
            Powered by Michelin · Vélo Performance
          </span>
        </div>

        {/* Navigation */}
        <nav className="w-full sm:w-auto">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-center text-sm text-white/50 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-8 sm:text-left lg:gap-x-10">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};
