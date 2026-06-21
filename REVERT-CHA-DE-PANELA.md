# Reverter: Remover rota "Chá de Panela"

Quando quiser mostrar a home page completa novamente, siga estes passos:

---

## Passo 1: Deletar arquivos criados

Deletar estes 2 arquivos:

```
src/routes/cha-de-panela.tsx
src/components/layout/ChaLayout.tsx
```

## Passo 2: Remover rota do router

No arquivo `src/router.tsx`, remover estas 2 linhas:

1. O lazy import do ChaDePanela (buscar por `ChaDePanela` e remover as 3 linhas):
```tsx
const ChaDePanela = lazy(() =>
  import("./routes/cha-de-panela").then((m) => ({ default: m.ChaDePanela })),
);
```

2. A rota (buscar por `cha-de-panela` e remover a linha):
```tsx
{ path: "/cha-de-panela", element: <ChaDePanela /> },
```

## Passo 3: Deletar este arquivo

Deletar `REVERT-CHA-DE-PANELA.md`.

---

## Resultado

- `/` volta a mostrar a home page completa
- `/present-list` continua funcionando com a navbar normal
- `/cha-de-panela` não existe mais
