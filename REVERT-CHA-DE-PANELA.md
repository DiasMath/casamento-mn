# Reverter: Remover rota "Chá de Panela"

Quando quiser mostrar a home page completa novamente, siga estes passos:

---

## Passo 1: Deletar arquivos criados

Deletar estes 2 arquivos:

```
src/routes/cha-de-panela.tsx
src/components/layout/ChaLayout.tsx
```

## Passo 2: Restaurar rota `/` no main.tsx

No arquivo `src/main.tsx`:

1. Trocar o Navigate de volta para Index:
```tsx
// DE:
<Route path="/" element={<Navigate to="/cha-de-panela" replace />} />
// PARA:
<Route path="/" element={<Index />} />
```

2. Remover a importação do Navigate:
```tsx
// DE:
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
// PARA:
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
```

3. Remover a rota cha-de-panela:
```tsx
// Remover esta linha:
<Route path="/cha-de-panela" element={<ChaDePanela />} />
```

4. Remover a importação do ChaDePanela:
```tsx
// Remover esta linha:
import { ChaDePanela } from "./routes/cha-de-panela";
```

## Passo 3: Restaurar rota `/` no router.tsx

No arquivo `src/router.tsx` (opcional, usado em produção):

1. Remover o lazy import:
```tsx
// Remover estas 3 linhas:
const ChaDePanela = lazy(() =>
  import("./routes/cha-de-panela").then((m) => ({ default: m.ChaDePanela })),
);
```

2. Remover a rota:
```tsx
// Remover esta linha:
{ path: "/cha-de-panela", element: <ChaDePanela /> },
```

## Passo 4: Deletar este arquivo

Deletar `REVERT-CHA-DE-PANELA.md`.

---

## Resultado

- `/` volta a mostrar a home page completa
- `/present-list` continua funcionando com a navbar normal
- `/cha-de-panela` não existe mais
