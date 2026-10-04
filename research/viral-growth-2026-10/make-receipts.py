"""Render three editable, source-bounded LinkedIn cards as SVG.

Run from this directory, then use rsvg-convert to produce 1200px PNGs.
"""
from pathlib import Path
from html import escape

OUT = Path(__file__).parent / 'assets'
OUT.mkdir(exist_ok=True)

INK = '#181715'
CREAM = '#f5f0e7'
MUTED = '#ada89f'
MARIGOLD = '#ffc451'

def text(x, y, value, size=36, color=CREAM, weight=600, extra=''):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="DM Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" {extra}>{escape(value)}</text>'

def shell(kicker, title, subtitle, accent, body, footer):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<rect width="1200" height="1200" fill="{INK}"/>
<rect x="50" y="50" width="1100" height="1100" rx="24" fill="none" stroke="#48443e" stroke-width="2"/>
<rect x="85" y="88" width="58" height="58" rx="13" fill="{accent}"/>
{text(95,129,'An',34,INK,800)}
{text(163,127,'ankur.works',31,CREAM,800)}
{text(85,212,kicker.upper(),25,accent,800,'letter-spacing="4"')}
{text(85,319,title,72,CREAM,800)}
{text(85,374,subtitle,28,MUTED,500)}
<line x1="85" y1="417" x2="1115" y2="417" stroke="#48443e" stroke-width="2"/>
{body}
<line x1="85" y1="1024" x2="1115" y2="1024" stroke="#48443e" stroke-width="2"/>
{text(85,1069,footer,21,MUTED,500)}
{text(1115,1112,'BUILD / SHIP / REPEAT',19,accent,800,'text-anchor="end" letter-spacing="2"')}
</svg>'''

# QuoteSweep: the displayed point coordinates are linearly mapped from the
# exact Search Console complete-month click counts, not hand-shaped.
clicks = [96, 130, 368, 716, 988]
months = ['APR', 'MAY', 'JUN', 'JUL', 'AUG']
xs = [130, 365, 600, 835, 1070]
ys = [880 - (v - 96) / (988 - 96) * 355 for v in clicks]
points = ' '.join(f'{x},{y:.1f}' for x,y in zip(xs,ys))
quote = '<rect x="85" y="453" width="1030" height="516" rx="20" fill="#242220"/>'
quote += text(125,528,'+929%',80,MARIGOLD,800)
quote += text(468,524,'Google clicks',42,CREAM,700)
quote += text(469,564,'April to August 2026',27,MUTED,500)
for gy in [640, 770, 900]:
    quote += f'<line x1="125" y1="{gy}" x2="1075" y2="{gy}" stroke="#55504a" stroke-dasharray="5 8"/>'
quote += f'<polyline points="{points}" fill="none" stroke="{MARIGOLD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
for x,y,v,m in zip(xs,ys,clicks,months):
    quote += f'<circle cx="{x}" cy="{y:.1f}" r="12" fill="{MARIGOLD}"/>'
    quote += text(x, y-27, f'{v:,}', 25, CREAM, 800, 'text-anchor="middle"')
    quote += text(x, 945, m, 22, MUTED, 700, 'text-anchor="middle" letter-spacing="2"')
(OUT / '01-quotesweep-clicks.svg').write_text(shell(
    'The receipt / 01 / QuoteSweep', 'A closed beta, found.',
    'A product can be discoverable before launch day.', MARIGOLD,
    quote, 'Source: Google Search Console · Web search · complete months · 96 → 988 clicks'))

pepys = '<rect x="85" y="453" width="1030" height="516" rx="20" fill="#302b63"/>'
pepys += text(125,540,'8.6×',92,'#e5d5ff',800)
pepys += text(474,532,'ChatGPT-referred sessions',36,CREAM,700)
pepys += text(474,574,'September versus July 2026',27,'#c4bde0',500)
bars = [(145,190,'JUL'),(473,948,'AUG'),(801,1637,'SEP')]
for x,v,m in bars:
    h=250*v/1637
    pepys += f'<rect x="{x}" y="{884-h:.1f}" width="235" height="{h:.1f}" rx="12" fill="#d7c5f0"/>'
    pepys += text(x+118, 869-h, f'{v:,}', 30, CREAM, 800, 'text-anchor="middle"')
    pepys += text(x+118, 933, m, 24, '#c4bde0', 700, 'text-anchor="middle" letter-spacing="2"')
(OUT / '02-pepys-referrals.svg').write_text(shell(
    'The receipt / 02 / Pepys', 'A visit is not a citation.',
    'Measure AI appearances, referrals and product use separately.', '#d7c5f0',
    pepys, 'Source: PostHog · pepys.co entry · ChatGPT referrer · pageview sessions · UTC'))

scope = '<rect x="85" y="453" width="1030" height="516" rx="20" fill="#ffc451"/>'
scope += text(127,520,'THE FIRST-RELEASE SCOPE CARD',26,INK,800,'letter-spacing="2"')
rows = [
    ('01', 'First user', 'Who has the problem today?'),
    ('02', 'Core job', 'What must they finish?'),
    ('03', 'Success signal', 'What proves it worked?'),
    ('04', 'Not yet', 'What can wait until later?'),
]
for i,(n,label,question) in enumerate(rows):
    y=595+i*91
    scope += f'<line x1="127" y1="{y+48}" x2="1071" y2="{y+48}" stroke="#1c1b18" stroke-opacity=".3"/>'
    scope += text(127,y,n,24,INK,800)
    scope += text(203,y,label,34,INK,800)
    scope += text(550,y,question,27,INK,500)
(OUT / '03-mvp-scope.svg').write_text(shell(
    'The receipt / 03 / MVP scope', 'Cut before you code.',
    'Four questions that make a first release smaller and clearer.', MARIGOLD,
    scope, 'Worksheet, not a price estimate · fill it in with your cofounder or team'))

print(f'Wrote {len(list(OUT.glob("*.svg")))} SVG cards to {OUT}')
