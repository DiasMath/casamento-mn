import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula a porcentagem de progresso de um presente
 * @param raised Valor já arrecadado
 * @param total Valor total do presente
 * @returns Porcentagem entre 0 e 100
 */
export function calculatePercentage(raised: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((raised / total) * 100));
}

/**
 * Valida os dados de um presente (usado tanto na criação como na edição).
 * Lança um erro se os dados forem inválidos ou devolve os dados formatados e convertidos.
 */
export function validateGiftData(
  title: string,
  image: string,
  total: string | number,
  raised?: string | number,
  marca?: string,
) {
  const totalNum = typeof total === "string" ? parseFloat(total) : total;

  if (isNaN(totalNum) || totalNum <= 0) {
    throw new Error("O valor total deve ser um número positivo.");
  }

  if (!title.trim() || !image.trim()) {
    throw new Error("O título e o URL da imagem são obrigatórios.");
  }

  let raisedNum = 0;
  if (raised !== undefined) {
    raisedNum = typeof raised === "string" ? parseFloat(raised) : raised;
    if (isNaN(raisedNum) || raisedNum < 0) {
      throw new Error("O valor arrecadado deve ser um número não negativo.");
    }
  }

  return {
    validTitle: title.trim(),
    validImage: image.trim(),
    validMarca: marca ? marca.trim() : "",
    totalNum,
    raisedNum,
  };
}
