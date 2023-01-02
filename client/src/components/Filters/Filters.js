import React, { useState, useEffect } from 'react'

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

import FiltersLibrary from './FiltersLibrary'

// pobieranie slownika gatunkow

function Filters({ albums, externalSet }) {
    const [filters, setFilters] = useState({
        artist: '',
        title: '',
        genres: '',
        band_name: '',
        label_origin: '',
        genres_include: [],
        genres_exclude: []
    })
    const [inner, setInner] = useState(albums)
    const [availableGenres, setAvailableGenres] = useState([])
    const [page, setPage] = useState(10)

    function removeDuplicates(arr) {
        return arr.filter((item, 
            index) => arr.indexOf(item) === index);
    }

    useEffect(() => {
        var gArray = []
        for (let album of inner) {
            var albumGenres = album.genres.split(', ')
            for (let genre of albumGenres) {
                var g = genre.replace(/\]|\[|\'/g, '')
                gArray.push(g)
            }
        }

        var counted = {}
        for (let g of gArray) {
            if (typeof counted[g] === 'undefined') {
                var gNum = gArray.filter(x => x === g)
                counted[g] = gNum.length
            }
        }

        setAvailableGenres(counted)
    }, [inner])

    useEffect(() => {
        var f = new FiltersLibrary(albums, filters)
        var match = f.manage()

        setInner(removeDuplicates(match))
        externalSet(removeDuplicates(match), 'real')

        console.log(filters)
    }, [filters])

    const handleInput = (e) => {
        const keyName = e.target.name
        const keyVal = e.target.value
        setFilters(prev => ({...prev, [keyName]: keyVal}))
      }

      const handleArrayInput = (e) => {
        const keyName = e.target.name
        const keyVal = e.target.value

        console.log(keyVal)
        var newCurrent = filters[keyName]
        if (newCurrent.includes(keyVal)) {
            newCurrent.splice(newCurrent.indexOf(keyVal), 1)
        } else {
            newCurrent.push(keyVal)
        }
        
        setFilters({...filters, [keyName]: newCurrent})
      }

  return (
    // TODO(): Clear button and clear all button
    // TODO(): Running filters.
    <Row className="g-4 justify-content-md-center" style={{ margin: "1rem 0rem"}}>
    <Col>
    </Col>
    <Col xs={6}>
        <Tabs defaultActiveKey="phrase" id="filters-menu" className="mb-3" fill>
            <Tab eventKey="running" title="Running filters">
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                    <div>
                        <h6>Phrase filter</h6>
                        <p>Artist: {filters.artist}</p>
                        <p>Album title: {filters.title}</p>
                        <p>Genres: {filters.genres}</p>
                        <p>Label name: {filters.band_name}</p>
                        <p>Label origin: {filters.label_origin}</p>
                    </div>

                    <div>
                        <h6>Genres filter</h6>
                        <p>Include: {filters.genres_include}</p>
                        <p>Exclude: {filters.genres_exclude}</p>
                    </div>
                </Stack>
            </Tab>
            <Tab eventKey="phrase" title="Phrase filter">
                <Form>
                    {/* Search by phrase - artist name */}
                    <Form.Group>
                        <Form.Label>Artist name</Form.Label>
                        <Form.Control type="text" name='artist' value={filters.artist} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            It is common on Bandcamp for label to put their name as artist name.
                            In this case try to search artist name also in album's title.
                        </Form.Text>
                    </Form.Group>

                    {/* Search by phrase - album title */}
                    <Form.Group>
                        <Form.Label>Album title</Form.Label>
                        <Form.Control type="text" name='title' value={filters.title} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            It is common for label to put artist's name in album's title field.
                        </Form.Text>
                    </Form.Group>

                    {/* Search by phrase - genres */}
                    <Form.Group>
                        <Form.Label>Genres</Form.Label>
                        <Form.Control type="text" name='genres' value={filters.genres} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            Simplified search by key value.
                        </Form.Text>
                    </Form.Group>

                    {/* Search by phrase - label name */}
                    <Form.Group>
                        <Form.Label>Label name</Form.Label>
                        <Form.Control type="text" name='band_name' value={filters.band_name} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            If an artist doesn't have label, Bandcamp assigns artist name to that field.
                        </Form.Text>
                    </Form.Group>

                    {/* Search by phrase - label name */}
                    <Form.Group>
                        <Form.Label>Label origin</Form.Label>
                        <Form.Control type="text" name='label_origin' value={filters.label_origin} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            Label or artist origin.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Tab>

            <Tab eventKey="genres" title="Genres filter">
                {(Object.keys(availableGenres).length > 0) ? (
                    <Form>
                        {Object.keys(availableGenres).map((g, i) => (
                            (i >= page - 10 && i < page) ? (
                                // TODO(): if album.len === genres.len then nothing will be shown
                                <Form.Check 
                                    type={'checkbox'}
                                    id={`chebox-${i}`}
                                    value={g}
                                    name='genres_include'
                                    onChange={handleArrayInput}
                                    checked={filters.genres_include.includes(g)}
                                    label={`${g} ${availableGenres[g]}`}
                                />      
                        ) : (
                            null
                        )))}
                        
                        <Stack direction="horizontal" gap={3} className="justify-content-center">
                            {(page - 10 > 0) ? (
                                <Button onClick={() => {setPage(page- 10)}}>Previous</Button>
                            ) : (
                                <Button disabled>Previous</Button>
                            )}
                            <span>Page: {page/10}/{albums.length/10}</span>
                            {(page + 1 <= albums.length) ? (
                                <Button onClick={() => {setPage(page + 10)}}>Next</Button>
                            ) : (
                                <Button disabled>Next</Button>
                            )}
                        </Stack>
                        

                    </Form>      
                ) : (
                    null
                )}
            </Tab>
        </Tabs>
        </Col>
        <Col>
        </Col>
    </Row>
  )
}

export default Filters