import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const readingsTable = pgTable("readings", {
  id: serial("id").primaryKey(),
  spreadId: text("spread_id").notNull(),
  spreadName: text("spread_name").notNull(),
  question: text("question"),
  notes: text("notes"),
  synthesis: text("synthesis"),
  deckMode: text("deck_mode").notNull().default("tarot"),
  focus: text("focus").notNull().default("general"),
  feelings: jsonb("feelings").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingCardsTable = pgTable("reading_cards", {
  id: serial("id").primaryKey(),
  readingId: integer("reading_id").notNull().references(() => readingsTable.id, { onDelete: "cascade" }),
  cardId: text("card_id").notNull(),
  cardName: text("card_name").notNull(),
  positionName: text("position_name").notNull(),
  reversed: boolean("reversed").notNull().default(false),
});

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const customDecksTable = pgTable("custom_decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customCardsTable = pgTable("custom_cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().references(() => customDecksTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  glyph: text("glyph").notNull().default("✦"),
  imageUrl: text("image_url"),
  uprightMeaning: text("upright_meaning").notNull().default(""),
  reversedMeaning: text("reversed_meaning").notNull().default(""),
  uprightKeywords: jsonb("upright_keywords").$type<string[]>().notNull().default([]),
  reversedKeywords: jsonb("reversed_keywords").$type<string[]>().notNull().default([]),
  reflection: text("reflection"),
  position: integer("position").notNull().default(0),
});

export const insertReadingSchema = createInsertSchema(readingsTable).omit({ id: true, createdAt: true });
export const insertReadingCardSchema = createInsertSchema(readingCardsTable).omit({ id: true });

export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readingsTable.$inferSelect;
export type ReadingCard = typeof readingCardsTable.$inferSelect;
export type Setting = typeof settingsTable.$inferSelect;
