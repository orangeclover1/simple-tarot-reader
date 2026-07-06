import { Router } from "express";
import { db } from "@workspace/db";
import { readingsTable, readingCardsTable, settingsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  CreateReadingBody,
  ListReadingsQueryParams,
  GetReadingParams,
  DeleteReadingParams,
  UpdateSettingsBody,
} from "@workspace/api-zod";

const router = Router();

// GET /readings
router.get("/readings", async (req, res) => {
  try {
    const query = ListReadingsQueryParams.parse(req.query);
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const rows = await db
      .select()
      .from(readingsTable)
      .orderBy(desc(readingsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const result = await Promise.all(
      rows.map(async (r) => {
        const cards = await db
          .select()
          .from(readingCardsTable)
          .where(eq(readingCardsTable.readingId, r.id));
        return {
          id: r.id,
          spreadId: r.spreadId,
          spreadName: r.spreadName,
          question: r.question ?? null,
          notes: r.notes ?? null,
          synthesis: r.synthesis ?? null,
          deckMode: r.deckMode,
          focus: r.focus,
          feelings: r.feelings ?? [],
          cardNames: cards.map((c) => c.cardName + (c.reversed ? " ↩" : "")),
          createdAt: r.createdAt.toISOString(),
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listReadings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /readings/recent
router.get("/readings/recent", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(readingsTable)
      .orderBy(desc(readingsTable.createdAt))
      .limit(5);

    const result = await Promise.all(
      rows.map(async (r) => {
        const cards = await db
          .select()
          .from(readingCardsTable)
          .where(eq(readingCardsTable.readingId, r.id));
        return {
          id: r.id,
          spreadId: r.spreadId,
          spreadName: r.spreadName,
          question: r.question ?? null,
          notes: r.notes ?? null,
          synthesis: r.synthesis ?? null,
          deckMode: r.deckMode,
          focus: r.focus,
          feelings: r.feelings ?? [],
          cardNames: cards.map((c) => c.cardName + (c.reversed ? " ↩" : "")),
          createdAt: r.createdAt.toISOString(),
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listRecentReadings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /readings/:id
router.get("/readings/:id", async (req, res) => {
  try {
    const { id } = GetReadingParams.parse({ id: Number(req.params.id) });
    const [reading] = await db
      .select()
      .from(readingsTable)
      .where(eq(readingsTable.id, id));

    if (!reading) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const cards = await db
      .select()
      .from(readingCardsTable)
      .where(eq(readingCardsTable.readingId, id));

    res.json({
      id: reading.id,
      spreadId: reading.spreadId,
      spreadName: reading.spreadName,
      question: reading.question ?? null,
      notes: reading.notes ?? null,
      synthesis: reading.synthesis ?? null,
      deckMode: reading.deckMode,
      focus: reading.focus,
      feelings: reading.feelings ?? [],
      createdAt: reading.createdAt.toISOString(),
      cards: cards.map((c) => ({
        cardId: c.cardId,
        cardName: c.cardName,
        positionName: c.positionName,
        reversed: c.reversed,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "getReading error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /readings
router.post("/readings", async (req, res) => {
  try {
    const body = CreateReadingBody.parse(req.body);

    const [reading] = await db
      .insert(readingsTable)
      .values({
        spreadId: body.spreadId,
        spreadName: body.spreadName,
        question: body.question || null,
        notes: body.notes || null,
        synthesis: body.synthesis || null,
        deckMode: body.deckMode,
        focus: body.focus,
        feelings: body.feelings ?? [],
      })
      .returning();

    if (body.cards?.length) {
      await db.insert(readingCardsTable).values(
        body.cards.map((c) => ({
          readingId: reading.id,
          cardId: c.cardId,
          cardName: c.cardName,
          positionName: c.positionName,
          reversed: c.reversed,
        }))
      );
    }

    const cards = await db
      .select()
      .from(readingCardsTable)
      .where(eq(readingCardsTable.readingId, reading.id));

    res.status(201).json({
      id: reading.id,
      spreadId: reading.spreadId,
      spreadName: reading.spreadName,
      question: reading.question ?? null,
      notes: reading.notes ?? null,
      synthesis: reading.synthesis ?? null,
      deckMode: reading.deckMode,
      focus: reading.focus,
      feelings: reading.feelings ?? [],
      cardNames: cards.map((c) => c.cardName + (c.reversed ? " ↩" : "")),
      createdAt: reading.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "createReading error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /readings/:id
router.delete("/readings/:id", async (req, res) => {
  try {
    const { id } = DeleteReadingParams.parse({ id: Number(req.params.id) });
    await db.delete(readingsTable).where(eq(readingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteReading error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /insights
router.get("/insights", async (req, res) => {
  try {
    const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(readingsTable);
    const total = totalResult[0]?.count ?? 0;

    // Top cards
    const topCardsRaw = await db
      .select({
        label: readingCardsTable.cardName,
        value: sql<number>`count(*)::int`,
      })
      .from(readingCardsTable)
      .groupBy(readingCardsTable.cardName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Feelings
    const readingsWithFeelings = await db.select({ feelings: readingsTable.feelings }).from(readingsTable);
    const feelingCount: Record<string, number> = {};
    for (const r of readingsWithFeelings) {
      for (const f of r.feelings ?? []) {
        feelingCount[f] = (feelingCount[f] ?? 0) + 1;
      }
    }
    const feelings = Object.entries(feelingCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }));

    // Orientations
    const uprightCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(readingCardsTable)
      .where(eq(readingCardsTable.reversed, false));
    const reversedCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(readingCardsTable)
      .where(eq(readingCardsTable.reversed, true));
    const orientations = [
      { label: "Upright", value: uprightCount[0]?.count ?? 0 },
      { label: "Reversed", value: reversedCount[0]?.count ?? 0 },
    ];

    // Monthly
    const monthlyRaw = await db
      .select({
        label: sql<string>`to_char(created_at, 'YYYY-MM')`,
        value: sql<number>`count(*)::int`,
      })
      .from(readingsTable)
      .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM')`)
      .limit(12);

    // Suits — from card names heuristic stored in reading_cards
    const suitKeywords: Record<string, string> = {
      wands: "Wands",
      cups: "Cups",
      swords: "Swords",
      pentacles: "Pentacles",
    };
    const suitCount: Record<string, number> = {};
    const allCardNames = await db
      .select({ cardName: readingCardsTable.cardName })
      .from(readingCardsTable);
    for (const { cardName } of allCardNames) {
      const lower = cardName.toLowerCase();
      for (const [key, label] of Object.entries(suitKeywords)) {
        if (lower.includes(key)) {
          suitCount[label] = (suitCount[label] ?? 0) + 1;
        }
      }
    }
    const majorCount = allCardNames.filter(
      ({ cardName }) => ![...Object.values(suitKeywords)].some((s) => cardName.toLowerCase().includes(s.toLowerCase()))
    ).length;
    if (majorCount > 0) suitCount["Major Arcana"] = majorCount;

    const suits = Object.entries(suitCount)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    res.json({
      total,
      topCards: topCardsRaw,
      feelings,
      suits,
      orientations,
      monthly: monthlyRaw,
    });
  } catch (err) {
    req.log.error({ err }, "getInsights error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /settings
router.get("/settings", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({ theme: map["theme"] ?? "Midnight Plum" });
  } catch (err) {
    req.log.error({ err }, "getSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /settings
router.put("/settings", async (req, res) => {
  try {
    const body = UpdateSettingsBody.parse(req.body);
    if (body.theme) {
      await db
        .insert(settingsTable)
        .values({ key: "theme", value: body.theme })
        .onConflictDoUpdate({ target: settingsTable.key, set: { value: body.theme } });
    }
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({ theme: map["theme"] ?? "Midnight Plum" });
  } catch (err) {
    req.log.error({ err }, "updateSettings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
