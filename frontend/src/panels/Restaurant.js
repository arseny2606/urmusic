import {
    Card,
    CardGrid,
    Cell, CellButton,
    ContentCard,
    Footer,
    Group,
    Header,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Text
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {replace, useParams} from "@itznevikat/router";
import {Icon24Add} from "@vkontakte/icons";

const Restaurant = ({id, nav, token, apiRequest}) => {
    const [restaurantData, setRestaurantData] = useState(undefined);
    const [profile, setProfile] = useState(undefined);
    const {restaurant_id} = useParams();

    const getNoun = (number, one, two, five) => {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) {
            return five;
        }
        n %= 10;
        if (n === 1) {
            return one;
        }
        if (n >= 2 && n <= 4) {
            return two;
        }
        return five;
    }

    function zfill(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }


    useEffect(async () => {
            async function fetchData() {
                if (!token) {
                    if (!localStorage.getItem("token")) {
                        replace("/login");
                        return;
                    }
                }
                apiRequest("account/profile").then(response => {
                   setProfile(response);
                });
                apiRequest(`restaurants/get/?id=${restaurant_id}&`).then(async response => {
                    if (response.error) {
                        replace("/catalogue");
                        return;
                    }
                    for (let i = 0; i < response.tracks.length; ++i) {
                        const duration = await getDuration(response.tracks[i].track_data.track_url);
                        response.tracks[i].track_data.duration = `${zfill(parseInt(duration / 60), 2)}:${zfill(parseInt(duration) % 60, 2)}`;
                    }
                    setRestaurantData(response);
                });
            }

            await fetchData();
        }, [token]
    )

    function getDuration(src) {
        return new Promise(function (resolve) {
            const audio = new Audio();
            audio.addEventListener("loadedmetadata", function () {
                resolve(audio.duration);
            });
            audio.src = src;
        });
    }

    const deleteTrack = (id) => {
        apiRequest("tracks/delete", `order_id=${id}`).then(() => {
            apiRequest(`restaurants/get/?id=${restaurant_id}&`).then(async response => {
                console.log(response);
                if (response.error) {
                    replace("/catalogue");
                    return;
                }
                for (let i = 0; i < response.tracks.length; ++i) {
                    const duration = await getDuration(response.tracks[i].track_data.track_url);
                    response.tracks[i].track_data.duration = `${zfill(parseInt(duration / 60), 2)}:${zfill(parseInt(duration) % 60, 2)}`;
                }
                setRestaurantData(response);
            });
        })
    }

    return (
        <Panel id={id} nav={nav}>
            {restaurantData && <>
                <PanelHeader left={<PanelHeaderBack onClick={() => replace("/catalogue")}/>}>Ресторан
                    «{restaurantData.data.name}»</PanelHeader>
                <Group>
                    <CardGrid size="l">
                        <ContentCard
                            onClick={() => {
                            }}
                            hasHover={false}
                            hasActive={false}
                            onEnter={() => {
                            }}
                            src={restaurantData.data.image_url}
                            subtitle={restaurantData.data.address}
                            header={restaurantData.data.name}
                            text={restaurantData.data.description}
                            maxHeight={500}
                        />
                        <Card mode="shadow">
                            <Group header={<Header>Очередь треков</Header>} mode={"plain"}>
                                {restaurantData.tracks.length > 0 && <>{
                                    restaurantData.tracks.map((track) => (
                                        <Cell key={track.id} disabled mode={track.owner === profile.id ? "removable" : ""} onRemove={() => deleteTrack(track.id)}
                                            // before={<Avatar mode="image" src={object.image_url} size={72}/>}
                                              after={<Text>{track.track_data.duration}</Text>}
                                              description={
                                                  <Text>{track.track_data.artist}</Text>}> <Text
                                            weight="medium"
                                            style={{fontSize: 16}}>{track.track_data.title}</Text></Cell>
                                    ))}
                                    <Footer>{restaurantData.tracks.length} {getNoun(restaurantData.tracks.length, "трек", "трека", "треков")}</Footer></>}
                                {restaurantData.tracks.length === 0 && <Footer>Ничего не найдено</Footer>}
                                <CellButton before={<Icon24Add/>}>Добавить трек</CellButton>
                            </Group>
                        </Card>
                    </CardGrid>
                </Group>
            </>}
        </Panel>);
};

export default Restaurant;
