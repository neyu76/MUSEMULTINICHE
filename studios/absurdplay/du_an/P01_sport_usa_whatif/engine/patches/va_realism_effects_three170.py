# Vá realism-effects 1.1.2 cho three >= r162 (bỏ uniform boneTextureSize). Chạy lại sau mỗi lần npm install.
import sys
p = 'node_modules/realism-effects/dist/index.js'; s = open(p).read()
old = s[s.index("			mat4 getPrevBoneMatrix( const in float i ) {\n				float j = i * 4.0;"):s.index("				mat4 bone = mat4( v1, v2, v3, v4 );")]
new = """			mat4 getPrevBoneMatrix( const in float i ) {
				int size = textureSize( prevBoneTexture, 0 ).x;
				int j = int( i ) * 4; int x = j % size; int y = j / size;
				vec4 v1 = texelFetch( prevBoneTexture, ivec2( x, y ), 0 );
				vec4 v2 = texelFetch( prevBoneTexture, ivec2( x + 1, y ), 0 );
				vec4 v3 = texelFetch( prevBoneTexture, ivec2( x + 2, y ), 0 );
				vec4 v4 = texelFetch( prevBoneTexture, ivec2( x + 3, y ), 0 );
"""
if 'boneTextureSize' in old: s = s.replace(old, new); open(p, 'w').write(s); print('patched')
else: print('already patched')
