import React, { useState } from 'react'
import './App.css'
import Button from 'react-bootstrap/Button';
import { Alert, Container } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
const App = () => {
  
  const [show,setShow] = useState(false);


  const toggleModal = () => {
    setShow(!show);
  }

  return (
    <Container>
      <h1>FE-Exercise</h1>
      
       <Button variant="primary" onClick={toggleModal}>
         Log in
       </Button>
      
      <Modal show={show} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Log in</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This is a modal

        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={toggleModal}>
            Close
          </Button>
          <Button variant="success" onClick={toggleModal}>
            Log in
          </Button>
        </Modal.Footer>

      </Modal>

    </Container>
  )
}

export default App;