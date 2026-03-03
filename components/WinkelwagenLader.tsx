"use client"

/** Flat-UI winkelwagentje dat van links naar rechts rijdt als laadanimatie. */
export default function WinkelwagenLader({
  tekst = "Supermarktprijzen ophalen…",
}: {
  tekst?: string
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-10 px-4">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{tekst}</p>
        <p className="text-sm text-muted-foreground">Even geduld — we vergelijken 7 supermarkten</p>
      </div>

      {/* Track + winkelwagentje */}
      <div className="relative w-72">
        {/* Spoorrail */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary track-vult" />
        </div>

        {/* Wagentje loopt boven het spoor */}
        <div className="absolute wagen-container" style={{ top: "-36px" }}>
          <div className="wagen-stuitert text-primary">
            <WinkelwagenSVG />
          </div>
        </div>
      </div>

      {/* Laadtips */}
      <div className="flex gap-3 flex-wrap justify-center">
        {["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Spar"].map((sm, i) => (
          <span
            key={sm}
            className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border bg-card"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {sm}
          </span>
        ))}
      </div>
    </div>
  )
}

function WinkelwagenSVG() {
  return (
    <svg
      width="56"
      height="44"
      viewBox="0 0 56 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Stang */}
      <path
        d="M4 7 L4 16 L16 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Karrenlichaam */}
      <path
        d="M16 12 L46 12 L41 30 L21 30 Z"
        fill="currentColor"
      />
      {/* Producten in de kar */}
      <rect x="22" y="15" width="8" height="10" rx="2" fill="white" fillOpacity="0.45" />
      <rect x="32" y="17" width="7" height="8" rx="2" fill="white" fillOpacity="0.45" />
      {/* Wielen */}
      <circle cx="25" cy="37" r="5" fill="currentColor" />
      <circle cx="39" cy="37" r="5" fill="currentColor" />
      {/* Wiel-highlight */}
      <circle cx="25" cy="37" r="2.5" fill="white" fillOpacity="0.35" />
      <circle cx="39" cy="37" r="2.5" fill="white" fillOpacity="0.35" />
    </svg>
  )
}
