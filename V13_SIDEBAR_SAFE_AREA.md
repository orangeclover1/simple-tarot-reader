# Lantern Tarot v13 Sidebar + Safe Area UI

This build replaces the top nav with a left sidebar rail to avoid both Android system areas:

- Status bar / clock / battery at the top
- Gesture/home navigation at the bottom

## Changes

- Main layout is horizontal: sidebar rail on the left, content on the right.
- Sidebar has extra top and bottom padding.
- Scroll pages have more top padding and a larger bottom spacer.
- Buttons use a new `RoundedButton` widget with rounded corners and themed borders.
- Surfaces are rounder by default.
- Nav labels are shortened for phone width: Home, Read, Decks, Log, Stats.
