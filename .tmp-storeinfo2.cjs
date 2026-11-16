const fs = require('fs');
const p = 'src/app.ts';
let s = fs.readFileSync(p, 'utf8');

const marker = "\n// Salva o campo sem re-render (preserva o foco do usu";
const idx = s.indexOf(marker);
if (idx === -1) throw new Error('marker not found');

const fn = `
function renderStoreInfoDrawer(): string {
  if (!storeInfoOpen || perfil !== 'cliente') return '';
  const store = catalog.store || {};
  const sections: Array<{ id: StoreInfoSection; title: string; icon: string; content: string; extra: string }> = [
    {
      id: 'entrega',
      title: 'Entrega e Retirada',
      icon: '🚚',
      content: escapeHtml(store.delivery || 'Entrega e retirada sob consulta.'),
      extra: '<ul class="mt-2 space-y-1 text-xs text-zinc-600 list-disc pl-4">' +
        '<li><strong>Entrega:</strong> via motoboy (mesmo dia, taxa a combinar/consultar).</li>' +
        '<li><strong>Retirada:</strong> disponível <strong>a partir de 24h após a confirmação do pagamento (PIX)</strong>, em <strong>dias úteis</strong> (não conta sábados e domingos), para <strong>teste e embalagem</strong>. Valor/condições sob consulta.</li>' +
      '</ul>'
    },
    {
      id: 'garantia',
      title: 'Garantia',
      icon: '✅',
      content: escapeHtml(store.warranty || 'Consulte condições de garantia.'),
      extra: '<ul class="mt-2 space-y-1 text-xs text-zinc-600 list-disc pl-4">' +
        '<li>Atendimento para <strong>defeitos de fabricação</strong> conforme garantia legal.</li>' +
        '<li><strong>Trocas/devoluções</strong> conforme política da loja — consulte condições e prazos.</li>' +
      '</ul>'
    },
    {
      id: 'pagamento',
      title: 'Pagamento',
      icon: '💳',
      content: escapeHtml(store.payment || 'Pagamento do pedido via PIX.'),
      extra: '<ul class="mt-2 space-y-1 text-xs text-zinc-600 list-disc pl-4">' +
        '<li><strong>Pedido na plataforma:</strong> somente <strong>PIX</strong> (enviar comprovante para confirmação).</li>' +
        '<li><strong>Dinheiro e cartão (crédito/débito):</strong> aceitos <strong>somente presencialmente (in loco)</strong> (entrega/retirada), mediante acordo prévio — não como pagamento do pedido na plataforma.</li>' +
      '</ul>'
    },
  ];

  const tabs = sections.map(sec => 
    '<button type="button" data-store-info-tab="' + sec.id + '" class="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition ' + (storeInfoSection === sec.id ? 'bg-[#0a8754] text-white border-[#0a8754]' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50') + '">' +
      '<span aria-hidden="true">' + sec.icon + '</span> ' + sec.title.split(' ')[0] +
    '</button>'
  ).join('');

  const blocks = sections.map(sec => 
    '<section id="store-info-' + sec.id + '" data-store-info-section="' + sec.id + '" class="scroll-mt-4 rounded-xl border p-4 ' + (storeInfoSection === sec.id ? 'border-[#0a8754] bg-emerald-50/40 ring-1 ring-emerald-200' : 'border-zinc-200 bg-white') + '">' +
      '<h3 class="text-sm font-black text-zinc-900 flex items-center gap-2"><span aria-hidden="true">' + sec.icon + '</span> ' + sec.title + '</h3>' +
      '<p class="mt-2 text-sm text-zinc-700 leading-relaxed">' + sec.content + '</p>' +
      sec.extra +
    '</section>'
  ).join('');

  return \`
    <div id="store-info-overlay" class="fixed inset-0 bg-black/50 z-40 print:hidden"></div>
    <aside id="store-info-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white z-50 shadow-2xl flex flex-col print:hidden" role="dialog" aria-modal="true" aria-label="Informações da loja">
      <div class="flex items-center justify-between px-4 py-3 bg-[#0a8754] text-white shrink-0">
        <h2 class="font-bold text-sm flex items-center gap-2">ℹ️ Informações</h2>
        <button type="button" data-close-store-info class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition font-bold" aria-label="Fechar informações">✕</button>
      </div>
      <div class="p-3 border-b border-zinc-200 bg-zinc-50 shrink-0">
        <div class="grid grid-cols-3 gap-2">\${tabs}</div>
        <p class="mt-2 text-[11px] text-zinc-500">Toque em uma opção para ver os detalhes das condições do pedido na plataforma.</p>
      </div>
      <div id="store-info-body" class="flex-1 overflow-y-auto p-4 space-y-3">
        \${blocks}
      </div>
    </aside>
  \`;
}
`;

s = s.slice(0, idx) + '\n' + fn + '\n' + s.slice(idx);
fs.writeFileSync(p, s);
console.log('drawer fn added');