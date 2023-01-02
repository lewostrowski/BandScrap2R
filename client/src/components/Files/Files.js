import React, { useState, useEffect } from 'react'

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Stack from 'react-bootstrap/Stack';
import Alert from 'react-bootstrap/Alert';

function Files({ showModal, changeShow }) {
    const [helpMsg, setHelpMsg] = useState('')
    const [forceUpdate, setForceUpade] = useState(0)
    const [files, setFiles] = useState([])

    const fileManager = (operation, sessionID) => {
        fetch(`http://localhost:5000/${operation}/${sessionID}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            mode: 'cors'
        })
    }

    const clearMessage = () => {
        if (helpMsg.length > 0) {
            setTimeout(() => {
                setHelpMsg('')
            }, 5000)
        }
    }

    useEffect(() => {
        fetch("http://localhost:5000/show_files", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(files => {setFiles(files)})
            .then(clearMessage())

        
    }, [forceUpdate])


  return (
    // TODO(): Refresh + close after loading.
    <Modal show={showModal} size="lg" onHide={() => {changeShow(false, 'files')}}>
        <Modal.Header closeButton>
            <Modal.Title>Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Stack gap={5}>
                {/* HELP MSG */}
                {(helpMsg.length > 0) ? (
                    <Alert variant="success">
                            <p>{helpMsg}</p>
                    </Alert>
                ): (
                    null
                )}
            <div>
            <h3>Current session</h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Albums num</th>
                        <th>Genres</th>
                        <th>Sort</th>
                        <th>Spotify</th>
                        <th>Saved</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {files.map((f, i) => (   
                        (f.is_current === 1) ? (
                        <tr>
                            <td key={i}>{f.fetch_date}</td>
                            <td key={i}>{f.items}</td>
                            <td key={i}>{f.genres}</td>
                            <td key={i}>{f.sort}</td>
                            <td key={i}>{f.spotify_search}</td>
                            <td key={i}>{(f.is_saved === 1) ? ('true') : ('false')}</td>
                            <td>
                                <Button variant="primary" onClick={() => {
                                    fileManager('save', f.fetch_id)
                                    setHelpMsg('Search saved.')
                                    setForceUpade(forceUpdate + 1)
                                    }}>Save</Button>
                            </td>
                        </tr>
                        ) : (
                            null
                        )
                ))}
                </tbody>
            </Table>
            </div>
            <div>
            <h3>Saved sessions</h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Albums num</th>
                        <th>Genres</th>
                        <th>Sort</th>
                        <th>Spotify</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {files.map((f, i) => (
                    (f.is_current === 0) ? (
                        <tr>
                        <td key={i}>{f.fetch_date}</td>
                        <td key={i}>{f.items}</td>
                        <td key={i}>{f.genres}</td>
                        <td key={i}>{f.sort}</td>
                        <td key={i}>{f.spotify_search}</td>
                            <td>
                                <Button variant="primary" onClick={() => {
                                    fileManager('delete', f.fetch_id)
                                    setHelpMsg('File deleted.')
                                    setForceUpade(forceUpdate + 1)
                                    }}>Delete</Button>
                                <Button variant="primary" onClick={() => {
                                    fileManager('load', f.fetch_id)
                                    setHelpMsg('File loaded.')
                                    setForceUpade(forceUpdate + 1)
                                    window.location.reload()
                                    }}>Load</Button>
                            </td>
                        </tr>
                        ): (
                            null
                        )
                ))}
                </tbody>
            </Table>
            </div>
            </Stack>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => {
                changeShow(false, 'files')
                setHelpMsg('')
        }}>Close</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default Files