"""Handle fetch from Bandcamp and Spotify.

This Flask blueprint fetch data from Bandcamp and Spotify API according to given filters.
"""
from .scrap_utils import bandcamp, spotify
from flask import Blueprint, Flask, jsonify, request
import pandas as pd
import uuid
from datetime import datetime
import sqlite3

scrapp = Blueprint('scrapp', __name__)
scrapp.secret_key = str(uuid.uuid4())


@scrapp.route('/scrap', methods=['GET', 'POST'])
def scrap():
    """Create API requests according to given filters.

    This function reads values from the search form on /search site. Each value will be evaluated and prepared
    for further processing. After that, a request will be made with bandcamp and spotify modules.
    At the end of the run, the file fetch_results.json will be created in /current_session directory.
    Redirect for /feed (!)

    Arguments:
        sort = pop, date, random / string
        depth = 1 / int
        type_ = vinyl, cd, cassette, all / string
        location = 0 / int where 0 = all, currently unavailable
        tags = ['ambient', 'drone', 'piano'] / list with strings
    """
    fetch_id = str(uuid.uuid4()).replace('-', '')
    fetch_date = datetime.now().strftime('%Y-%m-%d %H:%M')
    search_query = request.json['searchquery']
    depth = int(search_query['depth']) if int(search_query['depth']) <= 10 else 10
    depth = depth if depth > 0 else 1
    tags_enriched = search_query['tags'].split(',')
    tags_enriched = [t.strip().lower().replace(' ', '-') for t in tags_enriched]

    bscrap = bandcamp.BandScrap(search_query['sort'], search_query['releaseType'], tags_enriched, 0, depth)
    enriched_fetch = bscrap.fetch_advance()

    db = sqlite3.connect('server_data.db')
    query = """select name from sqlite_master where type='table' """
    tables = set(pd.read_sql_query(query, db)['name'])

    if search_query['spotify'] == 'true':
        credentials = False
        for t in tables:
            if t == 'spotify_credentials':
                query = """select * from spotify_credentials"""
                credentials = pd.read_sql_query(query, db)
                break

        if isinstance(credentials, pd.DataFrame):
            c = credentials.to_records()
            sptf = spotify.SpotifyFetch(enriched_fetch, c['client_id'][0], c['client_secret'][0])
            auth_token = sptf.get_auth_token()
            if auth_token:
                enriched_fetch = sptf.search_query(auth_token)

    meta = {
        'fetch_id': [fetch_id],
        'fetch_date': [fetch_date],
        'is_current': [True],
        'is_saved': [False],
        'privacy_status': ['private'],
        'owner': ['user'],
        'items': [len(enriched_fetch)],
        'genres': [','.join(tags_enriched)],
        'depth': [depth],
        'sort': [search_query['sort']],
        'type': [search_query['releaseType']],
        'spotify_search': [search_query['spotify']],
    }

    if 'meta_data' in tables:
        cursor = db.cursor()
        query = """UPDATE meta_data set is_current = 0 where is_current = 1"""
        cursor.execute(query)

        query = """select fetch_id from meta_data where is_current = 0 and is_saved = 0"""
        not_saved = pd.read_sql_query(query, db)['fetch_id']

        for t in not_saved:
            query = """drop table "%s" """ % t
            cursor.execute(query)

            query = """delete from meta_data where fetch_id = "%s" """ % t
            cursor.execute(query)

    new_fetch = pd.DataFrame(enriched_fetch)
    for c in new_fetch.columns:
        if new_fetch[c].dtypes == 'object':
            new_fetch[c] = new_fetch[c].astype('string')

    new_fetch.to_sql(fetch_id, db, if_exists='replace', index=False)
    pd.DataFrame(meta).to_sql('meta_data', db, if_exists='append', index=False)
    db.commit()
    return jsonify({'db_status': 'OK'})
