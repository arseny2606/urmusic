import {
    Button,
    FormItem,
    FormLayout,
    Group,
    IconButton,
    Input,
    Link,
    Panel,
    PanelHeader,
    Placeholder,
    SimpleCell
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {Icon16View, Icon24Hide} from "@vkontakte/icons";
import {replace} from "@itznevikat/router";

const Login = ({id, nav, apiRequest, setToken, isVK}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);

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
                replace("/catalogue");
            }
        });
    }

    const goToMain = e => {
        replace('/landing');
    }

    const goToRegister = e => {
        replace("/register");
    }

    useEffect(() => {
        function checkLogin() {
            if (localStorage.getItem("token")) replace("/catalogue");
            if (isVK) replace("/vklogin");
        }

        checkLogin();
    }, []);

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
                        <SimpleCell onClick={goToRegister}>
                            <Link>Регистрация</Link>
                        </SimpleCell>
                        <SimpleCell onClick={goToMain}>
                            <Link>На главную</Link>
                        </SimpleCell>
                    </FormLayout>
                </Group>
            </Placeholder>
        </Panel>);
};

export default Login;
