import {
    Avatar,
    Cell,
    Footer,
    Group,
    Panel,
    PanelHeader,
    Text
} from "@vkontakte/vkui";
import {Icon24ChevronRight} from "@vkontakte/icons";
import {useEffect, useState} from "react";
import {push, replace} from "@itznevikat/router";

const Favourites = ({id, nav, token, apiRequest}) => {
    const [favouriteObjects, setFavouriteObjects] = useState([]);

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
                apiRequest("restaurants/favourites/").then(response => {
                    setFavouriteObjects(response.data);
                })
            }

            fetchData();
        }, [token]
    )

    const getFavouriteObjects = () => {
        return favouriteObjects
    }

    const goToRestaurant = (e) => {
        push(`/restaurant?restaurant_id=${e.currentTarget.dataset.to}`);
    }

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Избранное</PanelHeader>
            <Group>
                {getFavouriteObjects().length > 0 && <> {
                    getFavouriteObjects().map((object) => (
                        <Cell key={object.id} before={<Avatar mode="image" src={object.image_url} size={72}/>}
                              after={<Icon24ChevronRight/>} description={
                            <Text>{object.address}<br/>{object.tracks_count} {getNoun(object.tracks_count, 'трек', 'трека', 'треков')} в
                                очереди</Text>} onClick={goToRestaurant} data-to={object.id}><Text weight="medium"
                                                                                                   style={{fontSize: 16}}>{object.name}</Text></Cell>
                    ))}
                    <Footer>{getFavouriteObjects().length} {getNoun(getFavouriteObjects().length, "ресторан", "ресторана", "ресторанов")}</Footer>
                </>
                }
                {getFavouriteObjects().length === 0 && <Footer>Здесь пока пусто.</Footer>}
            </Group>
        </Panel>);
};

export default Favourites;
