const MESSAGE = 'ARCANE · COLOMBO NIGHTS · CURATED EVENTS · TICKETS · MUSIC · AFTER DARK · ';

export function MarqueeStrip() {
  return (
    <div className="marquee" aria-label="Arcane — Colombo nights, curated events, tickets, music after dark">
      <div className="marquee__track">
        <span>{MESSAGE.repeat(2)}</span>
        <span aria-hidden="true">{MESSAGE.repeat(2)}</span>
      </div>
    </div>
  );
}
