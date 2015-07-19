
import os

import bottle
from bottle import Bottle, request, response, run
from bottle import abort, redirect, static_file

from comic_reader import lfg

host = os.environ.get("LFG_READER_HOST", "0.0.0.0")
port = os.environ.get("PORT", "5000")
debug = os.environ.get("LFG_READER_DEBUG", False) and True
server = "gunicorn" if not debug else "wsgiref"

bottle.debug(debug)

app = Bottle()

@app.get("/comic/<number:int>")
def get_comic(number):
    """Returns the URL to the requested comic number"""
    response.content_type = "text/plain"

    url = lfg.get(number)

    if url is None:
        abort(404)

    return url

@app.get("/<path:path>")
def get_static_file(path):
    """Returns a static file"""
    return static_file(path, root="static")

@app.get("/")
def get_index():
    """Returns the index.html file"""
    return static_file("index.html", root="static")

if __name__ == "__main__":
    run(app, server=server, host=host, port=port, reloader=debug)
