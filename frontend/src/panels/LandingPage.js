import {
    Card,
    Row,
    Container,
    Button,
    Stack,
    Collapse,
    ListGroup,
    Navbar,
    Nav
} from 'react-bootstrap';

import {useState} from "react";
import {replace} from "@itznevikat/router";

const LandingPage = ({id, nav, apiRequest}) => {
    const [about, setAbout] = useState(false);
    const [open, setOpen] = useState(false);

    const goToLogin = e => {
        e.preventDefault();
        replace('/login')
    }

    const goToRegister = e => {
        e.preventDefault();
        replace('/register')
    }

    return (
        <Stack gap={3}><>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
                integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
                crossOrigin="anonymous"
            />
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>UrMusic</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#">Тут пока ничего :(</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link onClick={goToRegister}>Регистрация</Nav.Link>
                            <Nav.Link onClick={goToLogin}>Вход</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
            <Container className="center">
                <Row className="justify-content-center">
                    <Card style={{marginTop: '5rem', marginBottom: '5rem'}}>
                        <Card.Body>
                            <Card.Title as='h1'>UrMusic</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted" as='h4'>О сайте</Card.Subtitle>
                            <Card.Text>
                                Тут можно будет написать душераздирающую историю о том, как мы пришли к этой идее, но
                                мне лень
                            </Card.Text>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <Button
                                        onClick={() => setAbout(!about)}
                                        aria-controls="example-collapse-text"
                                        aria-expanded={about}
                                        variant='link'
                                        style={{textDecoration: 'none'}}
                                    >
                                        О нас
                                    </Button>
                                    <Collapse in={about}>
                                        <div id="example-collapse-text">
                                            Тут что-то о нас, но мне всё ещё лень что-то думать
                                        </div>
                                    </Collapse>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Button
                                        onClick={() => setOpen(!open)}
                                        aria-controls="example-collapse-text"
                                        aria-expanded={open}
                                        variant='link'
                                        style={{textDecoration: 'none'}}
                                    >
                                        Хз чо тут написать придумайте потом
                                    </Button>
                                    <Collapse in={open}>
                                        <div id="example-collapse-text">
                                            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus
                                            terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer
                                            labore wes anderson cred nesciunt sapiente ea proident.
                                        </div>
                                    </Collapse>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Row>
            </Container></Stack>)
}

export default LandingPage;
