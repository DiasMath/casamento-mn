# Reverter: Mudanças desta sessão

Quando precisar reverter apenas as mudanças desta sessão, siga estes passos.

---

## NOVAS ALTERAÇÕES DESTA SESSÃO

### Resumo das Mudanças

1. **ChaHero.tsx** - Corrigido loop infinito, adicionado swipe touch
2. **GiftCard.tsx** - Corrigido state sync, adicionado React.memo, modo reserva (chaMode), premium glow, buyLink, noValue
3. **GiftCardPublic.tsx** - Modo reserva (chaMode), premium glow, buyLink, noValue
4. **cha-de-panela.tsx** - Container de presentes, paleta de cores
5. **CropModal.tsx** - Preview em tempo real + dicas de imagem + seletor aspect ratio + sem recorte
6. **PaymentSheet.tsx** - Mostra valor restante do presente
7. **firestoreService.ts** - Campo chaMode, reservedBy, reservedAt, buyLink, noValue; funções reserveGift/cancelReservation
8. **ReserveGiftSheet.tsx** - Dialog centralizado para reserva de presentes
9. **ImageUploader.tsx** - Botão "Editar" para recortar imagem existente
10. **AddGiftFAB.tsx** - Checkbox "modo reserva", buyLink, noValue
11. **EditGiftDialog.tsx** - Checkbox "modo reserva", buyLink, noValue
12. **constants.ts** - Prioridade premium (💎), ícone baixa alterado (🔹)
13. **GiftCard.tsx** / **GiftCardPublic.tsx** - object-contain para imagens

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
