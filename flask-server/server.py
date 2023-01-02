#!/usr/bin/env python3
"""Launch Flask's Restfull API.

This module provides a simple launcher for the application.
In the future development, it will create space for the application's homepage.
"""
from flask_cors import CORS
from flask import Flask, jsonify, Response, request
import pandas as pd
import uuid
import sqlite3

from blueprints.scraper_blueprint import scrapp
from blueprints.scrap_utils import genres

app = Flask(__name__)
app.register_blueprint(scrapp)
app.secret_key = str(uuid.uuid4())
CORS(app)


# TODO(): ustalić metody we funkcjach, usunac niepotrzene biblioteki
# TODO(): lepiej zaimplementowac zmienne zawierajace sqlki

@app.route('/', methods=['GET', 'POST'])
def index():
    return {"current_session": "OK"}


@app.route('/send_feed', methods=['GET', 'POST'])
def send_feed():
    """Loads current session from db and send it as a response.

    Argumenst:
        table_to_load: name of the table to load
    """
    db = sqlite3.connect('server_data.db')

    query = """select * from meta_data where is_current = 1"""
    current_id = pd.read_sql_query(query, db)['fetch_id'].values[0]

    query = """
        select 
            tralbum_id,
            title,
            artist,
            published,
            is_preorder,
            genres,
            band_name,
            label_origin,
            price,
            currency,
            tralbum_url,
            spotify,
            image
        from "%s"    
    """ % current_id
    try:
        df = pd.read_sql_query(query, db)
        df = genres.GenresSmasher(df).smash()
    except:
        df = pd.DataFrame()

    return Response(df.to_json(orient='records'), mimetype='application/json')


@app.route('/details/<albumid>', methods=['GET', 'POST'])
def send_details(albumid):
    """Send detailed information about album.

    Arguments:
         albumid: id of the album (tralbum_id)
    """
    db = sqlite3.connect('server_data.db')

    query = """select * from meta_data where is_current = 1"""
    current_id = pd.read_sql_query(query, db)['fetch_id'].values[0]

    query = """
        select 
            tralbum_id,
            tracks_num,
            album_description
        from "%s"
        where tralbum_id = "%s"
    """ % (current_id, albumid)
    df = pd.read_sql_query(query, db)

    return Response(df.to_json(orient='records'), mimetype='application/json')


@app.route('/show_files', methods=['GET', 'POST'])
def show_files():
    """Send available sessions.
    """
    db = sqlite3.connect('server_data.db')
    query = """select * from meta_data"""
    df = pd.read_sql_query(query, db)

    return Response(df.to_json(orient='records'), mimetype='application/json')


@app.route('/save/<sessionid>', methods=['GET', 'POST'])
def save(sessionid):
    """Save current session to db."""
    db = sqlite3.connect('server_data.db')
    cursor = db.cursor()
    query = """
        UPDATE meta_data set is_saved = 1 
        where is_saved = 0
        and fetch_id = "%s"
    """ % sessionid
    cursor.execute(query)
    db.commit()
    return {'db_status': 'OK'}


@app.route('/delete/<sessionid>', methods=['GET', 'POST'])
def delete(sessionid):
    """Delete session in db."""
    db = sqlite3.connect('server_data.db')
    cursor = db.cursor()
    query = """drop table "%s" """ % sessionid
    cursor.execute(query)

    query = """delete from meta_data where fetch_id = "%s" """ % sessionid
    cursor.execute(query)

    db.commit()

    return {'db_status': 'OK'}


@app.route('/load/<sessionid>', methods=['GET', 'POST'])
def load(sessionid):
    """Delete session in db."""
    db = sqlite3.connect('server_data.db')
    cursor = db.cursor()
    query = """UPDATE meta_data set is_current = 0 where is_current = 1"""
    cursor.execute(query)

    query = """select fetch_id from meta_data where is_current = 0 and is_saved = 0"""
    not_saved = pd.read_sql_query(query, db)['fetch_id']
    for t in not_saved:
        query = """drop table "%s" """ % sessionid
        cursor.execute(query)

        query = """delete from meta_data where fetch_id = "%s" """ % t
        cursor.execute(query)

    query = """
        UPDATE meta_data set is_current = 1 
        where is_current = 0
        and fetch_id = "%s"
    """ % sessionid
    cursor.execute(query)
    db.commit()

    return {'db_status': 'OK'}


@app.route('/update_credentials', methods=['GET', 'POST'])
def update_credentials():
    """Update Spotify credentials.

    Arguments:
        client_id: ID provided by Spotify,
        client_secret: secret key.
    """
    results = request.json['credentials']
    client_id = results['client_id']
    client_secret = results['client_secret']

    db = sqlite3.connect('server_data.db')
    pd.DataFrame({
        'client_id': [client_id],
        'client_secret': [client_secret]
    }).to_sql('spotify_credentials', db, if_exists='replace', index=False)
    db.commit()
    return {'db_status': 'OK'}


if __name__ == "__main__":
    app.run(debug=True)
