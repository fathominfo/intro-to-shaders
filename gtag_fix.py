#!/usr/bin/env python2.7

import os

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

TAG = """
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-40344111-29"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-40344111-29');
  </script>
"""

# def find_all(name, path):
#     result = []
#     for root, dirs, files in os.walk(path):
#         if name in files:
#             result.append(os.path.join(root, name))
#     return result



indices = os.popen('find %s -name index.html' % (SCRIPT_DIR)).readlines()
indices = [f.strip() for f in indices]

for fname in indices:
  f = open(fname)
  lines = f.readlines()
  f.close()

  needs_analytics = True
  style_end_tag_line = -1
  for i, l in enumerate(lines):
    if "www.googletagmanager.com" in l:
      needs_analytics = False
    elif "</style>" in l:
      style_end_tag_line = i

  if needs_analytics:
    print("tagging %s" % (fname))
    lines.insert(style_end_tag_line, TAG)
    f = open(fname, 'w')
    f.write("".join(lines))
    f.close()






