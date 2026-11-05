"""Generate an editable Kdenlive (MLT XML) project: video track + captions + 3 audio stems."""
import os, subprocess, sys
D = os.path.abspath(os.environ.get('EP', os.getcwd())); out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'deliver', os.environ.get('NAME', 'RickClips_video') + '.kdenlive')
FPS = 30
def frames(path):
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    return int(round(d * FPS))
rel = lambda p: os.path.relpath(p, os.path.dirname(out))
V = os.path.join(os.path.dirname(out), 'media', 'video_clean.mp4')
A = {k: os.path.join(os.path.dirname(out), 'media', f) for k, f in [('voice', 'voice.wav'), ('music', 'music_ducked.wav'), ('sfx', 'sfx.wav')]}
SUB = os.path.join(os.path.dirname(out), 'media', 'captions.ass')
L = frames(V); LA = {k: frames(p) for k, p in A.items()}
# profile = size of the rendered video (kit v4 hard-coded 720x1280; v5 episodes are 1080x1920); master gain from env GAIN (finalize.sh measures it)
VW, VH = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'default=nw=1:nk=1', V], capture_output=True, text=True).stdout.split()[:2])
PROF = f'{VW}x{VH} 30fps'; GAIN = os.environ.get('GAIN', '1.245')
def producer(pid, path, n, extra=''):
    return f'''  <producer id="{pid}" in="0" out="{n - 1}">
    <property name="length">{n}</property>
    <property name="resource">{rel(path)}</property>
    <property name="mlt_service">avformat-novalidate</property>
    <property name="kdenlive:clipname">{os.path.basename(path)}</property>
    <property name="kdenlive:id">{pid[1:]}</property>{extra}
  </producer>'''
x = [f'''<?xml version='1.0' encoding='utf-8'?>
<mlt LC_NUMERIC="C" version="7.0.0" root="{os.path.dirname(out)}">
  <profile description="{PROF}" width="{VW}" height="{VH}" progressive="1" sample_aspect_num="1" sample_aspect_den="1" display_aspect_num="9" display_aspect_den="16" frame_rate_num="30" frame_rate_den="1" colorspace="709"/>''']
x.append(producer('p2', V, L))
x.append(producer('p3', A['voice'], LA['voice'])); x.append(producer('p4', A['music'], LA['music'])); x.append(producer('p5', A['sfx'], LA['sfx']))
x.append(f'''  <playlist id="main_bin">
    <property name="kdenlive:docproperties.version">1.1</property>
    <property name="kdenlive:docproperties.profile">{PROF}</property>
    <property name="xml_retain">1</property>
    <entry producer="p2" in="0" out="{L - 1}"/>
    <entry producer="p3" in="0" out="{LA['voice'] - 1}"/>
    <entry producer="p4" in="0" out="{LA['music'] - 1}"/>
    <entry producer="p5" in="0" out="{LA['sfx'] - 1}"/>
  </playlist>
  <playlist id="pl_video"><property name="kdenlive:track_name">Picture</property><entry producer="p2" in="0" out="{L - 1}"/></playlist>
  <playlist id="pl_voice"><property name="kdenlive:track_name">Voice RickClips</property><property name="kdenlive:audio_track">1</property><entry producer="p3" in="0" out="{LA['voice'] - 1}"/></playlist>
  <playlist id="pl_music"><property name="kdenlive:track_name">Music (ducked)</property><property name="kdenlive:audio_track">1</property><entry producer="p4" in="0" out="{LA['music'] - 1}"/></playlist>
  <playlist id="pl_sfx"><property name="kdenlive:track_name">SFX</property><property name="kdenlive:audio_track">1</property><entry producer="p5" in="0" out="{LA['sfx'] - 1}"/></playlist>
  <tractor id="maintractor" in="0" out="{L - 1}">
    <property name="kdenlive:projectTractor">1</property>
    <track producer="pl_video"/>
    <track producer="pl_voice" hide="video"/>
    <track producer="pl_music" hide="video"/>
    <track producer="pl_sfx" hide="video"/>
    <transition id="mix1"><property name="a_track">0</property><property name="b_track">1</property><property name="mlt_service">mix</property><property name="always_active">1</property><property name="sum">1</property></transition>
    <transition id="mix2"><property name="a_track">0</property><property name="b_track">2</property><property name="mlt_service">mix</property><property name="always_active">1</property><property name="sum">1</property></transition>
    <transition id="mix3"><property name="a_track">0</property><property name="b_track">3</property><property name="mlt_service">mix</property><property name="always_active">1</property><property name="sum">1</property></transition>
    <filter id="subs"><property name="mlt_service">avfilter.subtitles</property><property name="av.filename">{rel(SUB)}</property><property name="av.fontsdir">{os.path.join(os.path.dirname(rel(SUB)) or ".", "fonts")}</property><property name="kdenlive:filter_name">Captions (ASS)</property></filter>
    <filter id="master"><property name="mlt_service">volume</property><property name="gain">{GAIN}</property><property name="limiter">-1</property></filter>
  </tractor>
</mlt>
''')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w').write('\n'.join(x)); print('wrote', out, L, LA)
