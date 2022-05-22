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

import {Panel} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {replace, useParams} from "@itznevikat/router";

const AudioPlayer = ({id, nav, token, apiRequest}) => {
    const [restaurantData, setRestaurantData] = useState(undefined);
    const [profile, setProfile] = useState(undefined);
    const {restaurant_id} = useParams();
    const [audio] = useState(new Audio());
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);

    const toggle = () => setPlaying(!playing);

    const setUrl = (newUrl, playingAudioID) => {
        if (!playing) {
            audio.src = newUrl;
            audio.dataset.id = playingAudioID;
            toggle();
        }
    }

    useEffect(() => {
            if (audio.src) playing ? audio.play() : audio.pause();
        },
        [playing]
    );

    useEffect(() => {
        if (!playing) {
            audio.addEventListener('ended', () => {
                setPlaying(false);
                apiRequest("tracks/delete", `order_id=${audio.dataset.id}`).then(() => {
                    console.log("ended", audio.paused);
                })
            });
            return () => {
                audio.removeEventListener('ended', () => setPlaying(false));
            };
        }
    }, []);

    useEffect(async () => {
            function fetchData() {
                if (!started) return;
                if (!audio.paused || (audio.currentTime && !audio.ended)) return;
                if (!token) {
                    if (!localStorage.getItem("token")) {
                        replace("/login");
                        return;
                    }
                }
                apiRequest("account/profile").then(r => {
                    setProfile(r);
                    apiRequest(`restaurants/get/?id=${restaurant_id}&`).then(async response => {
                        if (response.error) {
                            replace("/catalogue");
                            return;
                        }
                        if (response.data.owner !== r.id) {
                            replace("/catalogue");
                            return;
                        }
                        setRestaurantData(response);
                        if (response.tracks.length) {
                            if (audio.paused) {
                                console.log("started");
                                setUrl(response.tracks[0].track_data.track_url, response.tracks[0].id);
                            }
                        }
                    });
                });
            }

            setInterval(fetchData, 2000);
        }, [token, playing, started]
    )
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
                        <Nav.Link href="#"></Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link>Название ресторана</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        </>
        <Panel id={id} nav={nav}>
            <Container className="center">
                <Row className="justify-content-center">
                    <Card style={{marginTop: '5rem', marginBottom: '5rem'}}>
                        <Card.Body>
                            <Card.Title>
                                Плеер ресторана
                            </Card.Title>
                            <Card.Subtitle>Сейчас играет:</Card.Subtitle>
                            <Card.Text>
                                {}
                            </Card.Text>
                            <div className="d-grid gap-1">
                                {!started && <Button variant="primary" size="lg" onClick={() => setStarted(true)}>start</Button>}
                            </div>
                            {restaurantData && <>
                                <div>
                                    <p>Playing</p>
                                </div>
                            </>}
                        </Card.Body>
                    </Card>
                </Row>
            </Container>
        </Panel>
        </Stack>
    );
};

export default AudioPlayer;
