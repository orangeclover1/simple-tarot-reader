from kivy.graphics import Color, Line, RoundedRectangle
from kivy.metrics import dp
from kivy.properties import DictProperty, ListProperty, NumericProperty
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
        self._border.rounded_rectangle = (
            self.x, self.y, self.width, self.height, float(self.radius)
        )

    def _apply_theme(self, *_):
        if self.theme:
            self._fill_color.rgba = get_color_from_hex(self.theme['surface'])
            self._border_color.rgba = get_color_from_hex(self.theme.get('border', self.theme['primary']))


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
        self.background_color = get_color_from_hex(
            self.theme['secondary'] if self.selected else self.theme['surface_alt']
        )
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
                RoundedRectangle(
                    pos=(self.x + label_w, y),
                    size=(max(dp(8), self.width - label_w - dp(34)), row_h - dp(14)),
                    radius=[dp(8)],
                )
                ratio = float(item['value']) / maximum if maximum else 0
                Color(*get_color_from_hex(self.theme['primary']))
                RoundedRectangle(
                    pos=(self.x + label_w, y),
                    size=(max(dp(3), (self.width - label_w - dp(34)) * ratio), row_h - dp(14)),
                    radius=[dp(8)],
                )

        for index, item in enumerate(self.data[:self.max_bars]):
            y = self.top - (index + 1) * row_h
            label = Label(
                text=str(item['label']).title(),
                color=get_color_from_hex(self.theme['text']),
                halign='left',
                valign='middle',
                text_size=(label_w - dp(8), row_h),
                size_hint=(None, None),
                size=(label_w - dp(8), row_h),
                pos=(self.x, y),
                font_size='13sp',
            )
            value = Label(
                text=str(item['value']),
                color=get_color_from_hex(self.theme['muted']),
                size_hint=(None, None),
                size=(dp(30), row_h),
                pos=(self.right - dp(30), y),
                font_size='12sp',
            )
            self.add_widget(label)
            self.add_widget(value)
