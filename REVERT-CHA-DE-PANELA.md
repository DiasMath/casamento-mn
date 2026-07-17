# Reverter: Mudanças desta sessão

Quando precisar reverter apenas as mudanças desta sessão, siga estes passos.

---

## NOVAS ALTERAÇÕES DESTA SESSÃO

### Resumo das Mudanças

1. **ChaHero.tsx** - Corrigido loop infinito, swipe touch, `<picture>` element
2. **GiftCard.tsx** - State sync, React.memo, chaMode, premium glow (borda dourada), buyLink, noValue
3. **GiftCardPublic.tsx** - ChaMode, premium glow, buyLink, noValue
4. **cha-de-panela.tsx** - Container, paleta de cores, filters, scroll refs
5. **CropModal.tsx** - Preview tempo real, dicas, aspect ratio selector, "Sem recorte"
6. **PaymentSheet.tsx** - Cartão desabilitado ("Em breve!"), "Falta" oculto para noValue, "Prefiro comprar na loja", **fix: removido gift.raised do useEffect deps** (causava bug ThankYouSheet)
7. **firestoreService.ts** - chaMode, reservedBy, reservedAt, buyLink, noValue; reserveGift/cancelReservation
8. **ReserveGiftSheet.tsx** - Dialog centralizado, modo genérico (sem texto chá)
9. **ImageUploader.tsx** - Botão "Editar" para recortar existente
10. **AddGiftFAB.tsx** - Checkbox "modo reserva", buyLink, noValue, suporte a duplicar
11. **EditGiftDialog.tsx** - Checkbox "modo reserva", buyLink, noValue, usa useCategories()
12. **constants.ts** - Prioridade premium (💎), ícone baixa (🔹)
13. **GiftCard.tsx** / **GiftCardPublic.tsx** - object-contain para imagens
14. **ThankYouSheet.tsx** - Ícone coração, auto-close 30s
15. **useCategories.ts** - Cache sessionStorage, clearCategoriesCache()
16. **CategoryStats.tsx** - Usa useCategories(), useMemo deps fix, noValue excluído dos stats, scroll max-h-[400px], tabelas centralizadas
17. **admin.painel.tsx** - Usa useCategories(), noValue excluído de meta/restante/progresso, logout, "Dias para o Casamento" com subtext, tabelas centralizadas
18. **ReservedGiftsSection.tsx** - Confirmar entrega / cancelar, coluna data, scroll max-h-[500px], tabelas centralizadas
19. **PriorityStats.tsx** - noValue excluído dos stats
20. **GiftFilters.tsx** - Sem checkbox "Concluídos", grid 3 colunas com ícones, bg-card
21. **GeneralSettingsDialog.tsx** - Toggle "Chá de Panela ativo/inativo", datas, venues, maps URLs
22. **Hero.tsx** - isReady gate, `<picture>`, auto-advance com images.length
23. **OndeVaiSer.tsx** - Botão "Abrir no Google Maps" (sem iframe)
24. **main.tsx** - Lazy routes, ErrorBoundary, HomeRoute/ChaRoute
25. **RSVP** - Declínio persistido no Firestore, badge "Recusou" no admin
26. **firestore.rules** - Regras completas de segurança
27. **scripts/test-payment.mjs** - Script de teste local, npm script test:payment

---

## 1. Reverter Chá de Panela (rota e componentes)

### Deletar arquivos criados

```
src/routes/cha-de-panela.tsx
src/components/layout/ChaLayout.tsx
src/components/cha/ChaHero.tsx
src/components/cha/ChaDetails.tsx
src/components/cha/ChaCountdown.tsx
```

### Restaurar rota `/` no main.tsx

```tsx
// DE:
<Route path="/" element={<Navigate to="/cha-de-panela" replace />} />
// PARA:
<Route path="/" element={<Index />} />

// Remover importação do Navigate:
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
// PARA:
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Remover rota:
<Route path="/cha-de-panela" element={<ChaDePanela />} />

// Remover importação:
import { ChaDePanela } from "./routes/cha-de-panela";
```

### Restaurar rota `/` no router.tsx (se aplicável)

```tsx
// Remover lazy import:
const ChaDePanela = lazy(() =>
  import("./routes/cha-de-panela").then((m) => ({ default: m.ChaDePanela })),
);

// Remover rota:
{ path: "/cha-de-panela", element: <ChaDePanela /> },
```

---

## 2. Reverter devLog (console.log em produção)

### Deletar arquivo

```
src/lib/devLog.ts
```

### Reverter imports em 18 arquivos

Remover `import { devLog } from "@/lib/devLog";` e voltar `devLog.error(...)` para `console.error(...)` nestes arquivos:

- `src/routes/admin.painel.tsx`
- `src/routes/admin.login.tsx`
- `src/routes/present-list.tsx`
- `src/routes/cha-de-panela.tsx` (será deletado de qualquer forma)
- `src/contexts/AuthContext.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/admin/SiteImagesSection.tsx`
- `src/components/gifts/PaymentSheet.tsx`
- `src/components/gifts/ImageUploader.tsx`
- `src/components/gifts/GiftCard.tsx`
- `src/components/gifts/EditGiftDialog.tsx`
- `src/components/gifts/DeleteGiftDialog.tsx`
- `src/components/gifts/CropModal.tsx`
- `src/components/home/GiftListSection.tsx`
- `src/components/home/Recados.tsx`
- `src/components/home/RSVP.tsx`
- `src/lib/firebase.ts`
- `src/lib/firestoreService.ts`

---

## 3. Reverter taxa PIX no admin

### Em `src/lib/firestoreService.ts`

```tsx
// DE (Contribution interface):
paymentMethod?: string;

// PARA: remover essa linha

// DE (registerContribution):
paymentMethod?: string,
// PARA: remover esse parâmetro

// DE:
paymentMethod: paymentMethod || "pix",
// PARA: remover essa linha
```

### Em `src/routes/admin.painel.tsx`

```tsx
// DE:
const totalNet = contributions.reduce((s, c) => {
  const fee = c.method === "pix" ? 0.01 : 0;
  return s + c.value * (1 - fee);
}, 0);
const remainingNet = Math.max(0, totalGoal - Math.round(totalNet));
// PARA: remover essas 4 linhas

// DE:
const overallPct =
  totalGoal > 0
    ? Math.min(100, Math.round((totalRaised / totalGoal) * 100))
    : 0;
// PARA (já era assim antes):
const overallPct =
  totalGoal > 0
    ? Math.min(100, Math.round((totalRaised / totalGoal) * 100))
    : 0;

// DE:
{
  label: "Total Arrecadado",
  value: brl(totalRaised),
  icon: TrendingUp,
  showPct: true,
  subtext: `Líquido: ${brl(Math.round(totalNet))}`,
},
{
  label: "Valor Restante",
  value: brl(remainingValue),
  icon: Wallet,
  subtext: `Líquido: ${brl(remainingNet)}`,
},
// PARA:
{
  label: "Total Arrecadado",
  value: brl(totalRaised),
  icon: TrendingUp,
  showPct: true,
},
{ label: "Valor Restante", value: brl(remainingValue), icon: Wallet },
```

---

## 4. Reverter constants

### Em `src/lib/constants.ts`

```tsx
// Remover estas linhas:
export const CHA_DATE = new Date("2026-09-30T14:00:00");

export const CHA_VENUE = {
  address: "Rua Parintins, 516",
  city: "RJ",
} as const;
```

---

## 5. Deletar este arquivo

```
REVERT-CHA-DE-PANELA.md
```

---

## 6. Reverter mudanças desta sessão (Bugs + Features)

### 6.1 ChaHero.tsx - Loop infinito e swipe touch

```tsx
// EM src/components/cha/ChaHero.tsx:

// DE (linha ~23-40):
const [touchStart, setTouchStart] = useState<number | null>(null);

// ...

const prev = useCallback(() => {
  setCurrent((prev) => (prev - 1 + images.length) % images.length);
}, [images.length]);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.touches[0].clientX);
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStart === null) return;
  const delta = e.changedTouches[0].clientX - touchStart;
  if (Math.abs(delta) > 50) {
    if (delta > 0) prev();
    else next();
  }
  setTouchStart(null);
};

// ...

onTouchStart = { handleTouchStart };
onTouchEnd = { handleTouchEnd };

// PARA: Remover touchStart, prev, handleTouchStart, handleTouchEnd e os handlers do JSX

// DE (linha ~37):
if (list.some((img, i) => img !== FALLBACKS[i])) setImages(list);
// PARA:
if (list.some((img, i) => img !== images[i])) setImages(list);
```

### 6.2 GiftCard.tsx - State sync e React.memo

```tsx
// EM src/components/gifts/GiftCard.tsx:

// DE (import):
import { useCallback, useEffect, useState } from "react";
// PARA:
import { useCallback, useEffect, useState } from "react";
// (remover memo)

// DE (linha ~34-41):
useEffect(() => {
  setLocalGift(gift);
}, [gift.id, gift.raised, gift.total, gift.title, gift.image, gift.category, gift.priority, gift.marca, gift.hidden]);
// PARA:
useEffect(() => {
  setLocalGift((prev) => {
    if (gift.raised > prev.raised || gift.total !== prev.total) {
      return gift;
    }
    return prev;
  });
}, [gift.raised, gift.total]);

// DE (final do arquivo):
export const GiftCard = memo(GiftCardComponent);
// PARA: adicionar export no início
export function GiftCard({ gift, onUpdate }: GiftCardProps) {
// E remover GiftCardComponent
```

### 6.3 cha-de-panela.tsx - Container com scroll interno

```tsx
// EM src/routes/cha-de-panela.tsx:

// DE (linha ~131-140):
<div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-secondary/20 px-1 -mx-1">
  {filteredGifts.length === 0 ? (...) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
      {filteredGifts.map((g) => (...))}
    </div>
  )}
</div>

// PARA: remover o wrapper div com max-h e background, manter só o grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredGifts.map((g) => (...))}
</div>
```

### 6.4 CropModal.tsx - Preview e dicas de imagem

Este arquivo foi reescrito completamente. Para reverter, restaurar a versão original:

```tsx
// EM src/components/gifts/CropModal.tsx:

// Versão original (antes desta sessão):
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { devLog } from "@/lib/devLog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Check } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

// ... (versão simples sem preview)
```

### 6.5 PaymentSheet.tsx - Valor restante

```tsx
// EM src/components/gifts/PaymentSheet.tsx:

// DE (import):
import type { Gift } from "@/lib/firestoreService";
import { brl } from "@/lib/format";

// PARA: remover brl import

// DE (dentro do form):
{
  gift.raised < gift.total && (
    <div className="text-right">
      <p className="text-xs text-muted-foreground">Falta</p>
      <p className="text-sm font-medium text-primary">
        {brl(gift.total - gift.raised)}
      </p>
    </div>
  );
}
// PARA: remover este bloco
```

---

## 7. Reverter modo reserva (chaMode)

### Em `src/lib/firestoreService.ts`

```tsx
// Remover do tipo Gift:
chaMode?: boolean;
reservedBy?: string;
reservedAt?: Timestamp;

// Remover import:
runTransaction,

// Remover funções:
reserveGift
cancelReservation

// Em getGifts e getVisibleGifts, remover dos mapeamentos:
chaMode: data.chaMode ?? false,
reservedBy: data.reservedBy || null,
reservedAt: data.reservedAt || null,

// Em addGift, remover:
chaMode: gift.chaMode ?? false,
```

### Deletar arquivo

```
src/components/gifts/ReserveGiftSheet.tsx
```

### Em `src/components/gifts/GiftCard.tsx`

- Remover imports: `Gift, Undo2, Loader2` de lucide-react
- Remover import: `ReserveGiftSheet`
- Remover import: `cancelReservation` de firestoreService
- Remover state: `reserveOpen`, `cancellingReservation`
- Remover funções: `handleCancelReservation`, `handleReserveSuccess`
- Remover `gift.reservedBy` e `gift.reservedAt` do useEffect
- Restaurar JSX original (barra de progresso + botão Presentear sempre visíveis)
- Remover modal `ReserveGiftSheet`
- Remover `!localGift.chaMode` do condicional do PaymentSheet
- Restaurar botão de simulação (remover `!localGift.chaMode`)

### Em `src/components/gifts/GiftCardPublic.tsx`

- Remover imports: `Gift, Badge`
- Remover import: `ReserveGiftSheet`
- Remover state: `reserveOpen`, `reserved`
- Remover `handleReserveSuccess`
- Restaurar JSX original (barra de progresso + botão Presentear sempre visíveis)
- Remover modal `ReserveGiftSheet`
- Remover `!localGift.chaMode` do condicional do PaymentSheet

### Em `src/components/gifts/AddGiftFAB.tsx`

- Remover import: `Checkbox`
- Remover state: `chaMode`
- Remover checkbox do form
- Remover `chaMode` do `addGift()` call
- Restaurar campo de valor (remover `!chaMode &&`)

### Em `src/components/gifts/EditGiftDialog.tsx`

- Remover import: `Checkbox`
- Remover state: `chaMode`
- Remover `chaMode` do useEffect e do `updateGift()`
- Remover checkbox do form
- Restaurar campos de valor (remover `{!chaMode && ()}`)

### Em `src/components/gifts/ImageUploader.tsx`

- Remover import: `Pencil`
- Remover função: `handleEdit`
- Remover botão "Editar" do hover overlay
- Restaurar onClose do CropModal (remover `selectedFile !== displayUrl`)

### Em `src/components/gifts/CropModal.tsx`

- Remover botão "Sem recorte" do DialogFooter
- Remover funções: `fileToBlob`, `srcToFile`, `handleSkipCrop`
- Remover import: `ImageOff`
- Restaurar `object-cover` nas imagens do card (remover mudanças para `object-contain`)

### Em `src/components/gifts/GiftCard.tsx` e `GiftCardPublic.tsx`

- Restaurar `object-cover` nas imagens (remover `object-contain`)

### Em `src/components/gifts/ImageUploader.tsx`

- Restaurar `object-cover` na preview (remover `object-contain`)

---

## Resultado esperado

- `/` volta a mostrar a home page completa
- `/present-list` continua funcionando
- `/cha-de-panela` não existe mais
- Console.logs voltam a aparecer em produção (devLog removido)
- Admin mostra valor bruto sem desconto de taxa
- Constants sem CHA_DATE e CHA_VENUE
- ChaHero sem swipe touch
- GiftCard sem React.memo (re-renders podem ocorrer)
- CropModal sem preview de imagem, sem seletor de aspect ratio, sem botão "Sem recorte"
- PaymentSheet sem mostrar valor restante
- GiftCard sempre mostra barra de progresso e botão Presentear (sem modo reserva)
- Sem ReserveGiftSheet, sem reserveGift/cancelReservation
- ImageUploader sem botão "Editar" (só Trocar e Remover)
- AddGiftFAB e EditGiftDialog sem checkbox de modo reserva
- GiftPriority sem "premium" (volta para alta, media, baixa)
- Constants sem premium priority, baixa com ícone "○" original
- cha-de-panela.tsx sem seção de paleta de cores
- GiftCard sem botão "Comprar na loja" (buyLink)
- GiftCard sem modo "sem valor" (noValue)

---

## 8. Reverter novas features (prioridade premium, paleta, buyLink, noValue)

### Em `src/lib/firestoreService.ts`

```tsx
// Remover do tipo GiftPriority:
"premium"

// Remover do tipo Gift:
buyLink?: string;
noValue?: boolean;

// Em getGifts, getVisibleGifts e addGift, remover:
buyLink: data.buyLink || "",
noValue: data.noValue ?? false,
```

### Em `src/lib/constants.ts`

```tsx
// Remover do array GIFT_PRIORITIES:
{ value: "premium", label: "Premium", icon: "💎" },

// Restaurar ícone de "baixa":
{ value: "baixa", label: "Baixa", icon: "○" }, // era "🔹"
```

### Em `src/components/gifts/GiftCard.tsx`

- Remover import: `ExternalLink` de lucide-react
- Restaurar borda do card: remover classe condicional premium (`border-yellow-400/60 shadow-[0_0_20px_rgba(255,215,0,0.3)]`)
- Restaurar prioridade: remover caso `"premium"` do badge
- Remover seção `buyLink` (botão "Comprar na loja")
- Remover seção `noValue` (card sem valor)
- Remover `gift.buyLink` e `gift.noValue` do useEffect

### Em `src/components/gifts/GiftCardPublic.tsx`

- Remover import: `ExternalLink` de lucide-react
- Restaurar borda do card: remover classe condicional premium
- Remover seção `buyLink` (botão "Comprar na loja")
- Remover seção `noValue` (card sem valor)

### Em `src/components/gifts/AddGiftFAB.tsx`

- Remover states: `buyLink`, `noValue`
- Remover campo: "Link de compra online"
- Remover checkbox: "Presente sem valor definido"
- Remover `buyLink` e `noValue` do `addGift()` call
- Restaurar campo de valor (remover `!chaMode && !noValue &&`)

### Em `src/components/gifts/EditGiftDialog.tsx`

- Remover states: `buyLink`, `noValue`
- Remover campo: "Link de compra online"
- Remover checkbox: "Presente sem valor definido"
- Remover `buyLink` e `noValue` do `updateGift()` call
- Restaurar campos de valor (remover `!chaMode && !noValue &&`)

### Em `src/routes/cha-de-panela.tsx`

- Remover seção de paleta de cores (bloco com 5 bolas coloridas)

---

## 9. Reverter cache do useCategories

### Em `src/hooks/useCategories.ts`

```tsx
// Remover import:
import { GIFT_CATEGORIES } from "@/lib/constants";

// Remover import do firestore:
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Remover cache (sessionStorage + useState loading):
const CACHE_KEY = "mn_categories_cache";
const CACHE_TTL = 5 * 60 * 1000;

interface CachedData {
  categories: CategoryItem[];
  timestamp: number;
}

const loadFromCache = (): CategoryItem[] | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.categories;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const saveToCache = (categories: CategoryItem[]) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ categories, timestamp: Date.now() }));
  } catch { /* ok */ }
};

// Remover useState de loading:
const [loading, setLoading] = useState(true);

// Remover useEffect com cache check, getDocs, saveToCache, setLoading
// Restaurar para versão simples sem cache:
useEffect(() => {
  const load = async () => {
    try {
      const snap = await getDocs(collection(db, "siteSettings"));
      const docSnap = await getDoc(doc(db, "siteSettings", "general"));
      let custom: string[] = [];
      if (docSnap.exists()) {
        custom = docSnap.data().customCategories ?? [];
      }
      setCustomCategories(custom);
    } catch (error) {
      devLog.error("Error loading custom categories:", error);
    }
  };
  load();
}, []);

// Remover clearCategoriesCache export:
export function clearCategoriesCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

// Remover loading do return:
return { categories: allCategories, loading, refresh, clearCategoriesCache };
// PARA:
return { categories: allCategories, refresh };
```

---

## 10. Reverter exclusão de noValue nos stats admin

### Em `src/routes/admin.painel.tsx`

```tsx
// DE (bloco noValue exclusion):
const nonNoValueGifts = gifts.filter((g) => !g.noValue);
const totalGoal = nonNoValueGifts.reduce((s, g) => s + g.total, 0);
const totalRaised = contributions.reduce((s, c) => s + c.value, 0);
const guaranteedGifts = nonNoValueGifts.filter(
  (g) => g.raised >= g.total
).length;
const giftsInProgress = nonNoValueGifts.filter(
  (g) => g.raised > 0 && g.raised < g.total
).length;

// PARA:
const totalGoal = gifts.reduce((s, g) => s + g.total, 0);
const totalRaised = contributions.reduce((s, c) => s + c.value, 0);
const guaranteedGifts = gifts.filter((g) => g.raised >= g.total).length;
const giftsInProgress = gifts.filter((g) => g.raised > 0 && g.raised < g.total).length;

// Remover todas as linhas: !g.noValue && de filters em:
// - giftsPurchased (filteredGifts.filter)
// - giftsInProgress (filteredGifts.filter)
// - SemContribuicao (filteredGifts.filter)
// - totalArrecadadoPresentes (filteredGifts.filter)

// Remover linhas que ocultam meta/restante para noValue na tabela de categorias
// Restaurar barra de progresso visível para todos os gifts
```

### Em `src/components/admin/CategoryStats.tsx`

```tsx
// DE (noValue exclusion no useMemo de categorias):
const categorized = useMemo(() => {
  const map: Record<string, { items: Gift[]; meta: number; arrecadado: number }> = {};
  for (const cat of allCategories) {
    map[cat.id] = { items: [], meta: 0, arrecadado: 0 };
  }
  for (const gift of gifts) {
    if (gift.noValue) continue;
    const cat = map[gift.category] || map["outros"];
    if (cat) {
      cat.items.push(gift);
      cat.meta += gift.total;
      cat.arrecadado += gift.raised;
    }
  }
  return map;
}, [gifts, allCategories]);

// PARA:
const categorized = useMemo(() => {
  const map: Record<string, { items: Gift[]; meta: number; arrecadado: number }> = {};
  for (const cat of allCategories) {
    map[cat.id] = { items: [], meta: 0, arrecadado: 0 };
  }
  for (const gift of gifts) {
    const cat = map[gift.category] || map["outros"];
    if (cat) {
      cat.items.push(gift);
      cat.meta += gift.total;
      cat.arrecadado += gift.raised;
    }
  }
  return map;
}, [gifts, allCategories]);

// Restaurar barra de progresso visível (remover condição !item.noValue)
// Restaurar "Meta: X" / "Restante: X" sempre visível (remover !item.noValue &&)
```

### Em `src/components/admin/PriorityStats.tsx`

```tsx
// DE (noValue exclusion):
const priorityGroups = useMemo(() => {
  const groups: Record<string, { items: Gift[]; meta: number; arrecadado: number }> = {};
  for (const p of GIFT_PRIORITIES) {
    groups[p.value] = { items: [], meta: 0, arrecadado: 0 };
  }
  for (const gift of gifts) {
    if (gift.noValue) continue;
    const g = groups[gift.priority];
    if (g) {
      g.items.push(gift);
      g.meta += gift.total;
      g.arrecadado += gift.raised;
    }
  }
  return groups;
}, [gifts]);

// PARA:
const priorityGroups = useMemo(() => {
  const groups: Record<string, { items: Gift[]; meta: number; arrecadado: number }> = {};
  for (const p of GIFT_PRIORITIES) {
    groups[p.value] = { items: [], meta: 0, arrecadado: 0 };
  }
  for (const gift of gifts) {
    const g = groups[gift.priority];
    if (g) {
      g.items.push(gift);
      g.meta += gift.total;
      g.arrecadado += gift.raised;
    }
  }
  return groups;
}, [gifts]);

// Restaurar "Restante" sempre visível (remover condicional `restante > 0 &&`)
```

---

## 11. Reverter centralização de tabelas

### Em `src/routes/admin.painel.tsx`

```tsx
// Em todas as tabelas (RSVP, Detalhamento dos Presentes):
// Remover text-center de todas as <th> e <td>
// Voltar para alinhamento padrão (text-left ou sem classe de alinhamento)
```

### Em `src/components/admin/CategoryStats.tsx`

```tsx
// Na tabela overview:
// Remover text-center das colunas: Arrecadado, Restante, Progresso

// Na tabela detalhada:
// Remover text-center da coluna Progresso
```

### Em `src/components/admin/ReservedGiftsSection.tsx`

```tsx
// Remover text-center de todas as <th> e <td>
// Voltar para alinhamento padrão
```

---

## 12. Reverter fix do ThankYouSheet (PaymentSheet useEffect)

### Em `src/components/gifts/PaymentSheet.tsx`

```tsx
// DE (linha ~75 - deps corrigidas):
}, [gift.id, contributionId, pollCount, pollPaymentStatus, step, toast]);

// PARA (restaurar gift.raised que causava reset do step):
}, [gift.id, gift.raised, contributionId, pollCount, pollPaymentStatus, step, toast]);
```

---

## 13. Reverter scroll do CategoryStats

### Em `src/components/admin/CategoryStats.tsx`

```tsx
// DE (no detail view wrapper):
<div className="max-h-[400px] overflow-y-auto pr-1 -mr-1">
  {/* tabela detalhada */}
</div>

// PARA: remover wrapper com max-h, manter só o conteúdo
{/* tabela detalhada sem wrapper */}
```

---

## 14. Reverter melhorias do ReservedGiftsSection

### Em `src/components/admin/ReservedGiftsSection.tsx`

```tsx
// Remover scroll wrapper:
<div className="max-h-[500px] overflow-y-auto">
  {/* conteúdo da tabela */}
</div>
// PARA: remover wrapper, manter só a tabela

// Remover botões de ação (Confirmar Entrega / Cancelar Reserva):
// Remover coluna "Ações" do thead e td

// Remover coluna "Reservado em":
// Remover <th> e <td> com data de reservedAt
```

---

## 15. Reverter "Prefiro comprar na loja"

### Em `src/components/gifts/PaymentSheet.tsx`

```tsx
// Remover import: ReserveGiftSheet
// Remover state: reserveOpen
// Remover botão "Prefiro comprar na loja" do form
// Remover modal <ReserveGiftSheet>
// Remover toda a lógica de reserveOpen
```

---

## 16. Reverter cartão desabilitado no PaymentSheet

### Em `src/components/gifts/PaymentSheet.tsx`

```tsx
// DE (botão desabilitado):
<Button type="submit" disabled={loading || submitting || paymentMethod === "card"}>
  {submitting ? "Processando..." : "Gerar código PIX"}
</Button>

// PARA (habilitar cartão):
<Button type="submit" disabled={loading || submitting}>
  {submitting ? "Processando..." : "Gerar código PIX"}
</Button>

// Remover condição que oculta "Falta" para noValue:
// DE: {!localGift.noValue && gift.raised < gift.total && (
// PARA: {gift.raised < gift.total && (
```

---

## 17. Reverter script de teste local

### Deletar arquivo

```
scripts/test-payment.mjs
```

### Em `package.json`

```json
// Remover script:
"test:payment": "node scripts/test-payment.mjs"
```

---

## 18. Reverter GeneralSettingsDialog toggle chá

### Em `src/components/admin/GeneralSettingsDialog.tsx`

```tsx
// Remover state: chaActive
// Remover toggle switch "Chá de Panela ativo/inativo"
// Remover chaActive do onSave
// Remover do carregamento inicial do Firestore
```

---

## 19. Reverter logout do admin

### Em `src/routes/admin.painel.tsx`

```tsx
// Remover import: LogOut de lucide-react
// Remover import: signOut de firebase/auth
// Remover import: auth de firebase
// Remover import: useNavigate de react-router-dom
// Remover função handleLogout
// Remover botão "Sair" do JSX
```

---

## 20. Reverter RSVP declínio persistido

### Em `src/routes/admin.painel.tsx`

```tsx
// Remover badge "Recusou" de RSVPs recusadas
// Na contagem, remover separação entre confirmados/recusados
```

---

## 21. Reverter botão Maps (sem iframe)

### Em `src/components/home/OndeVaiSer.tsx`

```tsx
// DE (botão link):
<a href={settings.venueGoogleMapsUrl || "#"} target="_blank" rel="noopener noreferrer">
  <Button>Abrir no Google Maps</Button>
</a>

// PARA (restaurar iframe):
<iframe src={settings.venueGoogleMapsUrl} ... />
```

### Em `src/components/cha/ChaDetails.tsx` (será deletado na reversão da rota)

---

## 22. Reverter gift duplicate

### Em `src/components/gifts/AddGiftFAB.tsx`

```tsx
// Remover prop: duplicateFrom
// Remover useEffect que popula form com dados do duplicate
// Remover lógica que abre dialog quando duplicateFrom muda
```

---

## 23. Reverter CategoryDialog emoji grid

### Em `src/components/admin/CategoryDialog.tsx`

```tsx
// Se reverter custom categories entirely, restaurar para versão anterior
// Caso contrário, manter - CategoryDialog é admin-only
```
