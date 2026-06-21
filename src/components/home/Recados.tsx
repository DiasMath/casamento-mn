import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Send, Loader2 } from "lucide-react";
import { Flower, Branch } from "@/components/decor/Flower";
import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { subscribeMessages, addMessage, Message } from "@/lib/firestoreService";

const MAX_NAME = 50;
const MAX_TEXT = 300;

function formatRelativeDate(timestamp: Message["createdAt"]): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export function Recados() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeMessages(
      (data) => {
        setMessages(data);
        setLoading(false);
      },
      () => {
        toast.error("Não foi possível carregar os recados.");
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, informe seu nome.");
      return;
    }
    if (!text.trim()) {
      toast.error("Por favor, escreva um recado.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addMessage(name.trim(), text.trim());
      setName("");
      setText("");
      toast.success("Recado enviado! 💛");
    } catch (error) {
      console.error("Erro ao enviar recado:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="recados"
      className="relative px-4 py-16 sm:py-24 bg-secondary/40 overflow-hidden"
      style={{ scrollMarginTop: "80px" }}
    >
      <Branch
        className="absolute -top-4 -left-8 hidden sm:block"
        size={150}
        rotate={-5}
        opacity={0.4}
      />
      <Flower
        className="absolute top-8 left-4 sm:left-8"
        size={70}
        variant="blue"
        rotate={-20}
        opacity={0.5}
      />
      <Flower
        className="absolute bottom-16 right-4 sm:right-8"
        size={90}
        variant="yellow"
        rotate={30}
        opacity={0.5}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-script text-3xl sm:text-4xl text-primary">
            recados
          </p>
          <h2 className="text-2xl sm:text-4xl font-semibold mt-2">
            Mural dos convidados
          </h2>
          <p className="mt-4 text-foreground/80 max-w-2xl mx-auto">
            Deixe um recadinho de carinho para os noivos.
          </p>
        </div>

        {/* Formulário de envio */}
        <form
          onSubmit={submit}
          className="max-w-2xl mx-auto bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm space-y-4 mb-16"
        >
          <div>
            <Label htmlFor="r-name">Seu nome</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
              required
              placeholder="Como se chama?"
              className="h-11 rounded-xl mt-2"
              disabled={isSubmitting}
              maxLength={MAX_NAME}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {name.length}/{MAX_NAME}
            </p>
          </div>
          <div>
            <Label htmlFor="r-text">Recado</Label>
            <Textarea
              id="r-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              required
              rows={3}
              placeholder="Escreva uma mensagem..."
              className="rounded-xl mt-2 resize-none"
              disabled={isSubmitting}
              maxLength={MAX_TEXT}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {text.length}/{MAX_TEXT}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Enviando..." : "Enviar recado"}
          </Button>
        </form>

        {/* Área do carrossel */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-[160px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 bg-card/50 rounded-2xl border border-border/50">
              <p className="text-muted-foreground italic">
                Seja o primeiro a deixar um recado para os noivos!
              </p>
            </div>
          ) : (
            <Carousel
              opts={{
                loop: true,
                align: "start",
              }}
              plugins={[
                AutoScroll({
                  speed: 1,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {[...messages, ...messages].map((m, index) => (
                  <CarouselItem
                    key={`${m.id}-${index}`}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm relative h-full flex flex-col min-h-[160px]">
                      <Heart className="w-4 h-4 text-primary fill-primary/40 absolute top-4 right-4" />
                      <p className="font-script text-2xl text-foreground mb-3">
                        {m.name}
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed italic flex-1 break-words">
                        &ldquo;{m.text}&rdquo;
                      </p>
                      {m.createdAt && (
                        <p className="text-[10px] text-muted-foreground mt-3">
                          {formatRelativeDate(m.createdAt)}
                        </p>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}
