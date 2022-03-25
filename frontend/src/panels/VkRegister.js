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
    Placeholder
} from "@vkontakte/vkui";
import {useEffect, useState} from "react";
import {Icon16View, Icon24Hide} from "@vkontakte/icons";
import {replace} from "@itznevikat/router";

const VkRegister = ({id, nav, apiRequest, fetchedUser, setToken, isVK}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [city, setCity] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const onEmailChange = e => {
        setEmail(e.currentTarget.value);
    }

    const onPasswordChange = e => {
        setPassword(e.currentTarget.value);
    }

    const onPassword2Change = e => {
        setPassword2(e.currentTarget.value);
    }

    const onPasswordShownChange = e => {
        setPasswordShown(!passwordShown);
    }

    const onCityChange = e => {
        setCity(e.currentTarget.value);
    }

    const onFirstNameChange = e => {
        setFirstName(e.currentTarget.value);
    }

    const onLastNameChange = e => {
        setLastName(e.currentTarget.value);
    }

    const onSubmit = e => {
        e.preventDefault();
        apiRequest("account/register", `email=${email}&password=${password}&password2=${password2}&city=${city}&first_name=${firstName}&last_name=${lastName}`).then(response => {
            if (response) {
                localStorage.setItem("token", response.token);
                setToken(response.token);
                apiRequest("account/linkvk", `vk_id=${fetchedUser.id}&first_name=${fetchedUser.first_name}&last_name=${fetchedUser.last_name}&city=${fetchedUser.city.title}`, response.token, {photo_url: fetchedUser.photo_200}).then(response => {
                    replace("/vklogin");
                })
            }
        });
    }

    const goToLogin = e => {
        replace("/vklogin");
    }

    useEffect(() => {
        const fetchData = () => {
            if (!isVK) {
                replace("/register");
                return;
            }
            if (fetchedUser){
                setCity(fetchedUser.city.title);
                setFirstName(fetchedUser.first_name);
                setLastName(fetchedUser.last_name);
            }
        }
        fetchData();
    })

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Регистрация нового аккаунта</PanelHeader>
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
                            } required/>
                        </FormItem>
                        <FormItem top="Повторите пароль">
                            <Input type={passwordShown ? "text" : "password"} align="center"
                                   placeholder="Повторите пароль" onChange={onPassword2Change} value={password2} after={
                                <IconButton
                                    hoverMode="opacity"
                                    aria-label="Показать пароль"
                                    onClick={onPasswordShownChange}
                                    required>
                                    {passwordShown ? <Icon24Hide width={16} height={16}/> : <Icon16View/>}
                                </IconButton>
                            } required/>
                        </FormItem>
                        <FormItem top="Имя">
                            <Input type="text" align="center" placeholder="Введите имя" onChange={onFirstNameChange}
                                   value={firstName} required disabled />
                        </FormItem>
                        <FormItem top="Фамилия">
                            <Input type="text" align="center" placeholder="Введите фамилию" onChange={onLastNameChange}
                                   value={lastName} required disabled />
                        </FormItem>
                        <FormItem top="Город">
                            <Input type="text" align="center" placeholder="Введите город" onChange={onCityChange}
                                   value={city} required disabled />
                        </FormItem>
                        <FormItem>
                            <Button size="l" stretched type={"submit"}>
                                Зарегистрироваться
                            </Button>
                        </FormItem>
                        <Link onClick={goToLogin}>Вход</Link>
                    </FormLayout>
                </Group>
            </Placeholder>
        </Panel>);
};

export default VkRegister;
