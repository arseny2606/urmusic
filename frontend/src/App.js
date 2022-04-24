import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    AdaptivityProvider,
    Alert,
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
import {
    Icon28DoorArrowRightOutline,
    Icon28FavoriteOutline,
    Icon28MenuOutline,
    Icon28UserOutline,
} from "@vkontakte/icons";
import Catalogue from "./panels/Catalogue";
import Favourites from "./panels/Favourites";
import Profile from "./panels/Profile";
import axios from "axios";
import Login from "./panels/Login";
import Register from "./panels/Register";
import VkLogin from "./panels/VkLogin";
import VkRegister from "./panels/VkRegister";
import RestaurantLayout from "./panels/RestaurantLayout";
import {WebviewType} from "@vkontakte/vkui/dist/components/ConfigProvider/ConfigProviderContext";
import AudioPlayer from "./panels/AudioPlayer";
import LandingPage from "./panels/LandingPage";

const App = () => {
    const platform = usePlatform();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [isVK, setIsVK] = useState(false);
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
            if (type === "webpackOk") {
                setIsVK(false);
                setPopout(null);
                if (localStorage.getItem("token")) {
                    setToken(localStorage.getItem("token"));
                    if (document.location.hash === "#/" || !document.location.hash) replace("/catalogue");
                    else {
                        setActiveStory(document.location.hash.substring(2));
                    }
                }
            }
            if (type === 'VKWebAppUpdateConfig') {
                const schemeAttribute = document.createAttribute('scheme');
                schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
                document.body.attributes.setNamedItem(schemeAttribute);
            }
        });

        function fetchData() {
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
            }
            bridge.send('VKWebAppGetUserInfo').then(user => {
                setIsVK(true);
                setFetchedUser(user);
                replace("/vklogin", {params: window.location.search.slice(1), hash: document.location.hash});
            });
        }

        fetchData();
    }, []);

    const go = e => {
        push(`/${e.currentTarget.dataset.to}`);
    };

    const exitApp = () => {
        bridge.send("VKWebAppClose", {"status": "failed", "payload": {"name": "test"}});
    }

    const apiRequest = async function (method, params = "", tokend = undefined, additionalData = {}) {
        try {
            if (!token) {
                if (localStorage.getItem("token")) {
                    setToken(localStorage.getItem("token"));
                    tokend = localStorage.getItem("token");
                }
            }
            const config = {
                headers: {
                    Authorization: `Token ${tokend ? tokend : token}`,
                }
            }
            if (!method.endsWith("/")) method = method + "/";
            const paramsURL = new URLSearchParams();
            for (const i of params.split("&")) {
                if (i.split("=")[0]) paramsURL.append(i.split("=")[0], i.split("=")[1]);
            }
            for (const i in additionalData) {
                paramsURL.append(i, additionalData[i]);
            }
            return await axios.post(`${apiURL}/api/${method}`, paramsURL, config).then(response => {
                return response.data
            });
        } catch (e) {
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
            } else if (e.response.status === 429 || e.response.status === 400) {
                if (e.response.data.error === "Вы не можете добавлять треки в очередь другого ресторана.") {
                    setPopout(<Alert
                        actions={[{
                            title: 'Удалить треки из другого ресторана',
                            mode: 'default',
                            action: async () => {
                                const paramsURL = new URLSearchParams();
                                for (const i of params.split("&")) {
                                    if (i.split("=")[0]) paramsURL.append(i.split("=")[0], i.split("=")[1]);
                                }
                                for (const i in additionalData) {
                                    paramsURL.append(i, additionalData[i]);
                                }
                                paramsURL.append("force", true);
                                const config = {
                                    headers: {
                                        Authorization: `Token ${tokend ? tokend : token}`,
                                    }
                                }
                                await axios.post(`${apiURL}/api/${method}`, paramsURL, config).then(response => {
                                    setPopout(null);
                                    window.location.reload();
                                    return response.data;
                                })
                            }
                        },
                            {
                                title: 'Хорошо',
                                mode: 'default',
                                action: () => setPopout(null)
                            }]}
                        actionsLayout="vertical"
                        header="Ошибка"
                        text={e.response.data.error}
                        onClose={() => setPopout(null)}
                    />);
                } else {
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
            } else {
                return e.response.data;
            }
        }
    };

    const logout = e => {
        e.preventDefault();
        localStorage.removeItem("token");
        setToken("");
        replace("/login");
    }

    return (
        <ConfigProvider webviewType={isVK ? WebviewType.VKAPPS : WebviewType.INTERNAL}>
            <AdaptivityProvider>
                <AppRoot>
                    <Match fallbackURL={"/catalogue"}>
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
                                                {token && !isVK &&
                                                    <Cell
                                                        data-story="profile"
                                                        onClick={logout}
                                                        before={<Icon28DoorArrowRightOutline/>}
                                                    >
                                                        Выход
                                                    </Cell>}
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
                                        <Catalogue id={"catalogue"} nav={"/catalogue"} token={token}
                                                   apiRequest={apiRequest} isVK={isVK}/>
                                        <Favourites id={"favourites"} nav={"/favourites"} token={token}/>
                                        <Profile id={"profile"} nav={"/profile"} token={token} apiRequest={apiRequest}/>
                                    </Epic>
                                </SplitCol>
                            </SplitLayout>
                            <SplitLayout nav={"/login"} popout={popout}>
                                <Login nav={"/login"} id={"login"} apiRequest={apiRequest} setToken={setToken}
                                       isVK={isVK}/>
                            </SplitLayout>
                            <SplitLayout nav={"/register"} popout={popout}>
                                <Register nav={"/register"} id={"register"} apiRequest={apiRequest} isVK={isVK}/>
                            </SplitLayout>
                            <SplitLayout nav={"/vklogin"} popout={popout}>
                                <VkLogin nav={"/vklogin"} id={"vklogin"} apiRequest={apiRequest} setToken={setToken}
                                         fetchedUser={fetchedUser} setPopout={setPopout} setActiveStory={setActiveStory}
                                         isVK={isVK}/>
                            </SplitLayout>
                            <SplitLayout nav={"/vkregister"} popout={popout}>
                                <VkRegister nav={"/vkregister"} id={"vkregister"} apiRequest={apiRequest}
                                            fetchedUser={fetchedUser} setToken={setToken} isVK={isVK}/>
                            </SplitLayout>
                            <SplitLayout nav={"/audioplayer"} popout={popout}>
                                <AudioPlayer nav={"/audioplayer"} id={"audioplayer"} apiRequest={apiRequest}
                                             token={token}/>
                            </SplitLayout>
                            <RestaurantLayout nav={"/restaurant"} id={"restaurant"} apiRequest={apiRequest}
                                              token={token} popout={popout} setPopout={setPopout} isVK={isVK}/>
                            <SplitLayout nav={"/landing"} popout={popout}>
                                <LandingPage nav={"/landing"} id={"landing"} apiRequest={apiRequest}/>
                            </SplitLayout>
                        </Root>
                    </Match>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
};

export default App;
