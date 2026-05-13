import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Send } from "lucide-react";
import { Flower, Branch, Vine, Garland } from "@/components/decor/Flower";

interface Message {
  id: string;
  name: string;
  text: string;
}

const initialMessages: Message[] = [
  {
    id: "m1",
    name: "Mariana",
    text: "Que essa união seja eterna como o amor que vocês transmitem! Mal posso esperar pelo grande dia.",
  },
  {
    id: "m2",
    name: "Pedro & Julia",
    text: "Vocês são o casal mais lindo! Felicidades, muita saúde e amor pra vida toda.",
  },
  {
    id: "m3",
    name: "Vovó Cecília",
    text: "Recebam a bênção da vovó. Que Deus abençoe esse novo capítulo de vocês.",
  },
  {
    id: "m4",
    name: "Carlos & Ana",
    text: "Was ourselves we will be there to celebrate this love!",
  },
  {
    id: "m5",
    name: "Sofia",
    text: "Mal posso esperar para ver vocês se dizendo 'sim'! ",
  },
  {
    id: "m6",
    name: "Tio José",
    text: "Deus abençoe essa união. Família toda torcendo por vocês!",
  },
  {
    id: "m7",
    name: "Lucas",
    text: "Casal mais charmoso que conheço. Desejo toda a felicidade do mundo!",
  },
];

export function Recados() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setMessages([{ id: crypto.randomUUID(), name, text }, ...messages]);
    setName("");
    setText("");
    toast.success("Recado enviado! Obrigado pelo carinho 💛");
  };

  return (
    <section id="recados" className="relative px-4 py-16 sm:py-24 bg-secondary/40 overflow-hidden" style={{ scrollMarginTop: "80px" }}>
      <Branch className="absolute -top-4 -left-8 hidden sm:block" size={150} rotate={-5} opacity={0.4} />
      <Flower className="absolute top-8 left-4 sm:left-8" size={70} variant="blue" rotate={-20} opacity={0.5} />
      <Flower className="absolute top-24 left-16 hidden sm:block" size={45} variant="yellow" rotate={15} opacity={0.4} />
      <Vine className="absolute top-0 left-0 hidden sm:block" size={100} rotate={10} opacity={0.35} />
      <Flower className="absolute top-6 right-8 hidden sm:block" size={50} variant="mixed" rotate={25} opacity={0.45} />
      <Branch className="absolute -top-4 -right-8 hidden sm:block" size={140} rotate={175} opacity={0.35} />
      <Flower className="absolute bottom-16 right-4 sm:right-8" size={90} variant="yellow" rotate={30} opacity={0.5} />
      <Flower className="absolute bottom-28 left-12 hidden sm:block" size={40} variant="blue" rotate={-15} opacity={0.45} />
      <Flower className="absolute bottom-8 left-6" size={55} variant="mixed" rotate={-25} opacity={0.45} />
      <Branch className="absolute -bottom-4 -left-4 hidden sm:block" size={130} rotate={-10} opacity={0.4} />
      <Vine className="absolute bottom-0 right-0 hidden sm:block" size={90} rotate={-5} opacity={0.3} />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center">
          <p className="font-script text-3xl text-primary">recados</p>
          <h2 className="text-2xl sm:text-4xl font-semibold mt-2">Mural dos convidados</h2>
          <p className="mt-4 text-foreground/80">
            Deixe um recadinho de carinho para os noivos. Vamos guardar cada palavra como lembrança deste dia.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-10 bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-[var(--shadow-card)] space-y-4"
        >
          <div>
            <Label htmlFor="r-name">Seu nome</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Como você se chama?"
              className="h-11 rounded-xl mt-2"
            />
          </div>
          <div>
            <Label htmlFor="r-text">Recado</Label>
            <Textarea
              id="r-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={4}
              placeholder="Escreva uma mensagem carinhosa para os noivos..."
              className="rounded-xl mt-2 resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Send className="w-4 h-4 mr-2" /> Enviar recado
          </Button>
        </form>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-card rounded-2xl p-5 border border-border/60 shadow-[var(--shadow-card)] relative"
            >
              <Heart className="w-4 h-4 text-primary fill-primary/40 absolute top-4 right-4" />
              <p className="font-script text-2xl text-foreground">{m.name}</p>
              <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
