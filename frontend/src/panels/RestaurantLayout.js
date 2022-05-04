import {
    Alert,
    Button,
    Card,
    CardGrid,
    Cell,
    CellButton,
    ContentCard,
    CustomSelectOption,
    Footer,
    FormItem,
    Group,
    Header,
    IconButton,
    ModalCard,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Select,
    SplitLayout,
    Text
} from "@vkontakte/vkui";
import React, {useEffect, useState} from "react";
import {back, ModalRoot, push, replace, useParams} from "@itznevikat/router";
import {Icon24Add, Icon24ExternalLinkOutline, Icon56AddCircleOutline} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";
import {TextTooltip} from "@vkontakte/vkui/unstable";
import "@vkontakte/vkui/dist/unstable.css";

const RestaurantLayout = ({id, nav, token, apiRequest, popout, setPopout, isVK}) => {
    const [restaurantData, setRestaurantData] = useState(undefined);
    const [profile, setProfile] = useState(undefined);
    const [tracks, setTracks] = useState(undefined);
    const [selectedTrack, setSelectedTrack] = useState(0);
    const {restaurant_id} = useParams();
    const [restaurantId, setRestaurantId] = useState(restaurant_id);
    const [position, setPosition] = useState({});
    const [addingAllowed, setAddingAllowed] = useState({checked: false, allowed: false});

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
                    setRestaurantData(response);
                });
                apiRequest('tracks/all/').then(response => {
                    setTracks(response.data);
                });
                if (!isVK) {
                    navigator.geolocation.getCurrentPosition((e) => {
                        setPosition({lat: e.coords.latitude, lon: e.coords.longitude});
                    }, () => {
                        setPopout(<Alert
                            actions={[{
                                title: 'Хорошо',
                                mode: 'default',
                                action: () => setPopout(null)
                            }]}
                            actionsLayout="vertical"
                            header="Ошибка"
                            text="Вы не предоставили доступ к геолокации. Добавление треков невозможно, пока вы не подтвердите нахождение в заведении."
                            onClose={() => setPopout(null)}
                        />);
                    });
                } else {
                    const data = await bridge.send("VKWebAppGetGeodata").catch(e => {
                        setPopout(<Alert
                            actions={[{
                                title: 'Хорошо',
                                mode: 'default',
                                action: () => setPopout(null)
                            }]}
                            actionsLayout="vertical"
                            header="Ошибка"
                            text="Вы не предоставили доступ к геолокации. Добавление треков невозможно, пока вы не подтвердите нахождение в заведении."
                            onClose={() => setPopout(null)}
                        />);
                        return {};
                    });
                    if (data) {
                        setPosition({lat: data.lat, lon: data.long});
                    }
                }
                if (!addingAllowed.checked){
                    if (Object.keys(position).length === 0) {
                        return;
                    }
                    apiRequest('restaurants/checkgeodata/', `restaurant_id=${restaurant_id}&lat=${position.lat}&lon=${position.lon}`).then(response => {
                        setAddingAllowed({checked: true, allowed: response.response});
                        if (!response.response){
                            setPopout(<Alert
                                actions={[{
                                    title: 'Хорошо',
                                    mode: 'default',
                                    action: () => setPopout(null)
                                }]}
                                actionsLayout="vertical"
                                header="Информация"
                                text="Вы не находитесь в данном заведении. Вам доступен только просмотр очереди треков."
                                onClose={() => setPopout(null)}
                            />);
                        }
                    })
                }
            }

            await fetchData();
        }, [token, isVK, position]
    )

    const deleteTrack = (id) => {
        apiRequest("tracks/delete", `order_id=${id}`).then(() => {
            apiRequest(`restaurants/get/?id=${restaurant_id}&`).then(async response => {
                if (response.error) {
                    replace("/catalogue");
                    return;
                }
                setRestaurantData(response);
            });
        })
    }

    const showTracksModal = () => {
        apiRequest('tracks/all/').then(response => {
            setTracks(response.data);
            push("?modal=addtrack");
        });
    }

    const changeSelectedTrack = (e) => {
        setSelectedTrack(e.currentTarget.value);
    }

    const addTrack = () => {
        back();
        if (!selectedTrack) return;
        apiRequest('tracks/create/', `restaurant_id=${restaurantId}&track_id=${selectedTrack}&lon=${position.lon}&lat=${position.lat}&`).then(() => {
            apiRequest(`restaurants/get/?id=${restaurantId}&`).then(async response => {
                if (response.error) {
                    replace("/catalogue");
                    return;
                }
                setRestaurantData(response);
            });
        });
    }

    return (
        <SplitLayout nav={"/restaurant"} popout={popout} modal={
            <ModalRoot>
                <ModalCard
                    nav={"addtrack"}
                    icon={<Icon56AddCircleOutline/>}
                    header="Добавить трек в очередь"
                    subheader="Новый трек сыграет сразу после того, как доиграют уже добавленные."
                    actions={
                        <>
                            {
                                addingAllowed.allowed ? <Button
                                        size="l"
                                        mode="primary"
                                        onClick={() => addTrack()}
                                        disabled={!addingAllowed.allowed || !selectedTrack}
                                    >
                                        Добавить
                                    </Button> :
                                    <TextTooltip text="Вы не подтвердили нахождение в заведении." placement={"top"}>
                                        <Button
                                            size="l"
                                            mode="primary"
                                            onClick={() => addTrack()}
                                            disabled={!addingAllowed.allowed || !selectedTrack}
                                        >
                                            Добавить
                                        </Button>
                                    </TextTooltip>
                            }
                        </>
                    }
                >
                    <Group>
                        {tracks &&
                            <FormItem top="Трек">
                                <Select
                                    placeholder="Не выбран"
                                    searchable={true}
                                    emptyText="Нет треков"
                                    onChange={changeSelectedTrack}
                                    options={tracks.map(track => ({
                                        label: `${track.artist} - ${track.title}`,
                                        value: track.id
                                    }))}
                                    renderOption={({option, ...restProps}) => (
                                        <CustomSelectOption {...restProps}
                                            // before={<Avatar size={24} src={option.avatar}/>}
                                        />
                                    )}
                                />
                            </FormItem>
                        }
                    </Group>
                </ModalCard>
            </ModalRoot>
        }>
            <Panel id={id} nav={nav}>
                {restaurantData && <>
                    <PanelHeader left={<PanelHeaderBack onClick={() => replace("/catalogue")}/>}
                                 right={restaurantData.data.owner === profile.id && <IconButton
                                     onClick={() => push(`/audioplayer?restaurant_id=${restaurant_id}`)}><Icon24ExternalLinkOutline/></IconButton>}>Ресторан
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
                                            <Cell key={track.id} disabled
                                                  mode={track.owner === profile.id ? "removable" : ""}
                                                  onRemove={() => deleteTrack(track.id)}
                                                // before={<Avatar mode="image" src={object.image_url} size={72}/>}
                                                  after={<Text>{track.track_data.duration}</Text>}
                                                  description={
                                                      <Text>{track.track_data.artist}</Text>}> <Text
                                                weight="medium"
                                                style={{fontSize: 16}}>{track.track_data.title}</Text></Cell>
                                        ))}
                                        <Footer>{restaurantData.tracks.length} {getNoun(restaurantData.tracks.length, "трек", "трека", "треков")}</Footer></>}
                                    {restaurantData.tracks.length === 0 && <Footer>Ничего не найдено</Footer>}
                                    <CellButton before={<Icon24Add/>} onClick={() => showTracksModal()}>Добавить
                                        трек</CellButton>
                                </Group>
                            </Card>
                        </CardGrid>
                    </Group>
                </>}
            </Panel>
        </SplitLayout>);
};

export default RestaurantLayout;
