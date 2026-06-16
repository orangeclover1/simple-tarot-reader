[app]
title = Lantern Tarot
package.name = lanterntarot
package.domain = org.example
source.dir = .
source.include_exts = py,json,txt,md,png,ttf,otf
version = 0.4.0
icon.filename = tarot_journal/assets/app_icon_pixel.png
requirements = python3,kivy==2.3.1
orientation = portrait
fullscreen = 0
android.archs = arm64-v8a, armeabi-v7a
android.api = 35
android.minapi = 24
android.permissions =
presplash.color = #15121F

[buildozer]
log_level = 2
warn_on_root = 1
