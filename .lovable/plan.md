# Plano: Site de Casamento Aesthetic (Mobile-First)

## Visão geral
Front-end completo com dados mockados, sem backend. Foco em UI/UX, mobile-first, paleta pastel (amarelo bebê + azul bebê), tipografia elegante (sans serif geométrica + script para destaques).

## Design System (`src/styles.css`)
- Tokens em `oklch`:
  - `--primary` azul bebê pastel, `--accent` amarelo bebê pastel
  - `--background` off-white, `--foreground` cinza escuro suave
  - `--muted` cinza bem claro, `--success` verde pastel (estado completo)
- Gradientes suaves (`--gradient-pastel`), sombras suaves (`--shadow-soft`, `--shadow-card`)
- Raio: `--radius: 1rem` (cards arredondados)
- Fontes via Google Fonts no `__root.tsx`:
  - Display script: **Cormorant Garamond Italic** ou **Dancing Script** (nomes dos noivos)
  - Sans: **Inter** ou **Plus Jakarta Sans** (corpo)
- Animações suaves de transição (`transition-all`, fade-in)

## Rotas (TanStack Router — `src/routes/`)
- `index.tsx` — Home (Hero, Countdown, Nossa História, O Casamento/Onde Vai Ser, Save the Date)
- `cha-de-panela.tsx` — Lista de presentes
- `admin.login.tsx` — Tela visual de login admin
- `admin.painel.tsx` — Painel administrativo (visual)
- Cada rota com `head()` próprio (title, description, og)

## Estado global
- `src/contexts/ViewModeContext.tsx` — Provider com `mode: "guest" | "admin"` + toggle, persistido em `localStorage`. Envolto no `RootComponent`.

## Componentes principais (`src/components/`)
- `layout/Navbar.tsx` — fixa no topo, links (Nossa História, O Casamento, Save the Date), botão destacado "Chá de Panela", menu hambúrguer mobile (Sheet do shadcn), toggle Convidado/Admin, botão "Painel Administrativo" condicional
- `layout/Footer.tsx` — toggle de visão também aqui
- `home/Hero.tsx` — imagem placeholder de fundo, overlay, nomes em script, data, frase Save the Date
- `home/Countdown.tsx` — 4 cards (Dias/Horas/Min/Seg) com `useEffect` + `setInterval`, animação flip suave
- `home/NossaHistoria.tsx` — texto curto + grid de fotos (carousel shadcn no mobile, grid no desktop)
- `home/OndeVaiSer.tsx` — info local/horário + placeholder do mapa (iframe Google Maps embed estático ou div estilizada)
- `gifts/GiftCard.tsx` — imagem, título, valor, ProgressBar, dois estados:
  - Disponível: barra + texto "Arrecadado X de Y" + botão "Presentear"
  - Completo: overlay verde com blur + ícone Check grande + botão desabilitado "Presente Garantido!"
  - Modo admin: ícones Editar/Excluir no canto
- `gifts/GiftGrid.tsx` — grid responsivo (1–2 col mobile, 3–4 col desktop)
- `gifts/PaymentSheet.tsx` — Sheet (mobile) / Dialog (desktop) com:
  - Input de valor (com sugestão "valor restante")
  - Tabs: PIX (chave mockada + placeholder QR), Boleto (mock de código), Cartão (campos número/nome/validade/CVV + Select de parcelamento 1x–12x)
  - Botão "Confirmar pagamento" (mock, fecha com toast)
- `gifts/AddGiftFAB.tsx` — botão flutuante visível só em admin
- `admin/LoginForm.tsx` — card centralizado, email/senha, botão entrar (mock → redireciona para painel)
- `admin/AdminDashboard.tsx` — visão simples com estatísticas mockadas e atalho para gerenciar presentes

## Dados mockados (`src/data/mockGifts.ts`)
~8 presentes cobrindo ambos estados (alguns 100%, alguns parciais, alguns 0%), com imagens via Unsplash URLs.

## Imagens
Gerar via `imagegen` (fast):
- Hero noivos (placeholder romântico)
- 4–6 fotos para galeria "Nossa História"
- Imagens de presentes podem usar URLs Unsplash mockadas para reduzir tempo

## Acessibilidade & responsividade
- Mobile-first: estilos base mobile, breakpoints `sm/md/lg` para upgrades
- Contraste AA garantido (foreground escuro sobre pastel claro)
- Áreas de toque ≥44px
- Sheet bottom no mobile, Dialog centralizado no desktop

## Detalhes técnicos
- Usa shadcn/ui existentes: Button, Card, Dialog, Sheet, Tabs, Input, Select, Progress, Switch
- `lucide-react` para ícones (Menu, Heart, Check, Edit, Trash, Plus, MapPin, Calendar)
- Sem backend; toggle Admin é puramente visual (não há autenticação real)
- TanStack Link para navegação tipada

## Entregáveis
1. Tokens + fontes em `styles.css` e `__root.tsx`
2. Context de view mode
3. Layout (Navbar + Footer) aplicado via componente em cada rota
4. Páginas: Home, Chá de Panela, Admin Login, Admin Painel
5. Componentes de presentes + modal de pagamento totalmente funcional na UI
6. Dados mockados cobrindo todos os estados pedidos