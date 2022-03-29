import {
    Avatar,
    Cell,
    Footer,
    Group,
    IconButton,
    Panel,
    PanelHeader,
    PanelHeaderButton,
    Search,
    Text
} from "@vkontakte/vkui";
import {
    Icon24ChevronRight,
    Icon24Filter,
    Icon24Search
} from "@vkontakte/icons";
import {useEffect, useState} from "react";
import {push, replace} from "@itznevikat/router";

const Catalogue = ({id, nav, token, apiRequest}) => {
    const [search, setSearch] = useState("");
    const [objects, setObjects] = useState([]);

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

    useEffect(() => {
            function fetchData() {
                if (!token) {
                    if (!localStorage.getItem("token")) {
                        replace("/login");
                        return;
                    }
                }
                apiRequest("restaurants/all/").then(response => {
                    setObjects(response.data);
                })
            }

            fetchData();
        }, [token]
    )

    const onChange = (e) => {
        setSearch(e.target.value);
    }

    const getObjects = () => {
        if (!objects.length) return objects;
        return objects.filter(({name}) => name.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }

    const goToRestaurant = (e) => {
        push(`/restaurant?restaurant_id=${e.currentTarget.dataset.to}`);
    }

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader
            left={<IconButton><Icon24Filter/></IconButton>}>Каталог</PanelHeader>
            {objects.length > 0 &&
                <Group>
                    <Search
                        value={search}
                        onChange={onChange}
                        icon={<Icon24Search/>}
                    />
                    {getObjects().length > 0 && <>{
                        getObjects().map((object) => (
                            <Cell key={object.id} before={<Avatar mode="image" src={object.image_url} size={72}/>}
                                  after={<Icon24ChevronRight/>} description={
                                <Text>{object.address}<br/>{object.tracks_count} {getNoun(object.tracks_count, 'трек', 'трека', 'треков')} в
                                    очереди</Text>} onClick={goToRestaurant} data-to={object.id}><Text weight="medium"
                                                          style={{fontSize: 16}}>{object.name}</Text></Cell>
                        ))}
                        <Footer>{getObjects().length} {getNoun(getObjects().length, "ресторан", "ресторана", "ресторанов")}</Footer>
                        </>
                    }
                    {getObjects().length === 0 && <Footer>Ничего не найдено</Footer>}
                </Group>
            }
        </Panel>);
};

export default Catalogue;
