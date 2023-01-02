// React library
import React, { useState, useEffect } from 'react';

// Bootstrap library
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';

// Custom library
import Feed from './components/Feed/Feed';
import Search from './components/Search/Search';
import Filters from './components/Filters/Filters';
import Spotify from './components/Spotify/Spotify';
import Files from './components/Files/Files';


// TODO(): Likes, save - user library
function App() {
    const [feed, setFeed] = useState([])
    const [real, setReal] = useState([])
    const [modals, setModals] = useState({
        search: false,
        spotify: false,
        files: false,
        filters: false,
        needReload: false
    })

    const externalSet = (r, child) => {
        if (child === 'real') {
            setReal(r)
        } else {
            setModals(prev => ({...prev, [child]: r}))
        }
    }
    
    useEffect(() => {
        // TODO(): Refresh after search
        fetch("http://localhost:5000/send_feed", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(feed => {
                setFeed(feed)
                setReal(feed)
            })

        if (modals.needReload) {
            externalSet(false, 'needReload')
        }
    }, [modals.needReload])

    return (
        <Container fluid>
            {/* Modals */}
            <Search showModal={modals.search} changeShow={externalSet} />
            <Spotify showModal={modals.spotify} changeShow={externalSet} />
            <Files showModal={modals.files} changeShow={externalSet} />

            <Row>
                <Navbar bg="dark" variant="dark" className="justify-content-center">
                    <Nav>
                        <Nav.Link onClick={() => {externalSet(true, 'search')}}>New Search</Nav.Link>
                        <Nav.Link onClick={() => {externalSet(true, 'files')}}>Files</Nav.Link>
                        <Nav.Link onClick={() => {externalSet(true, 'spotify')}}>Spotify credentials</Nav.Link>
                        <Nav.Link onClick={() => {externalSet(!modals.filters, 'filters')}}>Filters</Nav.Link>
                    </Nav>
                </Navbar>
             </Row>  

                
                {(modals.filters) ? (
                    <Filters albums={feed} externalSet={externalSet} />  
                ) : (
                    <Row></Row>
                )}
                
                            
                {(real.length === 0 & feed.length === 0) ? (
                        <p>Use search option</p>
                   
                ) : (
                    (real.length > 0) ? (
                            <Feed albums={real} />
                    ): (
                        <p>Nothing to show</p>
                    )   
                )}
        </Container>

    )
}

export default App