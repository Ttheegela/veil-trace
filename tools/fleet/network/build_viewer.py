"""Inline out/graph_data.js into viewer/template.html -> out/shadow_fleet_map.html (single file, opens from disk)."""
import os
H = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(H, 'viewer', 'template.html'), encoding='utf-8').read()
d = open(os.path.join(H, 'out', 'graph_data.js'), encoding='utf-8').read()
assert '/*__FLEET_DATA__*/' in t, 'template needs the /*__FLEET_DATA__*/ placeholder inside a <script> tag'
out = t.replace('/*__FLEET_DATA__*/', d.replace('</script', '<\\/script'))
open(os.path.join(H, 'out', 'shadow_fleet_map.html'), 'w', encoding='utf-8').write(out)
print('wrote out/shadow_fleet_map.html', len(out) // 1024, 'KB')
