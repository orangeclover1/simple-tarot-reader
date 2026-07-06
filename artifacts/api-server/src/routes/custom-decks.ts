import { Router } from "express";
import { db } from "@workspace/db";
import { customDecksTable, customCardsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  GetCustomDeckParams,
  CreateCustomDeckBody,
  UpdateCustomDeckParams,
  UpdateCustomDeckBody,
  DeleteCustomDeckParams,
  CreateCustomCardParams,
  CreateCustomCardBody,
  UpdateCustomCardParams,
  UpdateCustomCardBody,
  DeleteCustomCardParams,
} from "@workspace/api-zod";

const router = Router();

// GET /custom-decks
router.get("/custom-decks", async (req, res) => {
  const decks = await db.select().from(customDecksTable).orderBy(customDecksTable.createdAt);
  const result = await Promise.all(
    decks.map(async (d) => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(customCardsTable)
        .where(eq(customCardsTable.deckId, d.id));
      return {
        id: d.id,
        name: d.name,
        description: d.description ?? null,
        cardCount: Number(value),
        createdAt: d.createdAt.toISOString(),
      };
    })
  );
  res.json(result);
});

// POST /custom-decks
router.post("/custom-decks", async (req, res) => {
  const body = CreateCustomDeckBody.parse(req.body);
  const [deck] = await db
    .insert(customDecksTable)
    .values({ name: body.name, description: body.description })
    .returning();
  res.status(201).json({
    id: deck.id,
    name: deck.name,
    description: deck.description ?? null,
    cardCount: 0,
    createdAt: deck.createdAt.toISOString(),
  });
});

// GET /custom-decks/:id
router.get("/custom-decks/:id", async (req, res) => {
  const { id } = GetCustomDeckParams.parse(req.params);
  const deck = await db.select().from(customDecksTable).where(eq(customDecksTable.id, id)).limit(1);
  if (!deck.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const cards = await db
    .select()
    .from(customCardsTable)
    .where(eq(customCardsTable.deckId, id))
    .orderBy(customCardsTable.position);

  res.json({
    id: deck[0].id,
    name: deck[0].name,
    description: deck[0].description ?? null,
    cardCount: cards.length,
    createdAt: deck[0].createdAt.toISOString(),
    cards: cards.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      name: c.name,
      glyph: c.glyph,
      imageUrl: c.imageUrl ?? null,
      uprightMeaning: c.uprightMeaning,
      reversedMeaning: c.reversedMeaning,
      uprightKeywords: (c.uprightKeywords as string[]) ?? [],
      reversedKeywords: (c.reversedKeywords as string[]) ?? [],
      reflection: c.reflection ?? null,
      position: c.position,
    })),
  });
});

// PUT /custom-decks/:id
router.put("/custom-decks/:id", async (req, res) => {
  const { id } = UpdateCustomDeckParams.parse(req.params);
  const body = UpdateCustomDeckBody.parse(req.body);
  const updated = await db
    .update(customDecksTable)
    .set({ name: body.name, description: body.description })
    .where(eq(customDecksTable.id, id))
    .returning();
  if (!updated.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [{ value }] = await db
    .select({ value: count() })
    .from(customCardsTable)
    .where(eq(customCardsTable.deckId, id));
  res.json({
    id: updated[0].id,
    name: updated[0].name,
    description: updated[0].description ?? null,
    cardCount: Number(value),
    createdAt: updated[0].createdAt.toISOString(),
  });
});

// DELETE /custom-decks/:id
router.delete("/custom-decks/:id", async (req, res) => {
  const { id } = DeleteCustomDeckParams.parse(req.params);
  await db.delete(customDecksTable).where(eq(customDecksTable.id, id));
  res.status(204).send();
});

// POST /custom-decks/:id/cards
router.post("/custom-decks/:id/cards", async (req, res) => {
  const { id } = CreateCustomCardParams.parse(req.params);
  const deck = await db.select().from(customDecksTable).where(eq(customDecksTable.id, id)).limit(1);
  if (!deck.length) {
    res.status(404).json({ error: "Deck not found" });
    return;
  }
  const body = CreateCustomCardBody.parse(req.body);
  const existing = await db.select().from(customCardsTable).where(eq(customCardsTable.deckId, id));
  const position = existing.length;
  const [card] = await db
    .insert(customCardsTable)
    .values({
      deckId: id,
      name: body.name,
      glyph: body.glyph ?? "✦",
      imageUrl: body.imageUrl,
      uprightMeaning: body.uprightMeaning ?? "",
      reversedMeaning: body.reversedMeaning ?? "",
      uprightKeywords: body.uprightKeywords ?? [],
      reversedKeywords: body.reversedKeywords ?? [],
      reflection: body.reflection,
      position,
    })
    .returning();
  res.status(201).json({
    id: card.id,
    deckId: card.deckId,
    name: card.name,
    glyph: card.glyph,
    imageUrl: card.imageUrl ?? null,
    uprightMeaning: card.uprightMeaning,
    reversedMeaning: card.reversedMeaning,
    uprightKeywords: (card.uprightKeywords as string[]) ?? [],
    reversedKeywords: (card.reversedKeywords as string[]) ?? [],
    reflection: card.reflection ?? null,
    position: card.position,
  });
});

// PUT /custom-decks/:id/cards/:cardId
router.put("/custom-decks/:id/cards/:cardId", async (req, res) => {
  const { id, cardId } = UpdateCustomCardParams.parse(req.params);
  const body = UpdateCustomCardBody.parse(req.body);
  const updated = await db
    .update(customCardsTable)
    .set({
      name: body.name ?? undefined,
      glyph: body.glyph ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      uprightMeaning: body.uprightMeaning ?? undefined,
      reversedMeaning: body.reversedMeaning ?? undefined,
      uprightKeywords: body.uprightKeywords ?? undefined,
      reversedKeywords: body.reversedKeywords ?? undefined,
      reflection: body.reflection ?? undefined,
    })
    .where(eq(customCardsTable.id, cardId))
    .returning();
  if (!updated.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const c = updated[0];
  res.json({
    id: c.id,
    deckId: c.deckId,
    name: c.name,
    glyph: c.glyph,
    imageUrl: c.imageUrl ?? null,
    uprightMeaning: c.uprightMeaning,
    reversedMeaning: c.reversedMeaning,
    uprightKeywords: (c.uprightKeywords as string[]) ?? [],
    reversedKeywords: (c.reversedKeywords as string[]) ?? [],
    reflection: c.reflection ?? null,
    position: c.position,
  });
});

// DELETE /custom-decks/:id/cards/:cardId
router.delete("/custom-decks/:id/cards/:cardId", async (req, res) => {
  const { cardId } = DeleteCustomCardParams.parse(req.params);
  await db.delete(customCardsTable).where(eq(customCardsTable.id, cardId));
  res.status(204).send();
});

export default router;
