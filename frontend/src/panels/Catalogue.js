import {
    Avatar,
    Cell,
    Div, Footer,
    Group, IconButton,
    Panel,
    PanelHeader,
    Search, Text
} from "@vkontakte/vkui";
import {Icon24ChevronRight, Icon24Filter, Icon24Search} from "@vkontakte/icons";
import {useEffect, useState} from "react";

const Catalogue = ({id, nav, platform}) => {
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
                const obj = [];
                for(let i = 0; i < 10; ++i) obj.push({id: 1, name: "Беляши у Ашота", address: "Проспект Мира, дом 228", tracks: 15, imageUrl: "https://img-s3.onedio.com/id-58b42ae7b05db4070f77f174/rev-0/raw/s-249a5edb2c4739ffd306edf36e3d702b6bae5b67.jpg"});
                setObjects(obj);
            }

            fetchData();
        }, []
    )

    const onChange = (e) => {
        setSearch(e.target.value);
    }

    const getObjects = () => {
        if (!objects.length) return objects;
        return objects.filter(({name}) => name.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }

    const onFiltersClick = () => this.setState({activeModal: "filters"});
    return (
        <Panel id={id} nav={nav}>
            <PanelHeader left={<IconButton><Icon24Filter/></IconButton>}>Каталог</PanelHeader>
            <Group style={{height: "1000px"}}>
                <Search
                    value={search}
                    onChange={onChange}
                    icon={<Icon24Search/>}
                    onIconClick={onFiltersClick}
                />
                {getObjects().length > 0 &&
                    getObjects().map((object) => (
                        <Cell key={object.id} before={<Avatar mode="image" src={object.imageUrl} size={72} />} after={<Icon24ChevronRight/>} description={<Text>{object.address}<br/>{object.tracks} {getNoun(object.tracks, 'трек', 'трека', 'треков')} в очереди</Text>}><Text weight="medium" style={{fontSize: 16}}>{object.name}</Text></Cell>
                    ))}
                {getObjects().length === 0 && <Footer>Ничего не найдено</Footer>}
            </Group>
        </Panel>);
};

export default Catalogue;
