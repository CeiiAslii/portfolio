export function HeroTerminal() {
  return <aside className="terminal-panel" aria-label="System profile terminal">
    <header className="terminal-panel__header"><div className="terminal-window-controls" aria-hidden="true"><i className="window-control--red" /><i className="window-control--yellow" /><i className="window-control--green" /></div><span>MICII@PORTFOLIO</span><span className="terminal-online"><i /> ONLINE</span></header>
    <div className="terminal-panel__body"><p><b>&gt;</b> whoami</p><code>Michio / CeiiAslii</code><p><b>&gt;</b> focus</p><code>Network • Linux • Development</code><p><b>&gt;</b> status</p><code>Building, learning, shipping.<span className="terminal-cursor" aria-hidden="true">_</span></code></div>
    <footer className="terminal-panel__footer">SYS.READY / PORT: 2026</footer>
  </aside>
}
