"""Obtain tokens and fetch Spotify data.

The class obtains auth token and searches for albums on Spotify. Search string:
artist:{artist}+album:{title}+year:{year}
Album data needs to be a result of the BandScrap().fetch_advance()

Typical use:
    sptf = SpotifyFetch(fetch, credentials['client_id'], credentials['client_secret'])
    enriched_fetch = sptf.search_query()
"""
import argparse
import json
from datetime import datetime
import requests


class SpotifyFetch:
    """The class fetches and prepares data from Spotify.

    It uses provided Spotify credentials to obtain auth tokens.
    Then, each record in fetch creates a request to Spotify API.

    Attributes:
        data: fetch results,
        client_id: Spotify credential ID,
        client_secret: Spotify credential secret
    """

    def __init__(self, data, client_id, client_secret):
        """Initialize class"""
        self.data = data
        self.client_id = client_id
        self.client_secret = client_secret

    # get authorization token
    def get_auth_token(self):
        """Obtain auth token for Spotify API.

        It sends a post request to: https://accounts.spotify.com/api/token' to obtain auth header.

        Returns:
             Dictionary with an access token that can be sent as a header.
        """
        try:
            auth_response = requests.post('https://accounts.spotify.com/api/token', data={
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret
            })

            current_time = datetime.now().strftime('%H:%M:%S')
            if auth_response.status_code == 200:
                header = {'Authorization': 'Bearer {}'.format(auth_response.json().get('access_token'))}
                print(f'{current_time} Spotify authorization token received')
                return header
            else:
                print(f'{current_time} Wrong Spotify credentials')
                return False

        except requests.exceptions.ConnectionError as e:
            print(e)

    # search for albums
    def search_query(self, auth_token):
        """Fetch data via Spotify API.

        For each album in provided fetch, the function will create a get request to:
        https://api.spotify.com/v1/search?type=album&q={search_string}&limit=1
        Where {search_string}: artist:{artist}+album:{title}+year:{year}
        Then it will enrich data with a Spotify link.

        Return:
            Dictionary form BandScrap().advance_fetch() but with updated 'spotify' value.
        """
        spotify_enriched = []
        for album in self.data:
            artist = album['artist'].replace(' ', '%20').replace('+', '')
            title = album['title'].replace(' ', '%20').replace('+', '')
            year = album['published'][:4]
            search_string = f'artist:{artist}+album:{title}+year:{year}'
            search_full = f'https://api.spotify.com/v1/search?type=album&q={search_string}&limit=1'

            try:
                spotify_response = requests.get(search_full, headers=auth_token)
                spotify = json.loads(spotify_response.text)
            except requests.exceptions.ConnectionError as e:
                print(e)

            current_time = datetime.now().strftime('%H:%M:%S')
            print('{} Fetching spotify info for album {}/{}'.format(current_time, len(spotify_enriched) + 1,
                                                                    len(self.data)))

            if spotify['albums']['items']:
                s_url = spotify['albums']['items'][0]['external_urls']['spotify']
                album.update({'spotify': s_url})

            spotify_enriched.append(album)

        return spotify_enriched


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='Spotify fetch',
                                     description='Fetch data from Spotify',
                                     epilog='This will print fetch result as a JSON. Consider to redirect it into file.')
    parser.add_argument('-f', help='Fetch: fetch results in json, from bandcamp module')
    parser.add_argument('-id', help='Spotify client id')
    parser.add_argument('-s', help='Spotify client secret')
    args = parser.parse_args()

    sptf = SpotifyFetch(args.f, args.id, args.s)
    enriched_fetch = sptf.search_query()
    print(json.dumps(enriched_fetch))