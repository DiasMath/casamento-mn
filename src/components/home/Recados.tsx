import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Send } from "lucide-react";
import { Flower } from "@/components/decor/Flower";

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
    text: "Vocês são o casal mais lindo! Felicidades, muita saúde e amor pra vida toda 💛",
  },
  {
    id: "m3",
    name: "Vovó Cecília",
    text: "Recebam a bênção da vovó. Que Deus abençoe esse novo capítulo de vocês.",
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
    <section id="recados" className="relative px-4 py-20 sm:py-28 bg-secondary/40 overflow-hidden">
      <Flower className="absolute top-10 left-6" size={80} variant="blue" rotate={-15} opacity={0.5} />
      <Flower className="absolute bottom-10 right-4" size={100} variant="yellow" rotate={25} opacity={0.5} />

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

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
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
