import { Layout } from "@/components/layout";
import { Link, useLocation } from "wouter";
import {
  useListCustomDecks,
  useCreateCustomDeck,
  useDeleteCustomDeck,
} from "@workspace/api-client-react";
import { useState } from "react";
import { Plus, ChevronRight, Trash2, Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomDecks() {
  const [, navigate] = useLocation();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: decks = [], isLoading, refetch } = useListCustomDecks();
  const { mutateAsync: createDeck } = useCreateCustomDeck();
  const { mutateAsync: deleteDeck } = useDeleteCustomDeck();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const deck = await createDeck({ data: { name: newName.trim(), description: newDesc.trim() || undefined } });
    setCreating(false);
    setNewName("");
    setNewDesc("");
    navigate(`/custom-decks/${deck.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deck and all its cards?")) return;
    await deleteDeck({ id });
    refetch();
  };

  return (
    <Layout>
      <div className="p-5 space-y-5">
        <header className="pt-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My Decks</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Build your own oracle cards</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Deck
          </button>
        </header>

        {creating && (
          <div className="bg-card border border-primary/40 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold">Create a new deck</p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Deck name…"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description (optional)…"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 hover:opacity-90 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); setNewDesc(""); }}
                className="flex-1 bg-muted text-muted-foreground text-sm py-2.5 rounded-xl hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : decks.length === 0 && !creating ? (
          <div className="text-center py-16 space-y-3">
            <Layers className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No custom decks yet.</p>
            <button
              onClick={() => setCreating(true)}
              className="text-primary text-sm hover:underline"
            >
              Create your first deck →
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {decks.map((deck) => (
              <li key={deck.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="text-2xl">🃏</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{deck.name}</div>
                    {deck.description && (
                      <div className="text-xs text-muted-foreground truncate">{deck.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(deck.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/custom-decks/${deck.id}`}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
