import {
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
    Header, IconButton,
    ModalCard,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Select,
    SplitLayout,
    Text
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {back, ModalRoot, push, replace, useParams} from "@itznevikat/router";
import {Icon24Add, Icon24ExternalLinkOutline, Icon56AddCircleOutline} from "@vkontakte/icons";

const RestaurantLayout = ({id, nav, token, apiRequest, popout}) => {
    const [restaurantData, setRestaurantData] = useState(undefined);
    const [profile, setProfile] = useState(undefined);
    const [tracks, setTracks] = useState(undefined);
    const [selectedTrack, setSelectedTrack] = useState(0);
    const {restaurant_id} = useParams();
    const [restaurantId, setRestaurantId] = useState(restaurant_id);

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
            }

            await fetchData();
        }, [token]
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
        apiRequest('tracks/create/', `restaurant_id=${restaurantId}&track_id=${selectedTrack}&`).then(() => {
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
                        <Button
                            size="l"
                            mode="primary"
                            onClick={() => addTrack()}
                        >
                            Добавить
                        </Button>
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
                    <PanelHeader left={<PanelHeaderBack onClick={() => replace("/catalogue")}/>} right={restaurantData.data.owner === profile.id && <IconButton><Icon24ExternalLinkOutline/></IconButton>}>Ресторан
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
