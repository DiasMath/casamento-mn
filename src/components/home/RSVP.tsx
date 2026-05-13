import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import { Flower } from "@/components/decor/Flower";

export function RSVP() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companions, setCompanions] = useState("0");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    toast.success("Presença confirmada! 💛", { description: `Obrigado, ${name.split(" ")[0]}.` });
    setTimeout(() => {
      setDone(false);
      setName("");
      setPhone("");
      setCompanions("0");
    }, 2500);
  };

  return (
    <section id="rsvp" className="relative px-4 py-20 sm:py-28 overflow-hidden">
      <Flower className="absolute top-6 right-6" size={80} variant="yellow" rotate={15} opacity={0.55} />
      <Flower className="absolute bottom-10 left-4" size={90} variant="blue" rotate={-20} opacity={0.5} />

      <div className="relative max-w-xl mx-auto text-center">
        <p className="font-script text-3xl text-primary">presença</p>
        <h2 className="text-2xl sm:text-4xl font-semibold mt-2">Confirme sua presença</h2>
        <p className="mt-4 text-foreground/80">
          Sua presença é o presente mais lindo. Nos avise se vai poder celebrar este dia com a gente.
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
            disabled={done}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-base"
          >
            {done ? (
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
