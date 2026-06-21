import { useState, useCallback } from "react";
import type { Gift } from "@/lib/firestoreService";

/**
 * Hook reutilizável para gerenciar o estado de pagamento de um gift
 * Útil para GiftCard, GiftCardPublic e outros componentes que precisam de payment flow
 */
export function useGiftPayment(gift: Gift) {
  const [localGift, setLocalGift] = useState(gift);
  const [payOpen, setPayOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState(0);

  const handlePaymentSuccess = useCallback((value: number) => {
    setLocalGift((prev) => ({
      ...prev,
      raised: prev.raised + value,
    }));
    setConfirmedValue(value);
    setPayOpen(false);
    setThankYouOpen(true);
  }, []);

  const resetGift = useCallback(() => {
    setLocalGift(gift);
  }, [gift]);

  return {
    localGift,
    setLocalGift,
    payOpen,
    setPayOpen,
    thankYouOpen,
    setThankYouOpen,
    confirmedValue,
    handlePaymentSuccess,
    resetGift,
  };
}
