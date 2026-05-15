import { useState, useCallback } from "react";
import type { Gift } from "@/lib/firestoreService";

/**
 * Hook reutilizável para gerenciar o estado de pagamento de um gift
 * Útil para GiftCard, GiftCardPublic e outros componentes que precisam de payment flow
 */
export function useGiftPayment(gift: Gift) {
  const [localGift, setLocalGift] = useState(gift);
  const [payOpen, setPayOpen] = useState(false);

  const handlePaymentSuccess = useCallback((value: number) => {
    setLocalGift((prev) => ({
      ...prev,
      raised: prev.raised + value,
    }));
  }, []);

  const resetGift = useCallback(() => {
    setLocalGift(gift);
  }, [gift]);

  return {
    localGift,
    setLocalGift,
    payOpen,
    setPayOpen,
    handlePaymentSuccess,
    resetGift,
  };
}