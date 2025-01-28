import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ email?: string; password?: string }>({});
  const [users, setUsers] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/db/data.json")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const toggleModal = () => {
    setShow(!show);
    if (!show) {
      setEmail("");
      setPassword("");
      setError({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError({});

    if (!email) {
      setError((prev) => ({ ...prev, email: "Email is required" }));
    }
    if (!password) {
      setError((prev) => ({ ...prev, password: "Password is required" }));
    }

    if (email && password) {
      const user = users.find(
        (user) => user.email === email && user.password === password
      );

      if (!user) {
        const existingEmail = users.find((user) => user.email === email);
        if (existingEmail) {
          setError((prev) => ({
            ...prev,
            password: "Incorrect password",
          }));
        } else {
          setError((prev) => ({
            ...prev,
            email: "This email is not registered. Create an account!",
          }));
        }
      } else {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        setShow(false);
        navigate("/profile", { state: { user } });
      }
    }
  };

  return (
    <>
      <Button variant="primary" onClick={toggleModal}>
        Log in
      </Button>

      <Modal show={show} onHide={toggleModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Log in</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {Object.values(error).length > 0 && (
            <Alert variant="danger">
              Please consider change the fields below
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!error.email}
              />
              {error.email && (
                <Form.Control.Feedback type="invalid">
                  {error.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!error.password}
              />
              {error.password && (
                <Form.Control.Feedback type="invalid">
                  {error.password}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={toggleModal}>
                Close
              </Button>
              <Button variant="success" type="submit">
                Log in
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Login;
