import {ContentCard, Group, Panel, PanelHeader, PanelHeaderBack} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {replace, useParams} from "@itznevikat/router";

const Restaurant = ({id, nav, token, apiRequest}) => {
    const [restaurantData, setRestaurantData] = useState(undefined);
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

    useEffect(() => {
            function fetchData() {
                if (!token) {
                    if (!localStorage.getItem("token")) {
                        replace("/login");
                        return;
                    }
                }
                apiRequest(`restaurants/get/?id=${restaurant_id}&`).then(response => {
                    console.log(response);
                    if (response.error) {
                        replace("/catalogue");
                        return;
                    }
                    setRestaurantData(response);
                });
            }

            fetchData();
        }, [token]
    )

    return (
        <Panel id={id} nav={nav}>
            {restaurantData && <>
                <PanelHeader left={<PanelHeaderBack onClick={() => replace("/catalogue")}/>}>Ресторан
                    «{restaurantData.data.name}»</PanelHeader>
                <Group>
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
                </Group>
            </>}
        </Panel>);
};

export default Restaurant;
