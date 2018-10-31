#!/usr/bin/env python2.7

import os
import sys

from random import randint

from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
from SocketServer import ThreadingMixIn

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass

port = randint(8000, 9000)
dir = os.path.dirname(os.path.realpath(__file__))
os.chdir(dir)

url = 'http://localhost:%s/%s' % (port, 'index.html')
print "serving at %s" % (url)
os.system('open ' + url)

server_address = ('', port)
httpd = ThreadedHTTPServer(server_address, SimpleHTTPRequestHandler)
httpd.serve_forever()
