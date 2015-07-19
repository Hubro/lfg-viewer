"""
This module contains functions for the Looking For Group comic
"""

import requests
from bs4 import BeautifulSoup

lfg_comic_url = "http://www.lfg.co/page/{}/"

cache = {}

def get(number):
    """Returns the image URL for the requested comic"""
    if not number in cache:
        cache[number] = fetch_comic(number)

    return cache[number]

def fetch_comic(number):
    """Uses the comic number to find the comic image URL"""

    response = requests.get(lfg_comic_url.format(number))
    response.encoding = "UTF-8"

    if response.status_code != 200:
        return None

    doc = BeautifulSoup(response.text, "html.parser")

    # If the title of the page doesn't end with the comic number, that
    # basically means 404
    if not doc.title.string.endswith(str(number)):
        return None

    image = doc.select("#comic img")[0]

    return image["src"]
