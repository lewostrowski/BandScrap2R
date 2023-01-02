import React, { useState } from 'react'

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Stack from 'react-bootstrap/Stack';


function Search({ showModal, changeShow }) {
  const [spinner, setSpinner] = useState(false)
  const [helpMsg, setHelpMsg] = useState('')
  const [inputs, setInputs] = useState({
    tags: "",
    sort: "pop",
    releaseType: "all",
    depth: "1",
    spotify: "false"
  })

  const clearMessage = () => {
        setTimeout(() => {
            setHelpMsg('')
        }, 5000)
    }

  const handleInput = (e) => {
    const keyName = e.target.name
    const keyVal = e.target.value
    setInputs(prev => ({...prev, [keyName]: keyVal}))
  }

  const sendSearchQuery = () => {
    let queryOk = true

    if (inputs.tags.length == 0) {
        setHelpMsg('Provide one or more music genre.')
        queryOk = false
    } else if (Number(inputs.depth) < 1 || Number(inputs.depth) > 10) {
        setHelpMsg('Depth needs to be between 1 and 10.')
        queryOk = false   
    }

    clearMessage()    
    if (queryOk == true) {
        setHelpMsg('')
        setSpinner(true)
        fetch("http://localhost:5000/scrap", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            mode: 'cors',
            body: JSON.stringify({"searchquery": inputs})
        }).then(res => {
            if (res.ok) {
                setSpinner(false)
                changeShow(false, 'search')
            }
        })
    }
  }

  return (
    // TODO(): Hangle errors and breaks.
    // TODO(): Spinner
    
    <Modal show={showModal} onHide={() => {changeShow(false, 'search')}}>
        <Modal.Header closeButton>
            <Modal.Title>New search</Modal.Title>
        </Modal.Header>
        <Modal.Body>


            {(spinner) ? (
                <Stack gap={3} className="justify-content-center">
                    <div class="text-center">
                        <p>Fetch time depends on your internet performance. Usually, each level of depth should last at most 40 seconds. So depth level 3 will last about 2 minutes.</p>
                    </div>
                    <div class="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                    <div class="text-center">
                        <p>This window will be closed automatically after fetch.</p>
                        <p>Closing it manually wil not abort fetch!</p>
                    </div>
                </Stack>
            ) : (
                <Form>
                    {/* HELP MSG */}
                    {(helpMsg.length > 0) ? (
                        <Alert variant="warning">
                                <p>{helpMsg}</p>
                        </Alert>
                    ): (
                        null
                    )}
                    {/* GENRE */}
                    <Form.Group>
                        <Form.Label>Genres</Form.Label>
                        <Form.Control type="text" name='tags' value={inputs.tags} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            You can specify one or more genres by separating them with a comma.
                            TODO: Is it inner join?
                        </Form.Text>
                    </Form.Group>

                    {/* DEPTH */}
                    <Form.Group>
                        <Form.Label>Depth</Form.Label>
                        <Form.Control type="text" name='depth' value={inputs.depth} onChange={handleInput}/>
                        <Form.Text className="text-muted">
                            Determines the number of fetched albums. 1 = 20, 2 = 40 *snif* and so on.
                        </Form.Text>
                    </Form.Group>

                    {/* SORT */}
                    <Form.Group>
                        <Form.Label>Sort</Form.Label>
                        <Form.Select name='sort' value={inputs.sort} onChange={handleInput}>
                            <option value="pop">Popularity</option>
                            <option value="date">Date</option>
                            <option value="random">Random</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Some help text about it.
                        </Form.Text>
                    </Form.Group>

                    {/* TYPE */}
                    <Form.Group>
                        <Form.Label>Release type</Form.Label>
                        <Form.Select name='releaseType' value={inputs.releaseType} onChange={handleInput}>
                            <option value="all">All</option>
                            <option value="cd">CD</option>
                            <option value="vinyl">Vinyl</option>
                            <option value="casette">Cassette</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Some help text about it.
                        </Form.Text>
                    </Form.Group>

                    {/* SPOTIFY */}
                    <Form.Check type='checkbox' 
                    id='spotify'
                    name='spotify' 
                    value={!(/true/).test(inputs.spotify)}
                    onChange={handleInput}
                    label="Spotify search">
                    </Form.Check>
                </Form>
            )}


        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" type="submit" onClick={() => {sendSearchQuery()}}>Search</Button>
            <Button variant="primary" onClick={() => {changeShow(false, 'search')}}>Close</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default Search