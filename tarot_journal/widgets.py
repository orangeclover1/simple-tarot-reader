from kivy.graphics import Color, Line, Rectangle, RoundedRectangle
from kivy.metrics import dp
from kivy.properties import DictProperty, ListProperty, NumericProperty, StringProperty
from kivy.uix.behaviors import ButtonBehavior
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.widget import Widget
from kivy.utils import get_color_from_hex


class Surface(BoxLayout):
    theme = DictProperty({})
    radius = NumericProperty(dp(18))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        with self.canvas.before:
            self._fill_color = Color(1, 1, 1, 1)
            self._rect = RoundedRectangle(pos=self.pos, size=self.size, radius=[self.radius])
        with self.canvas.after:
            self._border_color = Color(1, 1, 1, 1)
            self._border = Line(rounded_rectangle=(0, 0, 0, 0, self.radius), width=1.1)
        self.bind(pos=self._sync, size=self._sync, theme=self._apply_theme, radius=self._sync)
        self._apply_theme()

    def _sync(self, *_):
        self._rect.pos = self.pos
        self._rect.size = self.size
        self._rect.radius = [self.radius]
        self._border.rounded_rectangle = (self.x, self.y, self.width, self.height, float(self.radius))

    def _apply_theme(self, *_):
        if self.theme:
            self._fill_color.rgba = get_color_from_hex(self.theme['surface'])
            self._border_color.rgba = get_color_from_hex(self.theme.get('border', self.theme['primary']))


class ClickableSurface(ButtonBehavior, Surface):
    """A normal themed surface that also responds to taps/clicks."""
    pass


class WrappedLabel(Label):
    def __init__(self, **kwargs):
        kwargs.setdefault('halign', 'left')
        kwargs.setdefault('valign', 'top')
        super().__init__(**kwargs)
        self.bind(width=self._update_text_size, texture_size=self._update_height)
        self._update_text_size()

    def _update_text_size(self, *_):
        self.text_size = (max(0, self.width), None)

    def _update_height(self, *_):
        self.height = self.texture_size[1] + dp(8)


PIXEL_PATTERNS = {
    'star': ["00100","10101","01110","11111","01110","10101","00100"],
    'moon': ["01110","11100","11000","11000","11000","11100","01110"],
    'sun': ["10101","01110","11011","11111","11011","01110","10101"],
    'heart': ["0110110","1111111","1111111","0111110","0011100","0001000"],
    'leaf': ["00100","01110","11111","11110","11100","11000","10000"],
    'crown': ["10001","11011","11111","01110","01110"],
    'book': ["1110111","1010101","1010101","1010101","1110111"],
    'arrow': ["00100","01100","11111","01100","00100"],
    'lion': ["01110","10101","11111","10101","01110"],
    'lantern': ["00100","01110","11111","10101","11111","01110","00100"],
    'wheel': ["01110","11011","10101","11011","01110"],
    'scales': ["00100","11111","10101","01010","10101"],
    'hanged': ["11111","00100","00100","01110","10101"],
    'butterfly': ["11011","11111","01110","11111","11011"],
    'cup': ["10001","10001","11111","01110","00100","01110"],
    'chain': ["01100","10010","01100","00110","01001","00110"],
    'bolt': ["00110","01100","11110","00110","01100","11000"],
    'bell': ["00100","01110","11111","11111","01110","00100"],
    'world': ["01110","11011","10101","11011","01110"],
    'wand': ["00100","00100","00100","00100","01110","00100"],
    'sword': ["00100","00100","00100","11111","00100","00100","00100"],
    'coin': ["01110","11011","10101","11011","01110"],
    'eye': ["01110","10001","10101","10001","01110"],
    'key': ["01100","10010","01100","00100","00111","00100"],
    'wave': ["00000","10010","10101","01001","00000"],
    'door': ["11111","10001","10001","10101","10001","11111"],
    'wing': ["00111","01110","11100","01110","00111"],
    'tree': ["00100","01110","11111","00100","00100","01110"],
    'flame': ["00100","01100","01110","11111","01110","00100"],
    'ice': ["10101","01110","11111","01110","10101"],
    'potion': ["01110","00100","01110","11111","10101","11111","01110"],
    'spiral': ["11110","10000","10110","10100","10111","00001","11111"],
}


class PixelGlyph(Widget):
    glyph_key = StringProperty('star')
    theme = DictProperty({})
    pixel_size = NumericProperty(dp(5))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bind(glyph_key=self.redraw, theme=self.redraw, pos=self.redraw, size=self.redraw)

    def redraw(self, *_):
        self.canvas.clear()
        pattern = PIXEL_PATTERNS.get(self.glyph_key, PIXEL_PATTERNS['star'])
        rows = len(pattern); cols = max(len(r) for r in pattern)
        cell = min(self.width / max(cols,1), self.height / max(rows,1))
        cell = max(1, int(cell))
        ox = self.x + (self.width - cols * cell) / 2
        oy = self.y + (self.height - rows * cell) / 2
        color = self.theme.get('secondary', '#FFFFFF') if self.theme else '#FFFFFF'
        with self.canvas:
            Color(*get_color_from_hex(color))
            for r, line in enumerate(pattern):
                for c, bit in enumerate(line):
                    if bit == '1':
                        Rectangle(pos=(ox+c*cell, oy+(rows-1-r)*cell), size=(cell, cell))


class CardSymbol(BoxLayout):
    glyph_key = StringProperty('star')
    rank = StringProperty('')
    theme = DictProperty({})

    def __init__(self, **kwargs):
        kwargs.setdefault('orientation', 'vertical')
        kwargs.setdefault('spacing', dp(1))
        super().__init__(**kwargs)
        self.glyph = PixelGlyph(glyph_key=self.glyph_key, theme=self.theme)
        self.rank_label = Label(text=self.rank, font_name='Roboto', font_size='12sp', size_hint_y=None, height=dp(18))
        self.add_widget(self.glyph)
        self.add_widget(self.rank_label)
        self.bind(glyph_key=lambda *_: setattr(self.glyph, 'glyph_key', self.glyph_key))
        self.bind(rank=lambda *_: setattr(self.rank_label, 'text', self.rank))
        self.bind(theme=self._theme)
        self._theme()

    def _theme(self, *_):
        if self.theme:
            self.glyph.theme = self.theme
            self.rank_label.color = get_color_from_hex(self.theme['secondary'])


class PillButton(Button):
    selected = NumericProperty(0)
    theme = DictProperty({})

    def __init__(self, **kwargs):
        kwargs.setdefault('size_hint_y', None)
        kwargs.setdefault('height', dp(42))
        kwargs.setdefault('background_normal', '')
        kwargs.setdefault('background_down', '')
        super().__init__(**kwargs)
        self.bind(theme=self._apply, selected=self._apply)
        self._apply()

    def _apply(self, *_):
        if not self.theme:
            return
        self.background_color = get_color_from_hex(self.theme['secondary'] if self.selected else self.theme['surface_alt'])
        self.color = get_color_from_hex(self.theme['text'])


class BarChart(Widget):
    data = ListProperty([])
    theme = DictProperty({})
    max_bars = NumericProperty(10)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bind(data=self.redraw, theme=self.redraw, pos=self.redraw, size=self.redraw)

    def redraw(self, *_):
        self.canvas.clear()
        if not self.data or not self.theme or self.width <= 1:
            return
        values = [max(0, float(item['value'])) for item in self.data[:self.max_bars]]
        maximum = max(values) if values else 1
        row_h = max(dp(34), self.height / max(1, len(values)))
        label_w = min(dp(150), self.width * 0.42)
        self.clear_widgets()
        with self.canvas:
            for index, item in enumerate(self.data[:self.max_bars]):
                y = self.top - (index + 1) * row_h + dp(7)
                Color(*get_color_from_hex(self.theme['surface_alt']))
                RoundedRectangle(pos=(self.x + label_w, y), size=(max(dp(8), self.width-label_w-dp(34)), row_h-dp(14)), radius=[dp(8)])
                ratio = float(item['value']) / maximum if maximum else 0
                Color(*get_color_from_hex(self.theme['primary']))
                RoundedRectangle(pos=(self.x + label_w, y), size=(max(dp(3), (self.width-label_w-dp(34))*ratio), row_h-dp(14)), radius=[dp(8)])
        for index, item in enumerate(self.data[:self.max_bars]):
            y = self.top - (index + 1) * row_h
            self.add_widget(Label(text=str(item['label']).title(), color=get_color_from_hex(self.theme['text']), halign='left', valign='middle', text_size=(label_w-dp(8), row_h), size_hint=(None,None), size=(label_w-dp(8),row_h), pos=(self.x,y), font_size='13sp'))
            self.add_widget(Label(text=str(item['value']), color=get_color_from_hex(self.theme['muted']), size_hint=(None,None), size=(dp(30),row_h), pos=(self.right-dp(30),y), font_size='12sp'))
