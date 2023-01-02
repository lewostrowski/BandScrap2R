import React, { useState } from 'react'

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

function Spotify({ showModal, changeShow }) {
    const [helpMsg, setHelpMsg] = useState('')
    const [input, setInput] = useState({
        client_id: '',
        client_secret: ''
    })

    const handleInput = (e) => {
        const keyName = e.target.name
        const keyVal = e.target.value
        setInput(prev => ({...prev, [keyName]: keyVal}))
    }

    const clearMessage = () => {
        setTimeout(() => {
            setHelpMsg('')
        }, 5000)
    }

    const sendCredentials = () => {
        fetch("http://localhost:5000/update_credentials", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            mode: 'cors',
            body: JSON.stringify({"credentials": input})
        })
        setInput({
            client_id: '',
            client_secret: ''            
        })

    }
  return (
    <Modal show={showModal} onHide={() => {changeShow(false, 'spotify')}}>
        <Modal.Header closeButton>
            <Modal.Title>Spotify API credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {/* HELP MSG */}
            {(helpMsg.length > 0) ? (
                <Alert variant="success">
                        <p>{helpMsg}</p>
                </Alert>
            ): (
                null
            )}
            <Form>
                {/* Client ID */}
                <Form.Group>
                    <Form.Label>Client ID</Form.Label>
                    <Form.Control type="text" name='client_id' value={input.client_id} onChange={handleInput}/>
                    <Form.Text className="text-muted">
                        Maybe some help here?
                    </Form.Text>
                </Form.Group>

                {/* Client secret */}
                <Form.Group>
                    <Form.Label>Client secret</Form.Label>
                    <Form.Control type="text" name='client_secret' value={input.client_secret} onChange={handleInput}/>
                    <Form.Text className="text-muted">
                        And here?
                    </Form.Text>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            
            <Button variant="primary" type="submit" onClick={() => {
                sendCredentials()
                setHelpMsg('Credentials saved.')
                clearMessage()
                }}>
                    Save</Button>
                <Button variant="primary" onClick={() => {changeShow(false, 'spotify')}}>Close</Button>
                <Button variant="danger" onClick={() => {
                    setInput({
                        client_id: '',
                        client_secret: ''            
                    })
                    sendCredentials()
                    setHelpMsg('Credentials cleared.')
                    clearMessage()
                }}>Clear</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default Spotify