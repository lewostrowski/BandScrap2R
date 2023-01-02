class FiltersLibrary {
    constructor(albums, filterDict) {
        this.albums = albums
        this.filterDict = filterDict
        this.match = {
            artist: [],
            title: [],
            genres: [],
            band_name: [],
            label_origin: [],
            genres_include: [],
            genres_exclude: []
        }
    }

    // Return true if value match all available parameters
    crossCheck(searchValue) {
        for (let key in this.match) {
            if (this.match[key].length > 0) {
                if (!this.match[key].includes(searchValue)) {
                    return false
                }
            } 
        }
        return true
    }

    // Filter by given value in specified fields
    byKey(dictParam, fieldsToSearch) {
        var searchVal = this.filterDict[dictParam].toLowerCase()
        for (let a of this.albums) {
            fieldsToSearch.forEach((dictParam) => {
                if (typeof a[dictParam] !== 'undefined') {
                    if (a[dictParam].toLowerCase().includes(searchVal)) {
                        this.match[dictParam].push(a)
                    }
                }
            })
        }
    }

    byGenres(dictParam) {
        var searchArr = this.filterDict[dictParam]
        for (let a of this.albums) {
            var albumGenres = a.genres.replace(/\]|\[|\'/g, '').split(', ')
            searchArr.forEach((g) => {
                if (albumGenres.includes(g)) {
                    this.match[dictParam].push(a)
                }
            })
        }
    }

    // Filter by given value in specified fields
    byKeyNagetive(dictParam, fieldsToSearch) {
        var searchVal = this.filterDict[dictParam].toLowerCase()
        for (let a of this.albums) {
            fieldsToSearch.forEach((dictParam) => {
                if (typeof a[dictParam] !== 'undefined') {
                    if (!a[dictParam].toLowerCase().includes(searchVal)) {
                        this.match[dictParam].push(a)
                    }
                }
            })
        }
    }

    byDate(dictParam) {
        var searchVal = this.filterDict[dictParam]
        for (let a of this.albums) {
            if ((new Date(a.published) > new Date(searchVal) && (dictParam === 'byDateStart'))) {
                this.match[dictParam].push(a)
            } else if ((new Date(a.published) < new Date(searchVal) && (dictParam === 'byDateEnd'))) {
                this.match[dictParam].push(a)
            }
        }
    }

    manage() {
        for (let key in this.filterDict) {
            var keySearch = ['artist', 'title', 'genres', 'band_name', 'label_origin']
            if (this.filterDict[key].length > 0) {
                switch(key) {
                    case 'artist':
                    case 'title':
                    case 'genres':
                    case 'band_name':
                    case 'label_origin':
                        this.byKey(key, [key])
                        break
                    case 'byKey':
                        this.byKey(key, keySearch)
                        break
                    case 'byDateStart':
                    case 'byDateEnd':
                        this.byDate(key)
                        break
                    case 'genres_include':
                        this.byGenres(key)
                        break
                    case 'genres_exclude':
                        this.byGenres(key)
                        break
                }
            }
        }

        let activeSearch = false
        for (let filter in this.filterDict) {
            if (this.filterDict[filter].length > 0) {
                activeSearch = true
                break
            }
        }

        if (activeSearch) {
            let toReturn = []
            for (let a of this.albums) {
                if (this.crossCheck(a)) {
                    toReturn.push(a)
                }
            }
    
            if (toReturn.length === this.albums.length) {
                toReturn = []
            }
            return toReturn
        } else {
            return this.albums
        }

    }
}

export default FiltersLibrary