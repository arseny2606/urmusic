import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    ScreenSpinner,
    AdaptivityProvider,
    AppRoot,
    SplitLayout,
    PanelHeader,
    usePlatform,
    VKCOM,
    SplitCol,
    Panel,
    Group,
    Cell,
    Tabbar,
    TabbarItem,
    Badge,
    PanelHeaderBack,
    Placeholder, ConfigProvider
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';
import {Match, Root, Epic, View, push} from "@itznevikat/router";
import {
    Icon28FavoriteOutline,
    Icon28MenuOutline,
    Icon28UserCircleOutline,
    Icon28UserOutline,
} from "@vkontakte/icons";

const App = () => {
    const platform = usePlatform();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [isVK, setIsVK] = useState(true);
    const [activeStory, setActiveStory] = React.useState("profile");
    const onStoryChange = (e) => {
        setActiveStory(e.currentTarget.dataset.story);
        push(`/${e.currentTarget.dataset.story}`);
    }
    const hasHeader = platform !== VKCOM;

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === "vk-connect") {
                setIsVK(false);
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
            });
            setPopout(null);
        }

        fetchData();
    }, []);

    const go = e => {
        push(`/${e.currentTarget.dataset.to}`);
    };

    return (
        <ConfigProvider>
            <AdaptivityProvider>
                <AppRoot>
                    <Match initialURL={"/profile"}>
                        <Root nav="/">
                            <SplitLayout
                                header={hasHeader && <PanelHeader separator={false}/>}
                                style={{justifyContent: "center"}}
                                nav={"/"}
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
                                        <Panel id="catalogue" nav="/catalogue">
                                            <PanelHeader left={<PanelHeaderBack/>}>Каталог</PanelHeader>
                                            <Group style={{height: "1000px"}}>
                                                <Placeholder
                                                    icon={<Icon28UserCircleOutline width={56} height={56}/>}
                                                ></Placeholder>
                                            </Group>
                                        </Panel>
                                        <Panel id="favourites" nav="/favourites">
                                            <PanelHeader left={<PanelHeaderBack/>}>Избранное</PanelHeader>
                                            <Group style={{height: "1000px"}}>
                                                <Placeholder
                                                    icon={<Icon28UserCircleOutline width={56} height={56}/>}
                                                ></Placeholder>
                                            </Group>
                                        </Panel>
                                        <Panel id="profile" nav="/profile">
                                            <PanelHeader left={<PanelHeaderBack/>}>Профиль</PanelHeader>
                                            <Group style={{height: "1000px"}}>
                                                <Placeholder
                                                    icon={<Icon28UserCircleOutline width={56} height={56}/>}
                                                ></Placeholder>
                                            </Group>
                                        </Panel>
                                    </Epic>
                                </SplitCol>
                            </SplitLayout>
                        </Root>
                    </Match>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
};

export default App;
