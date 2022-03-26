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
        <Panel id={id} nav={nav}>
            {!started && <button onClick={() => setStarted(true)}>start</button>}
            {restaurantData && <>
                <div>
                    <p>Playing</p>
                </div>
            </>}
        </Panel>
    );
};

export default AudioPlayer;
