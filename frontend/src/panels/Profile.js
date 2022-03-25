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

const Profile = ({id, nav, token, apiRequest}) => {
    const [profile, setProfile] = useState({});

    useEffect(() => {
            function fetchData() {
                if (!token) {
                    if (!localStorage.getItem("token")) {
                        replace("/login");
                        return;
                    }
                }
                apiRequest("account/profile/").then(response => {
                    setProfile(response);
                })
            }

            fetchData();
        }, [token]
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
                            <Avatar size={128} src={profile.avatar_url}/>
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
