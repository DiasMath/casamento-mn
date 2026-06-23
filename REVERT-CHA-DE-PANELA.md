# Reverter: Mudanças desta sessão

Quando precisar reverter apenas as mudanças desta sessão, siga estes passos.

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

## Resultado esperado

- `/` volta a mostrar a home page completa
- `/present-list` continua funcionando
- `/cha-de-panela` não existe mais
- Console.logs voltam a aparecer em produção (devLog removido)
- Admin mostra valor bruto sem desconto de taxa
- Constants sem CHA_DATE e CHA_VENUE
