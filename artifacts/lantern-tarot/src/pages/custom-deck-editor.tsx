import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import {
  useGetCustomDeck,
  useUpdateCustomDeck,
  useCreateCustomCard,
  useUpdateCustomCard,
  useDeleteCustomCard,
} from "@workspace/api-client-react";
import { useState } from "react";
import { ChevronLeft, Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = [
  "✨","🌙","☀️","🌊","🔥","❄️","🌿","🌸","⭐","🌀",
  "🪄","🗝️","🏮","🔮","🪞","🎭","📖","🧪","🕯️","🌳",
  "🌱","🦋","🌈","💎","🧭","⚓","🔔","🪶","👑","🌺",
];

interface CardFormData {
  name: string;
  glyph: string;
  imageUrl: string;
  uprightMeaning: string;
  reversedMeaning: string;
  uprightKeywords: string;
  reversedKeywords: string;
  reflection: string;
}

const EMPTY_FORM: CardFormData = {
  name: "",
  glyph: "✨",
  imageUrl: "",
  uprightMeaning: "",
  reversedMeaning: "",
  uprightKeywords: "",
  reversedKeywords: "",
  reflection: "",
};

function CardForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CardFormData;
  onSave: (data: CardFormData) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<CardFormData>(initial);
  const set = (k: keyof CardFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-3">
      {/* Name + glyph row */}
      <div className="flex gap-2">
        <div className="w-14">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Emoji</label>
          <input
            value={form.glyph}
            onChange={set("glyph")}
            className="w-full bg-background border border-border rounded-xl px-2 py-2.5 text-center text-xl focus:outline-none focus:ring-1 focus:ring-primary"
            maxLength={4}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Card name *</label>
          <input
            autoFocus
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. The Wanderer"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Quick emoji picker */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick pick</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setForm((f) => ({ ...f, glyph: e }))}
              className={cn(
                "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all",
                form.glyph === e
                  ? "bg-primary/20 ring-1 ring-primary"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Image URL (optional)</label>
        <input
          value={form.imageUrl}
          onChange={set("imageUrl")}
          placeholder="https://…"
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="preview"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            className="mt-2 w-20 h-28 object-cover rounded-xl border border-border"
          />
        )}
      </div>

      {/* Meanings */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Upright meaning</label>
        <textarea
          value={form.uprightMeaning}
          onChange={set("uprightMeaning")}
          placeholder="What this card means when upright…"
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reversed meaning</label>
        <textarea
          value={form.reversedMeaning}
          onChange={set("reversedMeaning")}
          placeholder="What this card means reversed…"
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Upright keywords</label>
          <input
            value={form.uprightKeywords}
            onChange={set("uprightKeywords")}
            placeholder="hope, clarity, growth"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reversed keywords</label>
          <input
            value={form.reversedKeywords}
            onChange={set("reversedKeywords")}
            placeholder="doubt, delay, block"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Reflection */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reflection prompt (optional)</label>
        <input
          value={form.reflection}
          onChange={set("reflection")}
          placeholder="e.g. What are you ready to release?"
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save card
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-muted text-muted-foreground text-sm py-3 rounded-xl hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function parseKeywords(s: string): string[] {
  return s.split(",").map((k) => k.trim()).filter(Boolean);
}

function formToKeywords(s: string): string {
  return s;
}

export default function CustomDeckEditor() {
  const { id: idStr } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = Number(idStr);

  const { data: deck, isLoading, refetch } = useGetCustomDeck(id);
  const { mutateAsync: createCard } = useCreateCustomCard();
  const { mutateAsync: updateCard } = useUpdateCustomCard();
  const { mutateAsync: deleteCard } = useDeleteCustomCard();

  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddCard = async (form: CardFormData) => {
    setSaving(true);
    try {
      await createCard({
        id,
        data: {
          name: form.name,
          glyph: form.glyph || "✨",
          imageUrl: form.imageUrl || undefined,
          uprightMeaning: form.uprightMeaning,
          reversedMeaning: form.reversedMeaning,
          uprightKeywords: parseKeywords(form.uprightKeywords),
          reversedKeywords: parseKeywords(form.reversedKeywords),
          reflection: form.reflection || undefined,
        },
      });
      setShowAddCard(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleEditCard = async (cardId: number, form: CardFormData) => {
    setSaving(true);
    try {
      await updateCard({
        id,
        cardId,
        data: {
          name: form.name,
          glyph: form.glyph || "✨",
          imageUrl: form.imageUrl || undefined,
          uprightMeaning: form.uprightMeaning,
          reversedMeaning: form.reversedMeaning,
          uprightKeywords: parseKeywords(form.uprightKeywords),
          reversedKeywords: parseKeywords(form.reversedKeywords),
          reflection: form.reflection || undefined,
        },
      });
      setEditingCardId(null);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Remove this card from the deck?")) return;
    await deleteCard({ id, cardId });
    refetch();
  };

  if (isLoading) {
    return (
      <Layout hideNav>
        <div className="flex justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!deck) {
    return (
      <Layout hideNav>
        <div className="p-6 text-center space-y-3 pt-12">
          <p className="text-muted-foreground">Deck not found.</p>
          <button onClick={() => navigate("/custom-decks")} className="text-primary text-sm">
            ← Back to My Decks
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="flex flex-col min-h-[100dvh] p-5 gap-5">
        {/* Header */}
        <div className="pt-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/custom-decks")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{deck.name}</h1>
            {deck.description && (
              <p className="text-xs text-muted-foreground truncate">{deck.description}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
          </span>
        </div>

        {/* Tip */}
        {deck.cards.length === 0 && !showAddCard && (
          <div className="bg-muted/60 rounded-2xl px-4 py-3 text-sm text-muted-foreground text-center">
            Add at least 2 cards to use this deck in a reading.
          </div>
        )}

        {/* Add card form */}
        {showAddCard ? (
          <div className="bg-card border border-primary/40 rounded-2xl p-4">
            <p className="text-sm font-semibold mb-3">Add a card</p>
            <CardForm
              initial={EMPTY_FORM}
              onSave={handleAddCard}
              onCancel={() => setShowAddCard(false)}
              saving={saving}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a card
          </button>
        )}

        {/* Cards list */}
        <div className="space-y-3 pb-4">
          {deck.cards.map((card) => (
            <div key={card.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              {editingCardId === card.id ? (
                <div className="p-4">
                  <p className="text-sm font-semibold mb-3">Edit card</p>
                  <CardForm
                    initial={{
                      name: card.name,
                      glyph: card.glyph,
                      imageUrl: card.imageUrl ?? "",
                      uprightMeaning: card.uprightMeaning ?? "",
                      reversedMeaning: card.reversedMeaning ?? "",
                      uprightKeywords: (card.uprightKeywords ?? []).join(", "),
                      reversedKeywords: (card.reversedKeywords ?? []).join(", "),
                      reflection: card.reflection ?? "",
                    }}
                    onSave={(form) => handleEditCard(card.id, form)}
                    onCancel={() => setEditingCardId(null)}
                    saving={saving}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3.5">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-10 h-14 object-cover rounded-lg border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                      {card.glyph}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="font-semibold text-sm">{card.name}</div>
                    {card.uprightMeaning && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{card.uprightMeaning}</p>
                    )}
                    {(card.uprightKeywords?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {card.uprightKeywords!.slice(0, 3).map((k) => (
                          <span key={k} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <button
                      onClick={() => setEditingCardId(card.id)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
