export default function CampusIllustration() {
  return <figure className="campus-illustration">
    <div className="illustration-heading"><span className="eyebrow">Campus transportation</span><span className="illustration-symbol">CB / TRANSPORT</span></div>
    <svg className="campus-scene" viewBox="0 0 560 340" role="img" aria-labelledby="campus-scene-title">
      <title id="campus-scene-title">A university bus outside a campus building</title>
      <defs><pattern id="scene-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#A8C5E0" strokeWidth=".6" /></pattern></defs>
      <rect width="560" height="340" fill="url(#scene-grid)" />
      <g stroke="#6B8CAE" fill="#E8F1FA" strokeWidth="1.5"><path d="M272 209V92h201v117M257 94l115-59 116 59H257Z" /><path d="M296 208V113h26v95m26 0v-95h26v95m25 0v-95h26v95m25 0v-95h13v95" /><path d="M247 208h254v10H247zM320 64h104" /><path d="M145 209v-77h107v77M147 132l54-30 54 30" /><path d="M163 150h16v28h-16zm37 0h16v28h-16" /></g>
      <g fill="#A8C5E0" stroke="#6B8CAE"><path d="M72 205c-33-8-32-46-15-55-5-36 32-49 48-23 26 5 29 35 12 49 4 24-25 38-45 29Z" /><path d="M95 220v-61m0 27-13-13m13 0 12-13" fill="none" strokeWidth="2" /></g>
      <path d="M25 257h510" stroke="#6B8CAE" strokeWidth="2" />
      <path d="M25 282h72m29 0h72m29 0h72m29 0h72m29 0h72" stroke="#6B8CAE" strokeWidth="2" />
      <ellipse cx="293" cy="254" rx="187" ry="7" fill="#A8C5E0" />
      <g><path d="M126 154h287c15 0 23 9 29 26l16 42v17c0 7-5 11-12 11H119c-7 0-11-5-11-12v-65c0-11 6-19 18-19Z" fill="#E8F1FA" stroke="#3D5A80" strokeWidth="1.5" />
      <path d="M126 154h287c9 0 16 4 20 11H112c2-7 6-11 14-11Z" fill="#1B3A6B" />
      <path d="M110 211h341l7 14H109Z" fill="#1B3A6B" /><path d="M110 229h347v10H110Z" fill="#CDE1F2" />
      {[126, 176, 226, 276, 326].map(x => <rect key={x} x={x} y="174" width="42" height="31" rx="2" fill="#3D5A80" />)}
      <path d="M392 174h25c8 0 11 4 14 11l8 20h-47Z" fill="#3D5A80" />
      <path d="M373 174h13v62h-13Z" fill="#CDE1F2" stroke="#3D5A80" /><path d="M379 178v54" stroke="#3D5A80" />
      <path d="M112 178h-7v20h5m327-17h13v17" fill="none" stroke="#3D5A80" strokeWidth="3" strokeLinejoin="round" />
      <path d="M441 227h14v7h-14Z" fill="#fbbf24" /><path d="M110 225h5v9h-5Z" fill="#b91c1c" />
      {[169,408].map(x => <g key={x}><circle cx={x} cy="245" r="18" fill="#0D1B2A" /><circle cx={x} cy="245" r="10" fill="#6B8CAE" /><circle cx={x} cy="245" r="4" fill="#CDE1F2" /></g>)}
      <text x="236" y="221" fill="white" fontFamily="system-ui,sans-serif" fontSize="7" fontWeight="600" letterSpacing="1.6">CAMPUS TRANSPORT</text></g>
      <g stroke="#3D5A80" strokeWidth="1.5"><path d="M507 254v-93" /><rect x="493" y="149" width="28" height="31" rx="4" fill="white" /><rect x="499" y="155" width="16" height="17" rx="3" fill="#1B3A6B" stroke="none" /><path d="M502 159h10m-10 4h10" stroke="white" /><path d="M502 168h1m8 0h1" stroke="white" strokeWidth="2" /></g>
    </svg>
    <figcaption><span><span className="route-dot" />Students &amp; drivers</span><span className="illustration-line" /><IconArrow /><span className="route-dot route-dot-campus" /><span>University campus</span></figcaption>
  </figure>;
}
function IconArrow() { return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m5 4 4 4-4 4" fill="none" stroke="#3D5A80" strokeWidth="1.5" /></svg>; }
