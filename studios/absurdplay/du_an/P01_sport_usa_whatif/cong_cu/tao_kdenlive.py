"""Sinh file project Kdenlive (định dạng tài liệu 1.04, Kdenlive 23.08 mở và tự nâng cấp) từ một mô tả JSON.

Dùng: python3 tao_kdenlive.py <mo_ta.json> <ra.kdenlive>

mo_ta.json:
{
  "width": 1080, "height": 1920, "fps": 30,
  "tracks": [                       # thứ tự từ DƯỚI lên TRÊN; audio trước, video sau như Kdenlive
    {"type": "audio", "name": "Nhạc",  "clips": [{"file": "am_thanh/nhac.wav", "start": 0.0, "in": 0.0, "out": 75.0, "gain": 0.25}]},
    {"type": "audio", "name": "SFX",   "clips": [...]},
    {"type": "audio", "name": "Giọng", "clips": [...]},
    {"type": "video", "name": "Hình",  "clips": [{"file": "hinh/shot_01.mp4", "start": 0.0, "in": 0.0, "out": 2.4}]},
    {"type": "video", "name": "Đồ họa","clips": [...]}          # PNG/MOV có alpha, đè lên Hình
  ],
  "subtitles": "chu/phu_de.ass"      # tuỳ chọn: phụ đề ASS đốt lên toàn timeline (sửa được bằng file .ass)
}
Đường dẫn file: tương đối so với thư mục chứa file .kdenlive (thuộc tính root).
"""
import json, sys, os, subprocess
from xml.sax.saxutils import escape

spec = json.load(open(sys.argv[1])); out = sys.argv[2]
root = os.path.dirname(os.path.abspath(out))
W, H, FPS = spec.get('width', 1080), spec.get('height', 1920), spec.get('fps', 30)

def fr(t): return int(round(t * FPS))
def tc(f): return f"{f / FPS:.3f}"

def probe(path):
    p = os.path.join(root, path)
    try:
        d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).strip() or 0)
    except Exception:
        d = 0
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.png', '.jpg', '.jpeg'):
        return 'image', 100000.0
    if ext in ('.wav', '.mp3', '.flac', '.ogg', '.m4a'):
        return 'audio', d
    return 'av', d

X = []
X.append("<?xml version='1.0' encoding='utf-8'?>")
X.append(f'<mlt LC_NUMERIC="C" producer="main_bin" version="7.22.0" root="{escape(root)}">' if spec.get('absolute_root') else '<mlt LC_NUMERIC="C" producer="main_bin" version="7.22.0">')
X.append(f' <profile frame_rate_num="{FPS}" frame_rate_den="1" width="{W}" height="{H}" progressive="1" sample_aspect_num="1" sample_aspect_den="1" display_aspect_num="{W}" display_aspect_den="{H}" colorspace="709" description="{W}x{H} {FPS}fps"/>')

bin_ids = {}; bin_xml = []; next_id = [2]; pid = [0]
def producer_xml(path, kid, kind, length, extra=''):
    i = pid[0]; pid[0] += 1
    svc = 'qimage' if kind == 'image' else 'avformat-novalidate'
    ctype = {'image': 5, 'audio': 1, 'av': 0}[kind]
    L = fr(length) if kind != 'image' else 15000
    s = [f' <producer id="producer{i}" in="0" out="{max(L - 1, 0)}">',
         f'  <property name="length">{L}</property>', '  <property name="eof">pause</property>',
         f'  <property name="resource">{escape(path)}</property>', f'  <property name="mlt_service">{svc}</property>',
         f'  <property name="kdenlive:clip_type">{ctype}</property>', '  <property name="kdenlive:folderid">-1</property>',
         f'  <property name="kdenlive:id">{kid}</property>', extra, ' </producer>']
    return f'producer{i}', '\n'.join(x for x in s if x)

for tr in spec['tracks']:
    for c in tr['clips']:
        if c['file'] not in bin_ids:
            kind, length = probe(c['file'])
            kid = next_id[0]; next_id[0] += 1
            name, xml = producer_xml(c['file'], kid, kind, length)
            bin_ids[c['file']] = (kid, kind, length, name)
            bin_xml.append(xml)
X += bin_xml

total = 0
for tr in spec['tracks']:
    for c in tr['clips']:
        total = max(total, fr(c['start']) + fr(c['out']) - fr(c['in']))

X.append(' <playlist id="main_bin">')
props = {'version': '1.04', 'kdenliveversion': '23.08.5', 'documentid': '1730000000000', 'audioChannels': '2',
         'enableproxy': '0', 'zoom': '8', 'position': '0', 'activeTrack': '0'}
for k, v in props.items():
    X.append(f'  <property name="kdenlive:docproperties.{k}">{v}</property>')
X.append('  <property name="xml_retain">1</property>')
for f, (kid, kind, length, name) in bin_ids.items():
    X.append(f'  <entry producer="{name}" in="0" out="{max(fr(length) - 1, 0) if kind != "image" else 14999}"/>')
X.append(' </playlist>')
X.append(f' <producer id="black_track" in="0" out="{total - 1}"><property name="length">2147483647</property><property name="eof">continue</property><property name="resource">black</property><property name="mlt_service">color</property><property name="mlt_image_format">rgba</property><property name="set.test_audio">0</property></producer>')

track_ids = []; pl = [0]
for ti, tr in enumerate(spec['tracks']):
    is_audio = tr['type'] == 'audio'
    a_id = f'playlist{pl[0]}'; b_id = f'playlist{pl[0] + 1}'; pl[0] += 2
    # timeline producers (copies of bin clips)
    entries = []; cursor = 0
    for c in sorted(tr['clips'], key=lambda c: c['start']):
        kid, kind, length, _ = bin_ids[c['file']]
        extra = '  <property name="set.test_audio">0</property>\n  <property name="set.test_image">1</property>' if is_audio else \
                ('  <property name="set.test_audio">1</property>\n  <property name="set.test_image">0</property>' if kind == 'av' else '')
        name, xml = producer_xml(c['file'], kid, kind, length, extra)
        X.append(xml)
        s, i_, o = fr(c['start']), fr(c['in']), fr(c['out'])
        if s > cursor:
            entries.append(f'  <blank length="{s - cursor}"/>')
        flt = ''
        if 'gain' in c:
            flt = f'<filter><property name="mlt_service">volume</property><property name="kdenlive_id">volume</property><property name="level">{20 * __import__("math").log10(max(c["gain"], 1e-4)):.2f}</property></filter>'
        entries.append(f'  <entry producer="{name}" in="{i_}" out="{o - 1}"><property name="kdenlive:id">{kid}</property>{flt}</entry>')
        cursor = s + (o - i_)
    at = '  <property name="kdenlive:audio_track">1</property>\n' if is_audio else ''
    X.append(f' <playlist id="{a_id}">\n{at}' + '\n'.join(entries) + '\n </playlist>')
    X.append(f' <playlist id="{b_id}">\n{at} </playlist>')
    hide = 'video' if is_audio else 'audio'
    X.append(f' <tractor id="tractor{ti}" in="0" out="{total - 1}">\n{at}  <property name="kdenlive:track_name">{escape(tr.get("name", ""))}</property>\n  <property name="kdenlive:trackheight">67</property>\n  <property name="kdenlive:timeline_active">1</property>\n  <track hide="{hide}" producer="{a_id}"/>\n  <track hide="{hide}" producer="{b_id}"/>\n </tractor>')
    track_ids.append((f'tractor{ti}', is_audio))

X.append(f' <tractor id="tractor{len(track_ids)}" in="0" out="{total - 1}">')
X.append('  <track producer="black_track"/>')
for tid, _ in track_ids:
    X.append(f'  <track producer="{tid}"/>')
for n, (tid, is_audio) in enumerate(track_ids, start=1):
    if is_audio:
        X.append(f'  <transition><property name="a_track">0</property><property name="b_track">{n}</property><property name="mlt_service">mix</property><property name="kdenlive_id">mix</property><property name="internal_added">237</property><property name="always_active">1</property><property name="accepts_blanks">1</property><property name="sum">1</property></transition>')
    else:
        X.append(f'  <transition><property name="a_track">0</property><property name="b_track">{n}</property><property name="version">0.1</property><property name="mlt_service">frei0r.cairoblend</property><property name="kdenlive_id">frei0r.cairoblend</property><property name="internal_added">237</property><property name="always_active">1</property></transition>')
if spec.get('subtitles'):
    X.append(f'  <filter><property name="mlt_service">avfilter.subtitles</property><property name="internal_added">237</property><property name="av.filename">{escape(os.path.join(root, spec["subtitles"]) if spec.get('absolute_root') else spec["subtitles"])}</property></filter>')
X.append(' </tractor>')
X.append('</mlt>')
open(out, 'w').write('\n'.join(X))
print('OK', out, 'tracks', len(track_ids), 'clips', sum(len(t['clips']) for t in spec['tracks']), 'frames', total)
