import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    AdaptivityProvider, Alert,
    AppRoot,
    Cell,
    ConfigProvider,
    Group,
    Panel,
    PanelHeader,
    ScreenSpinner,
    SplitCol,
    SplitLayout,
    Tabbar,
    TabbarItem,
    usePlatform,
    VKCOM
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import {Epic, Match, push, replace, Root} from "@itznevikat/router";
import {Icon28FavoriteOutline, Icon28MenuOutline, Icon28UserOutline,} from "@vkontakte/icons";
import Catalogue from "./panels/Catalogue";
import Favourites from "./panels/Favourites";
import Profile from "./panels/Profile";
import axios from "axios";
import Login from "./panels/Login";

const App = () => {
    const platform = usePlatform();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [isVK, setIsVK] = useState(true);
    const [activeStory, setActiveStory] = useState("catalogue");
    const [token, setToken] = useState("");
    const apiURL = "http://127.0.0.1:8000";
    const onStoryChange = (e) => {
        setActiveStory(e.currentTarget.dataset.story);
        push(`/${e.currentTarget.dataset.story}`);
    }
    const hasHeader = platform !== VKCOM;

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === "webpackOK" && isVK) {
                setIsVK(false);
                setPopout(null);
                if (localStorage.getItem("token")){
                    setToken(localStorage.getItem("token"));
                    replace("/catalogue");
                }
                else{
                    replace("/login");
                }
            }
            if (type === 'VKWebAppUpdateConfig') {
                const schemeAttribute = document.createAttribute('scheme');
                schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
                document.body.attributes.setNamedItem(schemeAttribute);
            }
        });

        function fetchData() {
            bridge.send('VKWebAppGetUserInfo').then(user => {
                setIsVK(true);
                setFetchedUser(user);
                replace("/catalogue");
            });
            setPopout(null);
        }

        fetchData();
    }, []);

    const go = e => {
        push(`/${e.currentTarget.dataset.to}`);
    };

    const exitApp = () => {
        bridge.send("VKWebAppClose", { "status": "failed", "payload": { "name": "test" } });
    }

    const apiRequest = async function (method, params, tokend = undefined) {
        try {
            const config = {
                headers: {
                    Authorization: `Token ${tokend ? tokend : token}`,
                }
            }
            if (!method.endsWith("/")) method = method + "/";
            const paramsURL = new URLSearchParams();
            for(const i of params.split("&")){
                if (i.split("=")[0]) paramsURL.append(i.split("=")[0], i.split("=")[1]);
            }
            return await axios.post(`${apiURL}/api/${method}`, paramsURL, config).then(response => {
                return response.data
            });
        }
        catch (e) {
            if (e.response.status === 401 || e.response.status === 500 || e.response.status === 502) {
                setPopout(<Alert
                    actions={[{
                        title: 'Выйти из приложения',
                        mode: 'default',
                        action: () => exitApp(),
                    }]}
                    actionsLayout="vertical"
                    header="Ошибка"
                    text={e.response.data.error}
                    onClose={() => exitApp()}
                />);
            }
            else if (e.response.status === 429 || e.response.status === 400) {
                setPopout(<Alert
                    actions={[{
                        title: 'Хорошо',
                        mode: 'default',
                        action: () => setPopout(null)
                    }]}
                    actionsLayout="vertical"
                    header="Ошибка"
                    text={e.response.data.error}
                    onClose={() => setPopout(null)}
                />);
            }
            else {
                return e.response.data;
            }
        }
    };

    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <AppRoot>
                    <Match initialURL={"/login"}>
                        <Root nav="/">
                            <SplitLayout
                                header={hasHeader && <PanelHeader separator={false}/>}
                                style={{justifyContent: "center"}}
                                nav={"/"}
                                popout={popout}
                            >
                                {!isVK && (
                                    <SplitCol fixed width={280} maxWidth={280}>
                                        <Panel>
                                            {hasHeader && <PanelHeader/>}
                                            <Group>
                                                <Cell
                                                    disabled={activeStory === "catalogue"}
                                                    style={
                                                        activeStory === "catalogue"
                                                            ? {
                                                                backgroundColor: "var(--button_secondary_background)",
                                                                borderRadius: 8,
                                                            }
                                                            : {}
                                                    }
                                                    data-story="catalogue"
                                                    onClick={onStoryChange}
                                                    before={<Icon28MenuOutline/>}
                                                >
                                                    Каталог
                                                </Cell>
                                                <Cell
                                                    disabled={activeStory === "favourites"}
                                                    style={
                                                        activeStory === "favourites"
                                                            ? {
                                                                backgroundColor: "var(--button_secondary_background)",
                                                                borderRadius: 8,
                                                            }
                                                            : {}
                                                    }
                                                    data-story="favourites"
                                                    onClick={onStoryChange}
                                                    before={<Icon28FavoriteOutline/>}
                                                >
                                                    Избранное
                                                </Cell>
                                                <Cell
                                                    disabled={activeStory === "profile"}
                                                    style={
                                                        activeStory === "profile"
                                                            ? {
                                                                backgroundColor: "var(--button_secondary_background)",
                                                                borderRadius: 8,
                                                            }
                                                            : {}
                                                    }
                                                    data-story="profile"
                                                    onClick={onStoryChange}
                                                    before={<Icon28UserOutline/>}
                                                >
                                                    Профиль
                                                </Cell>
                                            </Group>
                                        </Panel>
                                    </SplitCol>
                                )}

                                <SplitCol>
                                    <Epic
                                        nav={"/"}
                                        activeStory={activeStory}
                                        tabbar={
                                            isVK && (
                                                <Tabbar>
                                                    <TabbarItem
                                                        onClick={onStoryChange}
                                                        selected={activeStory === "catalogue"}
                                                        data-story="catalogue"
                                                        text="Каталог"
                                                    >
                                                        <Icon28MenuOutline/>
                                                    </TabbarItem>
                                                    <TabbarItem
                                                        onClick={onStoryChange}
                                                        selected={activeStory === "favourites"}
                                                        data-story="favourites"
                                                        text="Избранное"
                                                    >
                                                        <Icon28FavoriteOutline/>
                                                    </TabbarItem>
                                                    <TabbarItem
                                                        onClick={onStoryChange}
                                                        selected={activeStory === "profile"}
                                                        data-story="profile"
                                                        text="Профиль"
                                                    >
                                                        <Icon28UserOutline/>
                                                    </TabbarItem>
                                                </Tabbar>
                                            )
                                        }
                                    >
                                        <Catalogue id={"catalogue"} nav={"/catalogue"} token={token}/>
                                        <Favourites id={"favourites"} nav={"/favourites"} token={token}/>
                                        <Profile id={"profile"} nav={"/profile"} token={token}/>
                                    </Epic>
                                </SplitCol>
                            </SplitLayout>
                            <SplitLayout nav={"/login"} popout={popout}>
                                <Login nav={"/login"} id={"login"} apiRequest={apiRequest} setToken={setToken}/>
                            </SplitLayout>
                        </Root>
                    </Match>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
};

export default App;
