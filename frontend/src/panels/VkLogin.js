import {
    Alert,
    Button,
    FormItem,
    FormLayout,
    Group,
    IconButton,
    Input,
    Link,
    Panel,
    PanelHeader,
    Placeholder
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {Icon16View, Icon24Hide} from "@vkontakte/icons";
import {replace, useMeta} from "@itznevikat/router";

const VkLogin = ({id, nav, apiRequest, setToken, fetchedUser, setPopout}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const {params} = useMeta();

    useEffect(() => {
            function fetchData() {
                if (!params) {
                    apiRequest(`account/vklogin/?${window.location.search.slice(1)}&/`).then(response => {
                        if (response.status_code === 404) {
                            setPopout(<Alert
                                actions={[{
                                    title: 'Хорошо',
                                    mode: 'default',
                                    action: () => setPopout(null)
                                }]}
                                actionsLayout="vertical"
                                header="Ошибка"
                                text="Пользователь с таким аккаунтом ВКонтакте не найден. Войдите в свой аккаунт или зарегистрируйтесь."
                                onClose={() => setPopout(null)}
                            />);
                        } else {
                            setToken(response.token);
                            localStorage.setItem('token', response.token);
                            replace("/catalogue");
                        }
                    })
                } else {
                    apiRequest(`account/vklogin/?${params}&/`).then(response => {
                        if (response.status_code === 404) {
                            setPopout(<Alert
                                actions={[{
                                    title: 'Хорошо',
                                    mode: 'default',
                                    action: () => setPopout(null)
                                }]}
                                actionsLayout="vertical"
                                header="Ошибка"
                                text="Пользователь с таким аккаунтом ВКонтакте не найден. Войдите в свой аккаунт или зарегистрируйтесь."
                                onClose={() => setPopout(null)}
                            />);
                        } else {
                            setToken(response.token);
                            localStorage.setItem('token', response.token);
                            replace("/catalogue");
                        }
                    })
                }
            }

            fetchData();
        }
        , []);

    const onEmailChange = e => {
        setEmail(e.currentTarget.value);
    }

    const onPasswordChange = e => {
        setPassword(e.currentTarget.value);
    }

    const onPasswordShownChange = e => {
        setPasswordShown(!passwordShown);
    }

    const onSubmit = e => {
        e.preventDefault();
        apiRequest("account/login", `email=${email}&password=${password}`).then(response => {
            if (response) {
                localStorage.setItem("token", response.token);
                setToken(response.token);
                apiRequest("account/linkvk", `vk_id=${fetchedUser.id}`, response.token).then(response => {
                    replace("/catalogue");
                })
            }
        });
    }

    const goToRegister = e => {
        replace("/vkregister");
    }

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Вход в аккаунт</PanelHeader>
            <Placeholder width={100} height={100} stretched>
                <Group width={100} height={100}>
                    <FormLayout onSubmit={onSubmit}>
                        <FormItem top="E-mail">
                            <Input type="email" align="center" placeholder="Введите e-mail" onChange={onEmailChange}
                                   value={email} required/>
                        </FormItem>
                        <FormItem top="Пароль">
                            <Input type={passwordShown ? "text" : "password"} align="center"
                                   placeholder="Введите пароль" onChange={onPasswordChange} value={password} after={
                                <IconButton
                                    hoverMode="opacity"
                                    aria-label="Показать пароль"
                                    onClick={onPasswordShownChange}
                                    required>
                                    {passwordShown ? <Icon24Hide width={16} height={16}/> : <Icon16View/>}
                                </IconButton>
                            }/>
                        </FormItem>
                        <FormItem>
                            <Button size="l" stretched type={"submit"}>
                                Войти
                            </Button>
                        </FormItem>
                        <Link onClick={goToRegister}>Регистрация</Link>
                    </FormLayout>
                </Group>
            </Placeholder>
        </Panel>);
};

export default VkLogin;
