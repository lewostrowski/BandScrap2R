# Bandscrap2

## About
BandScrap2 is a successor of my previous project with the same name. This app aims to simplify digging music on Bandcamp by aggregating data from multiple sources and serving it in edible form.

## Problem to solve
Bandcamp does not provide any open API, so the only way to discover music is via their website. However, the user interface and available options create some limitations:
* Searching by tags takes place on the Discover page, where users have access only to limited information about albums,
* Hence one can only see detailed album information by clicking on it and going to another page.
* There are no advanced filters.
* There are no search session options for hard-core music diggers. Leaving the page or refreshing it means that you need to start from the beginning. The more active the genre is, the more annoying it gets (consider a general tag like "chillout").
* Some essential information (IMHO) is too hidden. On the Discovery page, you need to hover over the album to know if it is pre-order. Tags on the album page are on the bottom, so one must scroll down.

Not to mention that sometimes I also want to find an album on Spotify.
#### Consider the example
I want to search for music that contains "drone" tag. However, this tag is very general because drone music is not a genre by itself (IMHO), and how it is used may vary across other genres. Some examples of genres that use drone music are black metal, ambient, stoner rock, experimental, musique concrete, and many more. I am interested only in some of them but cannot distinguish them on the Discover page. Specifying a tag as "drone ambient" or "experimental drone" is possible. However, it will be time-consuming to search manually across every tag. One also needs to know the tag's specific name, which could not be intuitive.


## The aim of BandScrap2
To address these problems, BandScrap2 offers one space for:
* Fetching, aggregating, and displaying albums in a more edible way.
* Automatically search for an album on Spotify.
* Easy to control filters, with genres filter.
* Saving fetch for later use.

#### Obtaining data
Firstly, the app will create a request to Bandcamp API that usually sends JSON data to their Discover page. It fetches basic information about an album, like the artist's name, if it is pre-order or buy now, or the album URL. Then it uses fetched URLs to request album site content from where it will take detailed information. If a user-provided Spotify credential, in the final steps, the app will request Spotify API to search for the record.

#### Aggregating data
Album information is stored in JSON with the following structure:
```
'title': album title,
'artist': artist name,
'band_name': label if specified, otherwise band_name = artist,
'is_preorder': 1 if pre-order, none if buy now,
'tralbum_url': url for album page,
'tralbum_id': album ID on Bandcamp,
'art_id': cover art ID on Bandcamp (for an embedded player),
'audio_track_id': suggested track (for an embedded player),
'price': album price,
'currency': currency of a price,
'tracks_num': number of tracks on an album,
'published': publish date,
'genres': list of genres,
'spotify': link to Spotify if available,
'album_description': album description,
'label_origin': the origin of the label if available
```

The app will display each album in a separate box with the following information. Records proceeded by [H] are hidden by default under the "More information" button.
```
'title': album title,
'artist': artist name,
'is_preorder': 1 if pre-order, none if buy now,
'tralbum_url': url for album page,
'published': publish date,
'genres': list of genres,
'spotify': link to Spotify if available,
(H) 'band_name': label if specified, otherwise band_name = artist,
(H) 'price': album price,
(H) 'currency': currency of a price,
(H) 'tracks_num': number of tracks on an album,
(H) 'album_description': album description,
(H) 'label_origin': the origin of the label if available
```

#### Filters
JavaScript handles filters by adding or removing items in local storage. Each filter will be stored as `hiddenBy{filter-type}` and each filter value will be stored as `hiddenBy{filter-type}RunningValue`. Albums can be hidden by more than one filter to preserve coherency between different filters. Any called filter will update the visibility of filtered elements.

Filters are in active development.