#!/usr/bin/env python3
"""Push one flow file into a running Node-RED instance.

    python3 tools/deploy_flow.py flows/tag_navigation.json http://<aircraft>:1880

Replaces that flow's tab if the instance already has it, keeps every other flow, points the
imported nodes at the ros2-websocket-server node the instance already has (ids differ between
images) and keeps the instance's dashboard ui_base. Node-RED's admin API must be open (DEXI
default). A fresh image already ships flows/flows.json, so this is for pushing a change to an
instance without rebuilding; restart the container afterwards so subscriptions register.
"""
import json, pathlib, sys, urllib.request

if len(sys.argv) < 2:
    sys.exit(__doc__)
flow_path = pathlib.Path(sys.argv[1])
base = (sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:1880').rstrip('/')
nodes = json.loads(flow_path.read_text())
tabs = [n['id'] for n in nodes if n.get('type') == 'tab']
if len(tabs) != 1:
    sys.exit(f'{flow_path} must hold exactly one tab, found {len(tabs)}')
TAB = tabs[0]

current = json.load(urllib.request.urlopen(base + '/flows'))
keep = [n for n in current if n.get('id') != TAB and n.get('z') != TAB]
servers = [n['id'] for n in keep if n.get('type') == 'ros2-websocket-server']
if servers:
    for n in nodes:
        if n.get('server'):
            n['server'] = servers[0]
else:
    sid = next((n['server'] for n in nodes if n.get('server')), 'rosbridge')
    keep.append({'id': sid, 'type': 'ros2-websocket-server', 'name': 'rosbridge', 'url': '${ROS2_WEBSOCKET_URL}'})
if any(n.get('type') == 'ui_base' for n in keep):
    nodes = [n for n in nodes if n.get('type') != 'ui_base']

req = urllib.request.Request(base + '/flows', data=json.dumps(keep + nodes).encode(), method='POST',
                             headers={'Content-Type': 'application/json', 'Node-RED-Deployment-Type': 'full'})
print('deploy', flow_path.name, '->', base, urllib.request.urlopen(req).status, '— open', base + '/#flow/' + TAB)
