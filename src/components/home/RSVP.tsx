import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Flower, Branch, Vine } from "@/components/decor/Flower";
import { addRSVP } from "@/lib/firestoreService";

export function RSVP() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companions, setCompanions] = useState("0");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const totalGuests = Number(companions) + 1; // +1 é a própria pessoa
      await addRSVP(name.trim(), phone.trim(), totalGuests);

      setDone(true);
      toast.success("Presença confirmada! 💛", {
        description: `Obrigado, ${name.split(" ")[0]}.`,
      });
      setTimeout(() => {
        setDone(false);
        setName("");
        setPhone("");
        setCompanions("0");
      }, 3000);
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      toast.error("Erro ao confirmar. Tente novamente.");
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
        <p className="font-script text-3xl text-primary">presença</p>
        <h2 className="text-2xl sm:text-4xl font-semibold mt-2">
          Confirme sua presença
        </h2>
        <p className="mt-4 text-foreground/80">
          Sua presença é o presente mais lindo. Nos avise se vai poder celebrar
          este dia com a gente.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-[var(--shadow-card)] text-left space-y-4"
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
            />
          </div>
          <div>
            <Label htmlFor="rsvp-phone">Telefone (WhatsApp)</Label>
            <Input
              id="rsvp-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="(11) 99999-9999"
              className="h-12 rounded-xl mt-2"
            />
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
            />
          </div>
          <Button
            type="submit"
            disabled={done || isSubmitting}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
              </>
            ) : done ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Presença confirmada
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Confirmar presença
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
