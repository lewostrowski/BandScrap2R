"""Creates filters from given values and fetch operation on Bandcamp.

One should create a new object for each new search with new sets of filters.

Typical use:
    bscrap = BandScrap(sort, type_, tags, 0, depth)
    fetch = bscrap.fetch_advance()
"""

import argparse
from bs4 import BeautifulSoup
from datetime import datetime
import json
import requests


class BandScrap:
    """The class that fetches and prepares data from Bandcamp.

    Firstly, the class creates a request to https://bandcamp.com/api/hub/2/dig_deeper
    (with is not an official Bandcamp API - I got that link by checking the connections tab on Web Developer Tools).
    Secondly, it requests the album's site content with obtained URL and enriches data.

    Attributes (filter values):
        sort: pop, date, random / string
        format_: vinyl, cd, cassette, all / string
        location: 0 / int where 0 = all, currently unavailable
        tags: ['ambient', 'drone', 'piano'] / list with strings
        max_depth: number of albums, n = n*20
    """

    def __init__(self, sort, format_, tags, location, max_depth):
        """Initialize class"""
        self.sort = sort
        self.format_ = format_
        self.tags = tags
        self.location = location
        self.max_depth = max_depth

    def create_filters(self):
        """Prepare a new set of filters.

        This function creates a new set of filters that will be sent via post request to Bandcamp's API.

        Returns:
            JSON with a header for API. Structure:
            {"filters":
               {"sort": self.sort,
                "format": self.format_,
                "tags": self.tags,
                "location": self.location},
           "page": max_depth + 1}
        """
        filters = []
        for i in range(1, self.max_depth + 1):
            filter_dict = {"filters":
                               {"sort": self.sort,
                                "format": self.format_,
                                "tags": self.tags,
                                "location": self.location},
                           "page": i}
            filters.append(json.dumps(filter_dict))

        return filters

    # fetch discover page
    def fetch_basic(self):
        """Fetch data from the Discover page on Bandcamp.

        This function fetches aggregated data on the tag's Discover page.
        The filters list will be created automatically from class attr.

        Returns:
             Dictionary:
             {'title': album title,
             'artist': artist name,
             'band_name': label if specified, otherwise band_name = artist,
             'is_preorder': 1 if pre-order, none if buy now,
             'tralbum_url': url for album page,
             'tralbum_id': album ID on Bandcamp,
             'art_id': cover art ID on Bandcamp (for an embedded player),
             'audio_track_id': suggested track (for an embedded player)}
                """
        fetch_result = []
        filters_list = self.create_filters()
        for f in filters_list:
            try:
                response = requests.post('https://bandcamp.com/api/hub/2/dig_deeper', data=f)
            except requests.exceptions.ConnectionError as e:
                print(e)
                break

            current_time = datetime.now().strftime('%H:%M:%S')
            print('{} Fetching page: {}/{}'.format(current_time, filters_list.index(f) + 1, len(filters_list)))

            for album in json.loads(response.text)['items']:
                # artist = artist, band_name = label
                search = ['title', 'artist', 'band_name', 'is_preorder', 'tralbum_url', 'tralbum_id', 'art_id',
                          'audio_track_id']
                album_dict = {attr: album[attr] for attr in search}
                fetch_result.append(album_dict)

        return fetch_result

    # fetch albums' info
    def fetch_advance(self):
        """Fetch detailed data from the album's page on Bandcamp.

        This function fetches detailed data from albums' pages. It operates on fetch_basic() returned data.

        Returns:
            Dictionary with all data returned by fetch_basic() and:
             {'price': album price
            'currency': currency of a price,
            'tracks_num': number of tracks on an album,
            'published': publish date,
            'genres': list of genres,
            'spotify': None, this value will be changed during spotify module run,
            'album_description': album description,
            'label_origin': the origin of the label if available}
        """
        enriched = []
        fetch_basic_result = self.fetch_basic()
        for album in fetch_basic_result:
            try:
                response = requests.get(album['tralbum_url'])
            except requests.exceptions.ConnectionError as e:
                print(e)
                break

            current_time = datetime.now().strftime('%H:%M:%S')
            print('{} Fetching album: {}/{}'.format(current_time, len(enriched) + 1, len(fetch_basic_result)))

            soup = BeautifulSoup(response.text, 'html.parser')
            info = json.loads(soup.find('script').text)
            album_enrichment = {
                'price': info['albumRelease'][0].get('offers').get('price'),
                'currency': info['albumRelease'][0].get('offers').get('priceCurrency'),
                'tracks_num': info['numTracks'],
                'published': datetime.strptime(info['datePublished'], '%d %b %Y %H:%M:%S %Z').strftime('%Y-%m-%d'),
                'genres': [k.lower() for k in info['keywords']],
                'image': info['albumRelease'][0]['image'][0],
                'spotify': None,
            }

            album.update(album_enrichment)

            try:
                dsc = {'album_description': info['description']}
            except:
                dsc = {'album_description': None}

            try:
                label_origin = {'label_origin': info['publisher'].get('foundingLocation').get('name')}
            except:
                label_origin = {'label_origin': None}

            album.update(dsc)
            album.update(label_origin)
            enriched.append(album)

        return enriched


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='Bandcamp fetch',
                                     description='Fetch data from Bandcamp with the given filters.',
                                     epilog='This will print fetch result as a JSON. Consider to redirect it into file.')
    parser.add_argument('-s', help='Sort: pop, date, random / string')
    parser.add_argument('-f', help='Format: vinyl, cd, cassette, all / string')
    parser.add_argument('-t', help='Tags: ambient drone piano / space separated list')
    parser.add_argument('-d', help='Depth: number of albums, n = n*20')
    args = parser.parse_args()

    sort = args.s
    type_ = args.f
    depth = int(args.d) if int(args.d) <= 10 else 10
    depth = depth if depth > 0 else 1
    tags = args.t.split(' ')
    tags = [t.strip().lower().replace(' ', '-') for t in tags if len(t) > 0]

    bscrap = BandScrap(sort, type_, tags, 0, depth)
    fetch = bscrap.fetch_advance()
    print(json.dumps(fetch))
