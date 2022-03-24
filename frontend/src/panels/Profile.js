import {
    Avatar,
    Cell,
    Footer, Gradient,
    Group,
    IconButton,
    Panel,
    PanelHeader,
    Search, SimpleCell,
    Text, Title
} from "@vkontakte/vkui";
import {
    Icon24ChevronRight,
    Icon24Filter,
    Icon24Search, Icon28MailOutline, Icon28PhoneOutline
} from "@vkontakte/icons";
import {useEffect, useState} from "react";
import {replace} from "@itznevikat/router";

const Profile = ({id, nav, token}) => {
    const [profile, setProfile] = useState({});

    useEffect(() => {
            function fetchData() {
                if (!token) {
                    replace("/login");
                    return;
                }
                const obj = {
                    id: 1,
                    name: "Ашот Камшот",
                    city: "Москва",
                    avatarUrl: "https://img-s3.onedio.com/id-58b42ae7b05db4070f77f174/rev-0/raw/s-249a5edb2c4739ffd306edf36e3d702b6bae5b67.jpg",
                    email: "g•••@gmail.com"
                };
                setProfile(obj);
            }

            fetchData();
        }, []
    )

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Профиль</PanelHeader>
            {profile &&
                <Group>
                    <Group mode={"plain"}>
                        <Gradient
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                padding: 32,
                            }}
                        >
                            <Avatar size={128} src={profile.avatarUrl}/>
                            <Title
                                style={{marginBottom: 8, marginTop: 20}}
                                level="1"
                                weight="medium"
                            >
                                {profile.name}
                            </Title>
                            <Title
                                level="3"
                                weight="3"
                            >
                                {profile.city}
                            </Title>
                        </Gradient>
                    </Group>
                    <Group mode="plain">
                        <SimpleCell
                            disabled
                            indicator={profile.email}
                            before={<Icon28MailOutline/>}
                        >
                            Email
                        </SimpleCell>
                    </Group>
                </Group>
            }
        </Panel>);
};

export default Profile;
