import json
import sqlite3
from datetime import datetime
from pathlib import Path


class TarotDatabase:
    def __init__(self, path: Path):
        self.path = path
        self.connection = sqlite3.connect(path)
        self.connection.row_factory = sqlite3.Row
        self._create_schema()

    def _create_schema(self):
        self.connection.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            spread_id TEXT NOT NULL,
            spread_name TEXT NOT NULL,
            question TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '',
            feelings_json TEXT NOT NULL DEFAULT '[]',
            synthesis TEXT NOT NULL DEFAULT '',
            deck_mode TEXT NOT NULL DEFAULT 'tarot',
            focus TEXT NOT NULL DEFAULT 'general'
        );

        CREATE TABLE IF NOT EXISTS reading_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reading_id INTEGER NOT NULL,
            position_index INTEGER NOT NULL,
            position_name TEXT NOT NULL,
            card_id TEXT NOT NULL,
            card_name TEXT NOT NULL,
            suit TEXT,
            arcana TEXT NOT NULL,
            reversed INTEGER NOT NULL,
            FOREIGN KEY(reading_id) REFERENCES readings(id) ON DELETE CASCADE
        );
        """)
        self._ensure_column("readings", "deck_mode", "TEXT NOT NULL DEFAULT 'tarot'")
        self._ensure_column("readings", "focus", "TEXT NOT NULL DEFAULT 'general'")
        self.connection.commit()

    def _ensure_column(self, table: str, column: str, definition: str):
        existing = {
            row["name"]
            for row in self.connection.execute(f"PRAGMA table_info({table})").fetchall()
        }
        if column not in existing:
            self.connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")

    def get_setting(self, key: str, default: str = "") -> str:
        row = self.connection.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default

    def set_setting(self, key: str, value: str):
        self.connection.execute(
            "INSERT INTO settings(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value),
        )
        self.connection.commit()

    def save_reading(self, spread, question, notes, feelings, drawn_cards, synthesis, deck_mode='tarot', focus='general') -> int:
        cur = self.connection.execute(
            "INSERT INTO readings(created_at, spread_id, spread_name, question, notes, feelings_json, synthesis, deck_mode, focus) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                datetime.now().astimezone().isoformat(timespec="seconds"),
                spread.id, spread.name, question.strip(), notes.strip(),
                json.dumps(sorted(feelings)), synthesis, deck_mode, focus,
            ),
        )
        reading_id = cur.lastrowid
        for index, item in enumerate(drawn_cards):
            self.connection.execute(
                "INSERT INTO reading_cards(reading_id, position_index, position_name, card_id, card_name, suit, arcana, reversed) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    reading_id, index, item.position.name, item.card.id, item.card.name,
                    item.card.suit, item.card.arcana, int(item.reversed),
                ),
            )
        self.connection.commit()
        return reading_id

    def recent_readings(self, limit: int = 100):
        rows = self.connection.execute(
            "SELECT * FROM readings ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) | {"feelings": json.loads(r["feelings_json"])} for r in rows]

    def reading_cards(self, reading_id: int):
        return [dict(r) for r in self.connection.execute(
            "SELECT * FROM reading_cards WHERE reading_id = ? ORDER BY position_index", (reading_id,)
        ).fetchall()]

    def delete_reading(self, reading_id: int):
        self.connection.execute("DELETE FROM reading_cards WHERE reading_id = ?", (reading_id,))
        self.connection.execute("DELETE FROM readings WHERE id = ?", (reading_id,))
        self.connection.commit()

    def insight_data(self):
        top_cards = [dict(r) for r in self.connection.execute("""
            SELECT card_name AS label, COUNT(*) AS value
            FROM reading_cards GROUP BY card_id ORDER BY value DESC, card_name LIMIT 10
        """).fetchall()]
        feelings = [dict(r) for r in self.connection.execute(
            "SELECT feelings_json FROM readings"
        ).fetchall()]
        feeling_counts = {}
        for row in feelings:
            for feeling in json.loads(row["feelings_json"]):
                feeling_counts[feeling] = feeling_counts.get(feeling, 0) + 1
        top_feelings = [
            {"label": key, "value": value}
            for key, value in sorted(feeling_counts.items(), key=lambda x: (-x[1], x[0]))[:10]
        ]
        suits = [dict(r) for r in self.connection.execute("""
            SELECT COALESCE(suit, 'Major') AS label, COUNT(*) AS value
            FROM reading_cards GROUP BY COALESCE(suit, 'Major') ORDER BY value DESC
        """).fetchall()]
        orientations = [dict(r) for r in self.connection.execute("""
            SELECT CASE reversed WHEN 1 THEN 'Reversed' ELSE 'Upright' END AS label, COUNT(*) AS value
            FROM reading_cards GROUP BY reversed ORDER BY reversed
        """).fetchall()]
        monthly = [dict(r) for r in self.connection.execute("""
            SELECT substr(created_at, 1, 7) AS label, COUNT(*) AS value
            FROM readings GROUP BY substr(created_at, 1, 7) ORDER BY label DESC LIMIT 12
        """).fetchall()][::-1]
        total = self.connection.execute("SELECT COUNT(*) AS n FROM readings").fetchone()["n"]
        return {
            "top_cards": top_cards, "feelings": top_feelings, "suits": suits,
            "orientations": orientations, "monthly": monthly, "total": total,
        }
