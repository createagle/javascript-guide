#!/usr/bin/env python3
"""Regenerate the root index.html from each chapter's README.md demo table.

Run after adding or renaming a demo:  python3 tools/build_index.py
A demo row in chapters/<dir>/README.md looks like:
| 2-1 Type inspector | [01-typeof.html](https://createagle.github.io/javascript-guide/chapters/02-values-types/01-typeof.html) | ... |
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

PARTS = [
    ('Part 1 · Language Basics', [
        ('01-intro', 'Meet JavaScript'),
        ('02-values-types', 'Values, Variables & Types'),
        ('03-operators', 'Operators & Type Conversion'),
        ('04-control-flow', 'Control Flow'),
        ('05-functions', 'Functions'),
        ('06-objects', 'Objects'),
        ('07-arrays', 'Arrays'),
        ('08-strings-regex', 'Strings & Regular Expressions'),
    ]),
    ('Part 2 · The Language in Depth', [
        ('09-scope-closures', 'Scope & Closures'),
        ('10-this', 'this & Function Calls'),
        ('11-prototypes', 'Prototypes & Inheritance'),
        ('12-classes', 'Classes'),
        ('13-iterators-generators', 'Iterators & Generators'),
        ('14-collections', 'Map, Set & Weak References'),
        ('15-metaprogramming', 'Symbol, Proxy & Reflect'),
        ('16-numbers-dates-intl', 'Numbers, Dates & Intl'),
    ]),
    ('Part 3 · Async & Modules', [
        ('17-errors', 'Error Handling'),
        ('18-event-loop', 'The Event Loop'),
        ('19-promises', 'Promises'),
        ('20-async-await', 'async/await'),
        ('21-modules', 'Modules'),
        ('22-fetch', 'Network Requests'),
        ('23-workers', 'Web Workers & Concurrency'),
        ('24-binary-streams', 'Binary Data & Streams'),
    ]),
    ('Part 4 · The Browser', [
        ('25-dom', 'DOM Basics'),
        ('26-dom-manipulation', 'Changing the DOM'),
        ('27-events', 'Events'),
        ('28-forms', 'Forms & User Input'),
        ('29-storage', 'Browser Storage'),
        ('30-observers', 'Observers & Rendering Timing'),
        ('31-canvas-animation', 'Canvas & Animation'),
        ('32-web-components', 'Web Components'),
    ]),
    ('Part 5 · Engineering & Practice', [
        ('33-debugging', 'Debugging & DevTools'),
        ('34-testing', 'Testing'),
        ('35-performance', 'Performance'),
        ('36-security', 'Security'),
        ('37-tooling', 'Tooling & Node.js'),
        ('38-patterns', 'Design Patterns & Architecture'),
        ('39-capstone', 'Capstone Project'),
        ('40-future', 'Resources & the Future'),
    ]),
]

ROW = re.compile(r'^\|\s*(\d+-\d+)\s+(.+?)\s*\|\s*\[([^\]]+?\.html)\]')


def demos(slug):
    readme = ROOT / 'chapters' / slug / 'README.md'
    if not readme.exists():
        return []
    out = []
    for line in readme.read_text(encoding='utf-8').splitlines():
        m = ROW.match(line)
        if m:
            out.append((m.group(1), m.group(2), f'chapters/{slug}/{m.group(3)}'))
    return out


def main():
    parts = []
    n = 0
    for title, chapters in PARTS:
        first, last = n + 1, n + len(chapters)
        items = []
        for slug, name in chapters:
            n += 1
            links = ' · '.join(f'<a href="{html.escape(href)}">{num} {html.escape(label)}</a>' for num, label, href in demos(slug))
            ex = f'\n      <div class="examples">{links}</div>' if links else '\n      <div class="examples">Coming soon</div>'
            items.append(f'    <li>{n}. {html.escape(name)}{ex}\n    </li>')
        parts.append(f'  <h2>{html.escape(title)} (Ch. {first}–{last})</h2>\n  <ul class="chapters">\n' + '\n'.join(items) + '\n  </ul>')
    page = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JavaScript Complete Guide · Demos</title>
  <meta name="description" content="Runnable demos for the JavaScript Complete Guide, 5 parts and 40 chapters.">
  <script src="assets/demo.js"></script>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main>
  <h1>JavaScript Complete Guide · Demos</h1>
  <p>Every demo runs in the browser: edit the code and press <b>Run</b>. <a href="https://github.com/createagle/javascript-guide">Source on GitHub</a></p>

{chr(10).join(parts)}
</main>
</body>
</html>
'''
    (ROOT / 'index.html').write_text(page, encoding='utf-8')
    print('index.html written')


if __name__ == '__main__':
    main()
