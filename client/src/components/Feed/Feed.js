import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Figure from 'react-bootstrap/Figure';

import bcLogo from '../../assets/bandcamp_black.png';
import sLogo from '../../assets/spotify_black.png';

function Feed({ albums }) {
    const [moreInfo, setMoreInfo] = useState({tralbum_id: 0})
    const [page, setPage] = useState(10)

    const getMoreInfo = (albumID) => {
        if (albumID > 0) {
            fetch(`http://localhost:5000/details/${albumID}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            }).then(res => res.json()).then(data => {
                setMoreInfo({
                    tralbum_id: data[0].tralbum_id,
                    album_description: data[0].album_description,
                    tracks_num: data[0].tracks_num
                })
            })
        }
    }
    
  return (
    <div>
        <Row>
            <Col>
            </Col>
            <Col xs={6}>
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
            </Col>
            <Col>
            </Col>
        </Row>

        {[albums.map((album, i) => (
            (i >= page - 10 && i < page) ? (
            <Row className="g-4 justify-content-md-center" style={{ margin: "1rem 0rem"}}>
                <Col>
                </Col>
                <Col xs={6}>
                    <Card key={i} id={album.tralbum_id} border="light">
                        <Card.Header>
                            <Stack direction="horizontal" gap={3} className="justify-content-between">
                                <div>
                                    <Card.Title>{album.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">By: {album.artist}</Card.Subtitle>
                                </div>
                                <div>
                                    {(moreInfo.tralbum_id === album.tralbum_id) ? (
                                            <Button variant="light" onClick={() => {setMoreInfo({tralbum_id: 0})}}>Hide info</Button>
                                        ) : (
                                            <Button variant="light" onClick={() => {getMoreInfo(album.tralbum_id)}}>More info</Button>
                                        )}
                                        {(album.spotify) ? (
                                            <Figure>
                                                <a href={album.spotify} target="_blank">
                                                    <Figure.Image width={40} height={40} src={sLogo}/>
                                                </a>
                                            </Figure>
                                        ) : (
                                            <Figure></Figure>
                                        )}
                                    <Figure>
                                        <a href={album.tralbum_url} target="_blank">
                                            <Figure.Image width={40} height={40} src={bcLogo}/>
                                        </a>
                                    </Figure>
                                </div>
                            </Stack>
                        </Card.Header>
                        <Card.Body>                 
                            <Card.Text style={{ overflow: "scroll" }}>
                                <Stack direction="horizontal" gap={3} className="align-items-start">
                                    <div>
                                        <Figure style={{border: "0", width: "15rem", height: "15rem"}}>
                                            <Figure.Image src={album.image}/>
                                        </Figure>
                                    </div>
                                    <div>
                                    <p>Relese date: {album.published}, 
                                    {(album.is_preorder == '1') ? (
                                        <span> preorder</span>
                                    ) : (
                                        <span> buynow</span>
                                    )}</p>
                                    
                                    <p>Label: {album.band_name}, {album.label_origin}</p>
                                    <p>Price: {album.price} {album.currency}</p>
                                    <p>Genres: {album.genres.split(',').map((genre, j) => (
                                        (j < album.genres.split(',').length -1) ? (
                                            <span key={j}>{genre.replace(/\]|\[|\'/g, '')},</span>
                                        ) : (
                                            <span key={j}>{genre.replace(/\]|\[|\'/g, '')}</span>
                                        )
                                    ))}</p>

                                    {(moreInfo.tralbum_id === album.tralbum_id) ? (
                                        <div>
                                            <p>Tracks: {moreInfo.tracks_num}</p>
                                            <p>Description: {moreInfo.album_description}</p>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                    </div>
                                </Stack>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                </Col>
            </Row>
            ) : (
                null
            )
        ))]}

        <Row>
            <Col>
            </Col>
            <Col xs={6}>
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                    {(page - 10 > 0) ? (
                        <Button onClick={() => {
                            setPage(page - 10)
                            window.scrollTo(0, 0)
                        }}>Previous</Button>
                    ) : (
                        <Button disabled>Previous</Button>
                    )}
                    <span>Page: {page/10}/{albums.length/10}</span>
                    {(page + 1 <= albums.length) ? (
                        <Button onClick={() => {
                            setPage(page + 10)
                            window.scrollTo(0, 0)
                        }}>Next</Button>
                    ) : (
                        <Button disabled>Next</Button>
                    )}
                </Stack>
            </Col>
            <Col>
            </Col>
        </Row>
    </div>
  )
}

export default Feed