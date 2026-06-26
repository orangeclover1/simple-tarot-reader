[app]
title = Lantern Tarot
package.name = journal
package.domain = com.lanterntarot
source.dir = .
source.include_exts = py,json,txt,md,png,jpg,ttf,otf
source.exclude_dirs = .git,.github,.venv,venv,__pycache__,bin,.buildozer,tests
version.regex = __version__ = ['"](.*)['"]
version.filename = %(source.dir)s/main.py
requirements = python3,kivy==2.3.1
orientation = portrait
fullscreen = 0
icon.filename = tarot_journal/assets/app_icon_pixel.png
presplash.filename = tarot_journal/assets/app_icon_pixel.png

# Android packaging
android.api = 35
android.minapi = 24
android.ndk_api = 24
android.archs = arm64-v8a
android.private_storage = True
android.permissions =
android.accept_sdk_license = True
android.release_artifact = aab
android.debug_artifact = apk
android.logcat_filters = *:S python:D
android.presplash_color = #0B0E14

# Keep the standard SDL2 bootstrap used by Kivy.
p4a.bootstrap = sdl2

[buildozer]
log_level = 2
warn_on_root = 1
