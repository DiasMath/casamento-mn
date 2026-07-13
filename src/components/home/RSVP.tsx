import { useState, useRef, useEffect } from "react";
import { devLog } from "@/lib/devLog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Sparkles, Loader2, Heart, X } from "lucide-react";
import { Flower, Branch, Vine } from "@/components/decor/Flower";
import { addRSVP, declineRSVP } from "@/lib/firestoreService";

const PHONE_REGEX = /^\(\d{2}\)\s?9\d{4}-?\d{4}$/;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function RSVP() {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companions, setCompanions] = useState("0");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (formatted && !PHONE_REGEX.test(formatted)) {
      setPhoneError("Formato: (XX) 9XXXX-XXXX");
    } else {
      setPhoneError("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      setPhoneError("Formato: (XX) 9XXXX-XXXX");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalGuests = (Number(companions) || 0) + 1;
      await addRSVP(name.trim(), phone.trim(), totalGuests);

      setDone(true);
      toast.success("Presença confirmada! 💛", {
        description: `Obrigado, ${name.split(" ")[0]}.`,
      });
    } catch (error) {
      devLog.error("Erro ao confirmar presença:", error);
      toast.error("Erro ao confirmar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDone(false);
    setAttending(null);
    setName("");
    setPhone("");
    setCompanions("0");
    setPhoneError("");
  };

  const handleDecline = async () => {
    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    setIsSubmitting(true);
    try {
      await declineRSVP(name.trim());
      setDone(true);
      toast.info("Sentiremos sua falta!", {
        description: `Obrigado por avisar, ${name.split(" ")[0]}.`,
      });
    } catch (error) {
      devLog.error("Erro ao registrar recusa:", error);
      toast.error("Erro ao registrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp"
      className="relative px-4 py-20 sm:py-28 overflow-hidden"
      style={{ scrollMarginTop: "80px" }}
    >
      <Branch
        className="absolute -top-4 -right-8 hidden sm:block"
        size={140}
        rotate={140}
        opacity={0.4}
      />
      <Flower
        className="absolute top-4 right-4 sm:right-8"
        size={75}
        variant="yellow"
        rotate={20}
        opacity={0.55}
      />
      <Flower
        className="absolute top-16 right-16 hidden sm:block"
        size={45}
        variant="blue"
        rotate={-10}
        opacity={0.45}
      />
      <Flower
        className="absolute top-8 left-8 hidden sm:block"
        size={50}
        variant="mixed"
        rotate={30}
        opacity={0.4}
      />
      <Vine
        className="absolute top-0 left-0 hidden sm:block"
        size={100}
        rotate={5}
        opacity={0.35}
      />
      <Branch
        className="absolute -bottom-4 -left-8 hidden sm:block"
        size={150}
        rotate={-10}
        opacity={0.4}
      />
      <Flower
        className="absolute bottom-8 left-4 sm:left-8"
        size={85}
        variant="blue"
        rotate={-25}
        opacity={0.5}
      />
      <Flower
        className="absolute bottom-20 left-16 hidden sm:block"
        size={40}
        variant="yellow"
        rotate={15}
        opacity={0.45}
      />
      <Flower
        className="absolute bottom-12 right-6 hidden sm:block"
        size={55}
        variant="mixed"
        rotate={-15}
        opacity={0.4}
      />
      <Vine
        className="absolute bottom-0 right-0 hidden sm:block"
        size={90}
        rotate={-5}
        opacity={0.35}
      />

      <div className="relative max-w-xl mx-auto text-center">
        <p className="font-script text-3xl sm:text-4xl text-primary">
          presença
        </p>
        <h2 className="text-2xl sm:text-4xl font-semibold mt-2">
          Confirme sua presença
        </h2>
        <p className="mt-4 text-foreground/80">
          Sua presença é o presente mais lindo. Nos avise se vai poder celebrar
          este dia com a gente.
        </p>

        {/* Estado de sucesso */}
        {done ? (
          <div className="mt-10 bg-card rounded-3xl p-8 sm:p-10 border border-border/60 shadow-[var(--shadow-card)] text-center space-y-4 animate-in fade-in duration-500">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${attending ? "bg-primary/10" : "bg-muted"}`}>
              {attending ? (
                <Heart className="w-8 h-8 text-primary fill-primary/40" />
              ) : (
                <X className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold">
              {attending ? "Presença confirmada!" : "Registro confirmado"}
            </h3>
            <p className="text-muted-foreground">
              {attending ? (
                <>
                  Obrigado,{" "}
                  <span className="font-medium text-foreground">
                    {name.split(" ")[0]}
                  </span>
                  !
                  <br />
                  Estamos muito felizes em ter você conosco.
                </>
              ) : (
                <>
                  Obrigado por avisar,{" "}
                  <span className="font-medium text-foreground">
                    {name.split(" ")[0]}
                  </span>
                  .
                  <br />
                  Sentiremos sua falta!
                </>
              )}
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="rounded-full mt-2"
            >
              Confirmar outra presença
            </Button>
          </div>
        ) : attending === null ? (
          /* Toggle presença */
          <div className="mt-10 bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-[var(--shadow-card)]">
            <p className="text-foreground/80 mb-6">
              Você vai poder comparecer ao casamento?
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setAttending(true)}
                className="flex-1 h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base gap-2"
              >
                <Sparkles className="w-4 h-4" /> Vou comparecer!
              </Button>
              <Button
                onClick={() => setAttending(false)}
                variant="outline"
                className="flex-1 h-12 rounded-full text-base gap-2"
              >
                <X className="w-4 h-4" /> Não vou poder
              </Button>
            </div>
          </div>
        ) : !attending ? (
          /* Não vai comparecer */
          <div className="mt-10 bg-card rounded-3xl p-8 sm:p-10 border border-border/60 shadow-[var(--shadow-card)] text-center space-y-4 animate-in fade-in duration-500">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <X className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Sentiremos sua falta!</h3>
            <p className="text-muted-foreground">
              Por favor, nos informe seu nome para que possamos registrar.
            </p>
            <div className="max-w-xs mx-auto">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="h-12 rounded-xl text-center"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleDecline}
                disabled={isSubmitting || !name.trim()}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Confirmar recusa
              </Button>
              <Button
                onClick={() => {
                  setAttending(null);
                  setName("");
                }}
                variant="outline"
                className="rounded-full"
              >
                Voltar
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário de confirmação */
          <form
            onSubmit={submit}
            className="mt-10 bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-[var(--shadow-card)] text-left space-y-4 animate-in fade-in duration-300"
          >
            <div>
              <Label htmlFor="rsvp-name">Nome completo</Label>
              <Input
                id="rsvp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Como devemos chamar você?"
                className="h-12 rounded-xl mt-2"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="rsvp-phone">Telefone (WhatsApp)</Label>
              <Input
                id="rsvp-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={`h-12 rounded-xl mt-2 ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                disabled={isSubmitting}
                autoComplete="tel"
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1">{phoneError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="rsvp-comp">Acompanhantes</Label>
              <Input
                id="rsvp-comp"
                type="number"
                min={0}
                max={5}
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                className="h-12 rounded-xl mt-2"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base disabled:opacity-70 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Confirmar presença
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
