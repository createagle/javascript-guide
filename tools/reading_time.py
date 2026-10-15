#!/usr/bin/env python3
"""估算一章教程的阅读时长。

输入：Claude Docs 导出的某一章 Markdown（export format=markdown）。
      传 --b64 时输入是导出结果里的 base64 字符串。
输出：每个二级标题小节的统计和分钟数，以及全章合计。

估算标准（与 CLAUDE.md 一致）：
  正文   400 字/分钟（汉字按字计，英文单词和数字按 1 个字计）
  代码   10 行/分钟（代码块里的非空行）
  表格   3 行/分钟（不含表头和分隔行）
  图     每张 0.5 分钟（导出里的 embedded content 占位；「练习」节里的嵌入是折叠的参考答案，不计）
  演示   每个 1 分钟（「在线演示」链接）
每节向上取整、至少 1 分钟；全章 = 各节之和（章标题前的导语并入第一节）。
"""
import argparse
import base64
import math
import re
import sys

CJK = re.compile(r'[㐀-䶿一-鿿豈-﫿]')
WORD = re.compile(r'[A-Za-z0-9][A-Za-z0-9_.\-:#/]*')
LINK = re.compile(r'\[([^\]]*)\]\([^)]*\)')


def prose_units(line):
    line = LINK.sub(r'\1', line)
    line = re.sub(r'&#\d+;|&[a-z]+;', ' ', line)
    line = re.sub(r'[*_`>#|]', ' ', line)
    return len(CJK.findall(line)) + len(WORD.findall(CJK.sub(' ', line)))


def sections(md):
    current = {'title': '（导语）', 'prose': 0, 'code': 0, 'rows': 0, 'figures': 0, 'demos': 0}
    out = [current]
    in_code = False
    table_line = 0
    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            if line.strip():
                current['code'] += 1
            continue
        if line.startswith('# ') or line.startswith('*全章阅读约'):
            continue
        if line.startswith('## '):
            current = {'title': line[3:].strip(), 'prose': 0, 'code': 0, 'rows': 0, 'figures': 0, 'demos': 0}
            out.append(current)
            table_line = 0
            continue
        if line.startswith('|'):
            table_line += 1
            if table_line > 2:          # 跳过表头和分隔行
                current['rows'] += 1
            continue
        table_line = 0
        if 'embedded content' in line:
            if '练习' not in current['title']:
                current['figures'] += 1
            continue
        current['demos'] += line.count('[在线演示](')
        current['prose'] += prose_units(line)
    # 导语并入第一节
    if len(out) > 1:
        intro = out.pop(0)
        for k in ('prose', 'code', 'rows', 'figures', 'demos'):
            out[0][k] += intro[k]
    return out


def minutes(s):
    raw = s['prose'] / 400 + s['code'] / 10 + s['rows'] / 3 + s['figures'] * 0.5 + s['demos'] * 1
    return raw, max(1, math.ceil(raw))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file', help='Markdown 文件，或 --b64 时的 base64 文件；- 表示标准输入')
    ap.add_argument('--b64', action='store_true', help='输入是 base64')
    args = ap.parse_args()
    data = sys.stdin.read() if args.file == '-' else open(args.file, encoding='utf-8').read()
    md = base64.b64decode(''.join(data.split())).decode('utf-8', errors='replace') if args.b64 else data

    total = 0
    print(f'{"小节":<28}{"正文字":>6}{"代码行":>6}{"表格行":>6}{"图":>4}{"演示":>5}{"估算":>8}{"取整":>5}')
    for s in sections(md):
        raw, m = minutes(s)
        total += m
        print(f'{s["title"][:26]:<28}{s["prose"]:>6}{s["code"]:>6}{s["rows"]:>6}{s["figures"]:>4}{s["demos"]:>5}{raw:>8.2f}{m:>5}')
    print(f'全章阅读约 {total} 分钟')


if __name__ == '__main__':
    main()
