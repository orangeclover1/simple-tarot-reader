from functools import partial
from importlib.resources import files

from kivy.app import App
from kivy.core.window import Window
from kivy.metrics import dp
from kivy.properties import DictProperty
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.checkbox import CheckBox
from kivy.uix.gridlayout import GridLayout
from kivy.uix.image import Image
from kivy.uix.label import Label
from kivy.uix.popup import Popup
from kivy.uix.scrollview import ScrollView
from kivy.uix.spinner import Spinner
from kivy.uix.textinput import TextInput
from kivy.utils import get_color_from_hex

from .database import TarotDatabase
from .reading_engine import (
    DECK_OPTIONS, FOCUS_OPTIONS, card_keywords, card_meaning, cards_for_deck,
    deck_label, draw_reading, focus_label, load_cards, load_oracle_cards,
    load_spreads, orientation, synthesize,
)
from .theme import DEFAULT_THEME, THEMES
from .symbols import card_glyph
from .widgets import BarChart, CardSymbol, ClickableSurface, PillButton, Surface, WrappedLabel


FEELINGS = [
    'Calm', 'Hopeful', 'Curious', 'Validated', 'Inspired', 'Clear',
    'Uncertain', 'Challenged', 'Sad', 'Anxious', 'Frustrated', 'Surprised',
]


class LanternTarotApp(App):
    theme = DictProperty(THEMES[DEFAULT_THEME])

    def build(self):
        self.title = 'Lantern Tarot'
        self.tarot_cards = load_cards()
        self.oracle_cards = load_oracle_cards()
        self.cards = self.tarot_cards + self.oracle_cards
        self.spreads = load_spreads()
        self.current_spread = self.spreads[0]
        self.current_reading = []
        self.selected_feelings = set()
        self.current_focus = 'general'
        self.current_deck_mode = 'tarot'
        self.db = TarotDatabase(self.user_data_dir_path / 'lantern_tarot.sqlite3')

        theme_name = self.db.get_setting('theme', DEFAULT_THEME)
        self.theme_name = theme_name if theme_name in THEMES else DEFAULT_THEME
        self.theme = THEMES[self.theme_name]

        Window.minimum_width = 320
        Window.minimum_height = 560
        self.icon = self.asset_path('app_icon_pixel.png')

        self.root_box = BoxLayout(orientation='vertical')
        self.nav_bar = self._nav()
        self.content = BoxLayout()
        self.root_box.add_widget(self.nav_bar)
        self.root_box.add_widget(self.content)
        self.show_home()
        return self.root_box

    @property
    def user_data_dir_path(self):
        from pathlib import Path
        path = Path(self.user_data_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def asset_dir_path(self):
        from pathlib import Path
        return Path(str(files('tarot_journal.assets')))

    def asset_path(self, filename: str) -> str:
        return str(files('tarot_journal.assets').joinpath(filename))

    def current_card_back(self) -> str:
        return self.asset_path(self.theme['card_back'])

    def current_theme_icon(self) -> str:
        return self.asset_path(self.theme['theme_icon'])

    def _symbol_widget(self, card, size=56, width=62):
        glyph_key, rank = card_glyph(card)
        return CardSymbol(
            glyph_key=glyph_key, rank=rank, theme=self.theme,
            size_hint=(None, None), width=dp(width), height=dp(size),
        )

    def _nav(self):
        # Top navigation avoids Android's bottom gesture/home-button area.
        bar = BoxLayout(size_hint_y=None, height=dp(56), spacing=dp(4), padding=[dp(6), dp(6), dp(6), dp(4)])
        entries = [
            ('Home', self.show_home),
            ('Read', self.show_read),
            ('Cards', self.show_library),
            ('Journal', self.show_history),
            ('Stats', self.show_insights),
        ]
        for text, callback in entries:
            button = Button(
                text=text,
                background_normal='',
                background_down='',
                background_color=get_color_from_hex(self.theme['surface']),
                color=get_color_from_hex(self.theme['text']),
                font_size='11sp',
                size_hint_y=None,
                height=dp(44),
            )
            button.bind(on_release=lambda _b, fn=callback: fn())
            bar.add_widget(button)
        return bar

    def _clear(self):
        self.content.clear_widgets()
        self.content.canvas.before.clear()
        with self.content.canvas.before:
            from kivy.graphics import Color, Rectangle
            self._bg_color = Color(*get_color_from_hex(self.theme['background']))
            self._bg_rect = Rectangle(pos=self.content.pos, size=self.content.size)
        self.content.bind(pos=lambda *_: setattr(self._bg_rect, 'pos', self.content.pos))
        self.content.bind(size=lambda *_: setattr(self._bg_rect, 'size', self.content.size))

    def _scroll_page(self, title, subtitle=''):
        self._clear()
        scroll = ScrollView()
        body = BoxLayout(
            orientation='vertical',
            size_hint_y=None,
            spacing=dp(12),
            padding=dp(16),
        )
        body.bind(minimum_height=body.setter('height'))
        body.add_widget(self._label(title, 28, 'primary', height=dp(48), bold=True))
        if subtitle:
            body.add_widget(self._label(subtitle, 15, 'muted'))
        spacer = BoxLayout(size_hint_y=None, height=dp(28))
        body.add_widget(spacer)
        scroll.add_widget(body)
        self.content.add_widget(scroll)
        return body

    def _label(self, text, size=16, color='text', height=None, bold=False):
        label = WrappedLabel(
            text=('[b]' + text + '[/b]') if bold else text,
            markup=(bold or '[b]' in text or '[i]' in text),
            font_size=f'{size}sp',
            color=get_color_from_hex(self.theme[color]),
            size_hint_y=None,
        )
        if height is not None:
            label.height = height
        return label

    def _button(self, text, callback, primary=False, height=50):
        button = Button(
            text=text,
            size_hint_y=None,
            height=dp(height),
            background_normal='',
            background_color=get_color_from_hex(
                self.theme['secondary'] if primary else self.theme['surface_alt']
            ),
            color=get_color_from_hex(self.theme['text']),
            font_size='16sp',
        )
        button.bind(on_release=callback)
        return button

    def _input(self, hint, multiline=True, height=100):
        return TextInput(
            hint_text=hint,
            multiline=multiline,
            size_hint_y=None,
            height=dp(height),
            background_normal='',
            background_active='',
            background_color=get_color_from_hex(self.theme['surface']),
            foreground_color=get_color_from_hex(self.theme['text']),
            hint_text_color=get_color_from_hex(self.theme['muted']),
            padding=[dp(12), dp(12)],
            cursor_color=get_color_from_hex(self.theme['primary']),
        )

    def change_focus(self, _spinner, label):
        reverse = {value: key for key, value in FOCUS_OPTIONS.items()}
        self.current_focus = reverse.get(label, 'general')

    def change_deck_mode(self, _spinner, label):
        reverse = {value: key for key, value in DECK_OPTIONS.items()}
        self.current_deck_mode = reverse.get(label, 'tarot')
        if hasattr(self, 'reverse_box'):
            self.reverse_box.active = self.current_deck_mode != 'oracle'

    def change_theme(self, _spinner, name):
        self.theme_name = name
        self.theme = THEMES[name]
        self.db.set_setting('theme', name)
        self.root_box.clear_widgets()
        self.nav_bar = self._nav()
        self.content = BoxLayout()
        self.root_box.add_widget(self.nav_bar)
        self.root_box.add_widget(self.content)
        self.show_home()

    def show_home(self, *_):
        body = self._scroll_page(
            'Lantern Tarot',
            'A private, offline tarot + oracle journal with focus lenses, decision support, and gentle pattern-tracking.',
        )

        hero = Surface(
            theme=self.theme,
            orientation='vertical',
            size_hint_y=None,
            height=dp(310),
            padding=dp(18),
            spacing=dp(10),
        )
        hero.add_widget(
            Image(
                source=self.current_theme_icon(),
                size_hint_y=None,
                height=dp(120),
                allow_stretch=True,
                keep_ratio=True,
            )
        )
        hero.add_widget(self._label('Simple · Elegant · Meaningful', 16, 'secondary', bold=True))
        hero.add_widget(self._label(
            'Tarot, oracle, love/work/spiritual/health meanings, local journaling, decision support, and insight charts — all kept on your device.',
            16,
            'text',
        ))
        hero.add_widget(self._button('Begin a reading', self.show_read, primary=True))
        body.add_widget(hero)

        body.add_widget(self._label('Quick actions', 20, 'primary', bold=True))
        body.add_widget(self._button('Daily one-card tarot reflection', self.quick_draw))
        body.add_widget(self._button('Oracle reflection', self.oracle_quick_draw))
        body.add_widget(self._button('Decision maker', self.quick_decision))
        body.add_widget(self._button('Browse the decks', self.show_library))

        body.add_widget(self._label('Theme', 20, 'primary', bold=True))
        spinner = Spinner(
            text=self.theme_name,
            values=list(THEMES),
            size_hint_y=None,
            height=dp(50),
            background_normal='',
            background_color=get_color_from_hex(self.theme['surface_alt']),
            color=get_color_from_hex(self.theme['text']),
        )
        spinner.bind(text=self.change_theme)
        body.add_widget(spinner)

        preview = Surface(
            theme=self.theme,
            orientation='vertical',
            size_hint_y=None,
            height=dp(325),
            padding=dp(14),
            spacing=dp(8),
        )
        preview.add_widget(self._label('Card back preview', 18, 'primary', bold=True))
        preview.add_widget(
            Image(
                source=self.current_card_back(),
                size_hint_y=None,
                height=dp(240),
                allow_stretch=True,
                keep_ratio=True,
            )
        )
        body.add_widget(preview)

        disclaimer = Surface(
            theme=self.theme,
            orientation='vertical',
            size_hint_y=None,
            height=dp(120),
            padding=dp(14),
        )
        disclaimer.add_widget(self._label(
            'Reflection, not certainty\nTarot can support personal reflection, but it does not replace professional medical, legal, financial, or mental-health advice.',
            14,
            'muted',
        ))
        body.add_widget(disclaimer)

    def quick_draw(self, *_):
        self.current_spread = next(s for s in self.spreads if s.id == 'single')
        self.current_focus = 'general'
        self.current_deck_mode = 'tarot'
        self.question_input = None
        self.perform_draw()

    def oracle_quick_draw(self, *_):
        self.current_spread = next(s for s in self.spreads if s.id == 'single')
        self.current_focus = 'general'
        self.current_deck_mode = 'oracle'
        self.question_input = None
        self.perform_draw()

    def quick_decision(self, *_):
        self.current_spread = next(s for s in self.spreads if s.id == 'decision-maker')
        self.current_focus = 'general'
        self.current_deck_mode = 'tarot'
        self.question_input = None
        self.perform_draw()

    def show_read(self, *_):
        body = self._scroll_page('Choose a spread', 'Select a spread, focus lens, and deck.')
        for spread in self.spreads:
            card = Surface(
                theme=self.theme,
                orientation='vertical',
                size_hint_y=None,
                height=dp(145),
                padding=dp(14),
                spacing=dp(4),
            )
            card.add_widget(self._label(f'{spread.icon}  {spread.name}', 19, 'primary', bold=True))
            card.add_widget(self._label(spread.description, 14, 'text'))
            card.add_widget(self._button(
                f"Use {len(spread.positions)} card{'s' if len(spread.positions) != 1 else ''}",
                partial(self.configure_spread, spread),
                height=42,
            ))
            body.add_widget(card)

    def configure_spread(self, spread, *_):
        self.current_spread = spread
        body = self._scroll_page(spread.name, spread.description)
        body.add_widget(self._label('Question or intention', 17, 'primary', bold=True))
        self.question_input = self._input(
            'Optional: What would you like to reflect on?',
            multiline=True,
            height=90,
        )
        body.add_widget(self.question_input)

        body.add_widget(self._label('Focus lens', 17, 'primary', bold=True))
        self.focus_spinner = Spinner(
            text=focus_label(self.current_focus),
            values=list(FOCUS_OPTIONS.values()),
            size_hint_y=None,
            height=dp(50),
            background_normal='',
            background_color=get_color_from_hex(self.theme['surface_alt']),
            color=get_color_from_hex(self.theme['text']),
        )
        self.focus_spinner.bind(text=self.change_focus)
        body.add_widget(self.focus_spinner)

        body.add_widget(self._label('Deck', 17, 'primary', bold=True))
        self.deck_spinner = Spinner(
            text=deck_label(self.current_deck_mode),
            values=list(DECK_OPTIONS.values()),
            size_hint_y=None,
            height=dp(50),
            background_normal='',
            background_color=get_color_from_hex(self.theme['surface_alt']),
            color=get_color_from_hex(self.theme['text']),
        )
        self.deck_spinner.bind(text=self.change_deck_mode)
        body.add_widget(self.deck_spinner)

        reverse_row = BoxLayout(size_hint_y=None, height=dp(48))
        reverse_row.add_widget(self._label('Include reversed cards', 16, 'text', height=dp(48)))
        self.reverse_box = CheckBox(active=True, size_hint_x=None, width=dp(54))
        reverse_row.add_widget(self.reverse_box)
        body.add_widget(reverse_row)

        card_preview = Surface(
            theme=self.theme,
            orientation='vertical',
            size_hint_y=None,
            height=dp(280),
            padding=dp(14),
            spacing=dp(10),
        )
        card_preview.add_widget(self._label('Deck style', 18, 'primary', bold=True))
        card_preview.add_widget(
            Image(
                source=self.current_card_back(),
                size_hint_y=None,
                height=dp(200),
                allow_stretch=True,
                keep_ratio=True,
            )
        )
        body.add_widget(card_preview)

        body.add_widget(self._label('Positions', 17, 'primary', bold=True))
        for pos in spread.positions:
            body.add_widget(self._label(f'• [b]{pos.name}[/b] — {pos.prompt}', 14, 'muted'))
        body.add_widget(self._button('Shuffle and draw', self.perform_draw, primary=True))

    def perform_draw(self, *_):
        question = self.question_input.text if self.question_input else ''
        reversals = self.reverse_box.active if hasattr(self, 'reverse_box') else True
        self.current_question = question
        deck_cards = cards_for_deck(self.current_deck_mode, self.tarot_cards, self.oracle_cards)
        self.current_reading = draw_reading(deck_cards, self.current_spread, reversals)
        self.selected_feelings = set()
        self.show_draw_preview()

    def show_draw_preview(self, *_):
        body = self._scroll_page('Cards are ready', self.current_question or 'Open reflection')
        body.add_widget(self._label(
            f'{deck_label(self.current_deck_mode)} deck · {focus_label(self.current_focus)} focus. Tap any card or the reveal button when you are ready.',
            15,
            'muted',
        ))
        cols = 2 if len(self.current_reading) <= 4 else 3
        grid = GridLayout(cols=cols, spacing=dp(10), size_hint_y=None)
        grid.bind(minimum_height=grid.setter('height'))
        for item in self.current_reading:
            cell = ClickableSurface(
                theme=self.theme,
                orientation='vertical',
                size_hint_y=None,
                height=dp(235),
                padding=dp(8),
                spacing=dp(6),
            )
            cell.add_widget(
                Image(
                    source=self.current_card_back(),
                    size_hint_y=None,
                    height=dp(170),
                    allow_stretch=True,
                    keep_ratio=True,
                )
            )
            cell.add_widget(self._label(item.position.name, 15, 'primary', bold=True))
            cell.bind(on_release=self.show_result)
            grid.add_widget(cell)
        body.add_widget(grid)
        body.add_widget(self._button('Reveal reading', self.show_result, primary=True))
        body.add_widget(self._button('Shuffle again', self.perform_draw))

    def show_result(self, *_):
        body = self._scroll_page(
            self.current_spread.name,
            f'{deck_label(self.current_deck_mode)} · {focus_label(self.current_focus)}' + (f' · {self.current_question}' if self.current_question else ''),
        )
        for item in self.current_reading:
            card = Surface(
                theme=self.theme,
                orientation='vertical',
                size_hint_y=None,
                padding=dp(15),
                spacing=dp(7),
            )
            card.bind(minimum_height=card.setter('height'))
            card.add_widget(self._label(item.position.name.upper(), 12, 'secondary', bold=True))
            heading = BoxLayout(size_hint_y=None, height=dp(58), spacing=dp(8))
            heading.add_widget(self._symbol_widget(item.card, size=56, width=62))
            heading.add_widget(self._label(
                f'{item.card.name} · {orientation(item)}',
                21, 'primary', height=dp(54), bold=True,
            ))
            card.add_widget(heading)
            card.add_widget(self._label(item.position.prompt, 14, 'muted'))
            card.add_widget(self._label(' • '.join(card_keywords(item)), 14, 'secondary', bold=True))
            card.add_widget(self._label(card_meaning(item, self.current_focus), 15, 'text'))
            card.add_widget(self._label(f'[b]Yes / No / Maybe:[/b] {item.card.yes_no}', 14, 'text'))
            card.add_widget(self._label(f'[b]Guidance:[/b] {item.card.yes_no_advice}', 14, 'muted'))
            card.add_widget(self._label(f'[b]Element:[/b] {item.card.element}   [b]Astrology:[/b] {item.card.astrology}', 14, 'muted'))
            card.add_widget(self._label('[b]Symbolism:[/b] ' + ' • '.join(item.card.symbolism), 14, 'muted'))
            card.add_widget(self._label(f'Reflection: {item.card.reflection}', 14, 'muted'))
            body.add_widget(card)

        self.current_synthesis = synthesize(self.current_reading, self.current_focus, self.current_deck_mode, self.current_spread.id)
        body.add_widget(self._label('Reading pattern', 20, 'primary', bold=True))
        body.add_widget(self._label(self.current_synthesis, 15, 'text'))
        if self.current_focus == 'health':
            body.add_widget(self._label('Health focus is for reflection and habit-awareness only; it is not medical guidance.', 14, 'danger', bold=True))

        body.add_widget(self._label('How did this reading feel?', 20, 'primary', bold=True))
        grid = BoxLayout(orientation='vertical', size_hint_y=None, spacing=dp(7))
        grid.bind(minimum_height=grid.setter('height'))
        rows = [FEELINGS[i:i + 3] for i in range(0, len(FEELINGS), 3)]
        self.feeling_buttons = {}
        for feelings in rows:
            row = BoxLayout(size_hint_y=None, height=dp(44), spacing=dp(7))
            for feeling in feelings:
                pill = PillButton(text=feeling, theme=self.theme)
                pill.bind(on_release=partial(self.toggle_feeling, feeling))
                self.feeling_buttons[feeling] = pill
                row.add_widget(pill)
            grid.add_widget(row)
        body.add_widget(grid)

        body.add_widget(self._label('Journal notes', 20, 'primary', bold=True))
        self.notes_input = self._input(
            'What resonated? What felt wrong? What do you want to remember or do next?',
            multiline=True,
            height=150,
        )
        body.add_widget(self.notes_input)
        body.add_widget(self._button('Save to journal', self.save_current, primary=True))
        body.add_widget(self._button('Draw again', self.perform_draw))

    def toggle_feeling(self, feeling, button, *_):
        if feeling in self.selected_feelings:
            self.selected_feelings.remove(feeling)
            button.selected = 0
        else:
            self.selected_feelings.add(feeling)
            button.selected = 1

    def save_current(self, *_):
        self.db.save_reading(
            self.current_spread,
            self.current_question,
            self.notes_input.text,
            self.selected_feelings,
            self.current_reading,
            self.current_synthesis,
            self.current_deck_mode,
            self.current_focus,
        )
        popup = Popup(
            title='Saved',
            content=self._label('This reading is now in your private local journal.', 16),
            size_hint=(0.84, 0.3),
        )
        popup.open()

    def show_library(self, *_):
        body = self._scroll_page('Deck library', 'Browse tarot and oracle cards, including focus-specific meanings.')
        self.library_deck_mode = 'mixed'
        self.library_deck_spinner = Spinner(
            text='Mixed', values=list(DECK_OPTIONS.values()), size_hint_y=None, height=dp(50),
            background_normal='', background_color=get_color_from_hex(self.theme['surface_alt']),
            color=get_color_from_hex(self.theme['text']),
        )
        self.library_deck_spinner.bind(text=self.change_library_deck)
        body.add_widget(self.library_deck_spinner)
        self.library_search = self._input('Search by card, deck, suit, or keyword', multiline=False, height=50)
        self.library_search.bind(text=lambda *_: self.render_library())
        body.add_widget(self.library_search)

        self.library_container = BoxLayout(orientation='vertical', size_hint_y=None, spacing=dp(9))
        self.library_container.bind(minimum_height=self.library_container.setter('height'))
        body.add_widget(self.library_container)
        self.render_library()

    def change_library_deck(self, _spinner, label):
        reverse = {value: key for key, value in DECK_OPTIONS.items()}
        self.library_deck_mode = reverse.get(label, 'mixed')
        self.render_library()

    def render_library(self):
        if not hasattr(self, 'library_container'):
            return
        query = self.library_search.text.strip().lower()
        self.library_container.clear_widgets()
        matched = []
        library_cards = cards_for_deck(getattr(self, 'library_deck_mode', 'mixed'), self.tarot_cards, self.oracle_cards)
        for card in library_cards:
            haystack = ' '.join([
                card.name, card.deck_type, card.suit or '', *card.upright_keywords, *card.reversed_keywords
            ]).lower()
            if not query or query in haystack:
                matched.append(card)
        for card in matched:
            row = Surface(theme=self.theme, orientation='horizontal', size_hint_y=None,
                          height=dp(58), padding=[dp(6), dp(4)], spacing=dp(4))
            row.add_widget(self._symbol_widget(card, size=50, width=52))
            row.add_widget(self._button(f'{card.name} ({card.deck_type.title()})', partial(self.open_card, card), height=48))
            self.library_container.add_widget(row)

    def open_card(self, card, *_):
        content = BoxLayout(orientation='vertical', spacing=dp(10), padding=dp(12))
        scroll = ScrollView()
        body = BoxLayout(orientation='vertical', size_hint_y=None, spacing=dp(10))
        body.bind(minimum_height=body.setter('height'))
        title_row = BoxLayout(size_hint_y=None, height=dp(62), spacing=dp(8))
        title_row.add_widget(self._symbol_widget(card, size=60, width=68))
        title_row.add_widget(self._label(card.name, 24, 'primary', height=dp(58), bold=True))
        body.add_widget(title_row)
        body.add_widget(self._label(f'DECK · {card.deck_type.title()}', 13, 'secondary', bold=True))
        body.add_widget(self._label('UPRIGHT · ' + ' • '.join(card.upright_keywords), 13, 'secondary', bold=True))
        body.add_widget(self._label(card.upright_meaning, 15, 'text'))
        body.add_widget(self._label('REVERSED · ' + ' • '.join(card.reversed_keywords), 13, 'secondary', bold=True))
        body.add_widget(self._label(card.reversed_meaning, 15, 'text'))
        body.add_widget(self._label(f'[b]Yes / No / Maybe:[/b] {card.yes_no}', 14, 'text'))
        body.add_widget(self._label(f'[b]Guidance:[/b] {card.yes_no_advice}', 14, 'text'))
        body.add_widget(self._label(f'[b]Element:[/b] {card.element}', 14, 'muted'))
        body.add_widget(self._label(f'[b]Astrology:[/b] {card.astrology}', 14, 'muted'))
        body.add_widget(self._label('[b]Symbolism:[/b] ' + ' • '.join(card.symbolism), 14, 'text'))
        if card.context_meanings:
            body.add_widget(self._label('Focus meanings', 18, 'primary', bold=True))
            for key in ['love', 'work', 'spiritual', 'health']:
                context = card.context_meanings.get(key, {})
                if context:
                    body.add_widget(self._label(FOCUS_OPTIONS[key].upper(), 12, 'secondary', bold=True))
                    body.add_widget(self._label(context.get('upright', ''), 14, 'text'))
        body.add_widget(self._label('Reflection: ' + card.reflection, 15, 'muted'))
        scroll.add_widget(body)
        content.add_widget(scroll)
        popup = Popup(title='Card details', content=content, size_hint=(0.94, 0.88))
        popup.open()

    def show_history(self, *_):
        body = self._scroll_page('Journal', 'Saved readings are stored only on this device.')
        rows = self.db.recent_readings()
        if not rows:
            body.add_widget(self._label('No saved readings yet.', 16, 'muted'))
            return
        for row in rows:
            card = Surface(
                theme=self.theme,
                orientation='vertical',
                size_hint_y=None,
                padding=dp(14),
                spacing=dp(6),
            )
            card.bind(minimum_height=card.setter('height'))
            date = row['created_at'].replace('T', ' ')[:16]
            focus = row.get('focus', 'general').title()
            deck = row.get('deck_mode', 'tarot').title()
            card.add_widget(self._label(f"{row['spread_name']} · {deck} · {focus} · {date}", 18, 'primary', bold=True))
            if row['question']:
                card.add_widget(self._label(row['question'], 15, 'text'))
            cards = self.db.reading_cards(row['id'])
            card.add_widget(self._label(
                ' · '.join(c['card_name'] + (' ↩' if c['reversed'] else '') for c in cards),
                14,
                'muted',
            ))
            if row['feelings']:
                card.add_widget(self._label('Feeling: ' + ', '.join(row['feelings']), 14, 'secondary'))
            if row['notes']:
                card.add_widget(self._label(row['notes'], 14, 'text'))
            body.add_widget(card)

    def show_insights(self, *_):
        data = self.db.insight_data()
        body = self._scroll_page(
            'Insights',
            f"{data['total']} saved reading{'s' if data['total'] != 1 else ''}. Patterns become more useful as your journal grows.",
        )
        if not data['total']:
            body.add_widget(self._label('Save a few readings to begin seeing patterns.', 16, 'muted'))
            return
        sections = [
            ('Most frequent cards', data['top_cards']),
            ('Feeling tags', data['feelings']),
            ('Suit and Major Arcana mix', data['suits']),
            ('Orientation', data['orientations']),
            ('Readings by month', data['monthly']),
        ]
        for title, rows in sections:
            body.add_widget(self._label(title, 20, 'primary', bold=True))
            if not rows:
                body.add_widget(self._label('Not enough data yet.', 14, 'muted'))
                continue
            chart = BarChart(
                data=rows,
                theme=self.theme,
                size_hint_y=None,
                height=dp(max(130, 42 * len(rows))),
            )
            body.add_widget(chart)


if __name__ == '__main__':
    LanternTarotApp().run()
