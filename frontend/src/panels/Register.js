import {
    Button,
    FormItem, FormLayout, Group, IconButton, Input, Link,
    Panel,
    PanelHeader, Placeholder
} from "@vkontakte/vkui";
import {useState} from "react";
import {Icon16View, Icon24Hide} from "@vkontakte/icons";
import {replace} from "@itznevikat/router";

const Register = ({id, nav, apiRequest}) => {
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
            if (response){
                console.log(response);
                replace("/login");
            }
        });
    }

    const goToLogin = e => {
        replace("/login");
    }

    return (
        <Panel id={id} nav={nav}>
            <PanelHeader>Регистрация нового аккаунта</PanelHeader>
            <Placeholder width={100} height={100} stretched>
                <Group width={100} height={100}>
                    <FormLayout onSubmit={onSubmit}>
                        <FormItem top="E-mail">
                            <Input type="email" align="center" placeholder="Введите e-mail" onChange={onEmailChange} value={email} required />
                        </FormItem>
                        <FormItem top="Пароль">
                            <Input type={passwordShown ? "text" : "password"} align="center" placeholder="Введите пароль" onChange={onPasswordChange} value={password}  after={
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
                            <Input type={passwordShown ? "text" : "password"} align="center" placeholder="Повторите пароль" onChange={onPassword2Change} value={password2}  after={
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
                            <Input type="text" align="center" placeholder="Введите имя" onChange={onFirstNameChange} value={firstName} required />
                        </FormItem>
                        <FormItem top="Фамилия">
                            <Input type="text" align="center" placeholder="Введите фамилию" onChange={onLastNameChange} value={lastName} required />
                        </FormItem>
                        <FormItem top="Город">
                            <Input type="text" align="center" placeholder="Введите город" onChange={onCityChange} value={city} required />
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

export default Register;
