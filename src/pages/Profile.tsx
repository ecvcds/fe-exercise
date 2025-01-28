import React, { useEffect, useState } from "react";
import { Modal, Navbar, Spinner } from "react-bootstrap";
import {
  Alert,
  Card,
  Col,
  Row,
  Button,
  Container,
  Stack,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Post {
  id: string;
  userId: string;
  postedAt: string;
  title: string;
  text: string;
}

/**
 * Profile component to display user profile and posts
 */
export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (!storedUser) {
      console.warn("No user found in localStorage, redirecting...");
      navigate("/");
    } else {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        getPosts(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/");
      }
    }
  }, []);

  /**
   * Fetches and sets the posts for a given user, sorted in reverse chronological order.
   *  The user whose posts are to be fetched.
   * This function sends a request to the backend to retrieve all posts,
   * filters the posts to include only those belonging to the specified user,
   * sorts them by their posting date from newest to oldest, and updates the
   * state with these posts. If an error occurs during the fetch operation,
   * it logs the error and sets an error message in the state.
   */

  const getPosts = async (user: User) => {
    try {
      const response = await fetch("http://localhost:5001/posts");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const userPosts = data
        .filter((post: Post) => post.userId === user.id)
        .sort(
          (a: Post, b: Post) =>
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        );

      setPosts(userPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
    }
  };

  const handleModalToggle = () => setShowModal(!showModal);

  /**
   * Handles the change event for input and textarea fields.
   * Updates the newPost state with the changed input values.
   */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  /**
   * Handles the form submission for adding a new post.
   *
   * This function validates the new post data, constructs a post object,
   * sends it to the backend, and updates the application state based on the
   * response. If the post submission is successful, it adds the new post to
   * the existing list of posts and displays a success message. If submission
   * fails, it logs the error and can set an error message. It also manages
   * loading state and modal visibility.
   *
   */

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.text) {
      setError("Both title and content are required.");
      return;
    }
    setIsLoading(true);
    const newPostData = {
      userId: user?.id,
      title: newPost.title,
      text: newPost.text,
      postedAt: new Date().toISOString(),
    };
    try {
      const response = await fetch("http://localhost:5001/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPostData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit post, status: ${response.status}`);
      }

      const addedPost = await response.json();
      setPosts([addedPost, ...posts]);
      setSuccess("Your post has been successfully added!");
      setError(null);
    } catch (err) {
      console.error("Error adding post:", err);
    } finally {
      if (user) {
        await getPosts(user);
      }
      setError(null);
      setNewPost({ title: "", text: "" });
      setIsLoading(false);
      setShowModal(false);
    }
  };

  /**
   * Logs out the current user by removing their data from local storage and redirects to the login page.
   *
   * This function clears the "loggedInUser" key from local storage, effectively logging the user out,
   * and then navigates the user back to the home page ("/"), which is typically the login screen.
   */

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const handleDeletePost = async (postId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post, status: ${response.status}`);
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setSuccess("Your post has been successfully deleted!");
      setError(null);
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      if (user) {
        await getPosts(user);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      {user ? (
        <>
          <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
            <Container>
              <Navbar.Brand>
                Welcome, {user.firstName} {user.lastName}!
              </Navbar.Brand>
              <Button
                variant="danger"
                onClick={handleLogout}
                className="ms-auto"
              >
                Logout
              </Button>
            </Container>
          </Navbar>

          <Container className="mt-5">
            <Stack className="m-3" direction="horizontal" gap={3}>
              <h3>Your Posts</h3>
              <Button
                variant="primary"
                className="ms-auto"
                onClick={handleModalToggle}
              >
                Add New Post
              </Button>
            </Stack>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {posts.length > 0 ? (
              <Row>
                {posts.map((post, index) => (
                  <Col md={6} lg={4} key={index} className="mb-4">
                    <Card>
                      <Card.Body>
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Text>{post.text}</Card.Text>
                      </Card.Body>
                      <Card.Footer className="text-muted">
                        Posted on {new Date(post.postedAt).toLocaleDateString()}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="ms-3"
                        >
                          Delete
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">You have no posts yet.</Alert>
            )}

            {/* New Post Modal */}
            <Modal show={showModal} onHide={handleModalToggle}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Post</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handlePostSubmit}>
                  <Form.Group controlId="postTitle" className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={newPost.title}
                      onChange={handleInputChange}
                      placeholder="Enter post title"
                      isInvalid={!newPost.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      Title is required.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group controlId="postText" className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="text"
                      value={newPost.text}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter post text"
                      isInvalid={!newPost.text}
                    />
                    <Form.Control.Feedback type="invalid">
                      Content is required.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Submit Post"
                    )}
                  </Button>
                </Form>
              </Modal.Body>
            </Modal>
          </Container>
        </>
      ) : (
        <Alert variant="danger">User not found</Alert>
      )}
    </>
  );
};

export default Profile;
