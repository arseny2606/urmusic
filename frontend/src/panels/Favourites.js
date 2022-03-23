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

const Favourites = ({id, nav}) => {
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
                const obj = [];
                for(let i = 0; i < 10; ++i) obj.push({id: i + 1, name: "Беляши у Ашота", address: "Проспект Мира, дом 228", tracks: 15, imageUrl: "https://img-s3.onedio.com/id-58b42ae7b05db4070f77f174/rev-0/raw/s-249a5edb2c4739ffd306edf36e3d702b6bae5b67.jpg"});
                setFavouriteObjects(obj);
            }

            fetchData();
        }, []
    )

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Избранное</PanelHeader>
            <Group>
                {favouriteObjects.length > 0 &&
                    favouriteObjects.map((object) => (
                        <Cell key={object.id} before={<Avatar mode="image" src={object.imageUrl} size={72} />} after={<Icon24ChevronRight/>} description={<Text>{object.address}<br/>{object.tracks} {getNoun(object.tracks, 'трек', 'трека', 'треков')} в очереди</Text>}><Text weight="medium" style={{fontSize: 16}}>{object.name}</Text></Cell>
                    ))}
                {favouriteObjects.length === 0 && <Footer>Здесь пока пусто.</Footer>}
            </Group>
        </Panel>);
};

export default Favourites;
