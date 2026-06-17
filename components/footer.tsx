export const Footer = () => {
  return (
    <footer className="flex items-center justify-between bg-michelin-blue px-16 py-5">
      {/* Left */}
      <div className="flex flex-col">
        <span className="text-xl font-bold italic text-white">
          PaceLine
        </span>

        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-michelin-yellow">
          Powered by Michelin · Vélo Performance
        </span>
      </div>

      {/* Right */}
      <nav>
        <ul className="flex items-center gap-10 text-sm text-white/50">
          <li>
            <a
              href="/gamme-michelin"
              className="transition-colors hover:text-white"
            >
              Gamme Michelin
            </a>
          </li>

          <li>
            <a
              href="/a-propos"
              className="transition-colors hover:text-white"
            >
              À propos
            </a>
          </li>

          <li>
            <a
              href="/contact"
              className="transition-colors hover:text-white"
            >
              Contact
            </a>
          </li>

          <li>
            <a
              href="/mentions-legales"
              className="transition-colors hover:text-white"
            >
              Mentions légales
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
};