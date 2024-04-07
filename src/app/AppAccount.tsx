import { LoadingOutlined, RightOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import BarItem from "../widgets/BarItem";
import "./AppAccount.less";
import TransitionModal from "../widgets/TransitionModal";
import AppVIP from "./AppVIP";
import { Button, Form, Input, message, Result, Spin } from "antd";
import { getAuthUser, postAuthLogin, postAuthRegister, postAuthSendCaptcha, postVipBind } from "../api/app";
import { useForm } from "antd/lib/form/Form";
import { getToken } from "../utils/auth";
import { User, Vip } from "../types/auth";
import { ACTION_AUTH_BIND_VIP, ACTION_AUTH_LOGIN, ACTION_TYPE_AUTH_LOGOUT } from "../store/auth";
import { connect } from "react-redux";
import store from "../store";
import sharedEventBus from "../utils/sharedEventBus";
import { useTranslation } from "react-i18next";



const mapStateToProps = (state: any) => {
    return {
        logined: state.auth.logined,
        user: state.auth.user,
        vip: state.auth.vip
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onAuthLogin: (user: User, vip: Vip, token?: string) => {
            dispatch(ACTION_AUTH_LOGIN(user, vip, token))
        },
        onAuthLogout: () => {
            dispatch({
                type: ACTION_TYPE_AUTH_LOGOUT,
            })
        },
        onAuthVipBind: (vip: Vip) => {
            dispatch(ACTION_AUTH_BIND_VIP(vip))
        }
    }
}

function AppAccount(props: any) {

    const { t } = useTranslation()
    const [loginState, setLoginState] = useState(true)
    const [registered, setRegistered] = useState(false)
    const [loading, setLoading] = useState(false);
    const [loginForm] = useForm()
    const [registerForm] = useForm()
    const [loadingUser, setLoadingUser] = useState(false)


    const transitionModal = useRef<TransitionModal>(null);
    const onHide = () => {
        if (transitionModal.current) {
            transitionModal.current.hideTransition();
        }
    }
    const onShow = () => {
        if (transitionModal.current) {
            transitionModal.current.showTransition();
        }
    }

    const onLogin = (values: any) => {
        console.log('Success:', values);
        setLoading(true)
        postAuthLogin(values).then((value) => {
            props.onAuthLogin(value.user, value.vip, value.token);
            // onHide()
        }).finally(() => {
            setLoading(false)
        })

    };

    const onLoginFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onRegister = (values: any) => {
        console.log('Success:', values);

        setLoading(true)
        postAuthRegister(values).then(() => {

            setRegistered(true)

        }).finally(() => {
            setLoading(false)
        })
    };

    const onRegisterFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onBind = (values: any) => {

        setLoading(true)
        postVipBind(values.code).then((value) => {

            props.onAuthVipBind(value)

        }).finally(() => {
            setLoading(false)
        })

    }

    const onBindFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onTriggerLogin = (state: boolean) => {
        setRegistered(false)
        setLoginState(state)
    }

    const onSendCaptcha = () => {

        registerForm.validateFields(['email']).then((values) => {

            postAuthSendCaptcha(values).then(() => {
                message.success(t("auth.validateCodeSent"));
            })

        })
    }

    const onLogout = () => {
        props.onAuthLogout();
    }


    const usernameRules = [{ required: true, message: t("auth.nameRequired") }, {
        validator(_: any, value: string) {
            if (!value || /^[a-zA-Z0-9_-]{4,16}$/.test(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(t("auth.passwordAlertMsg")));
        }
    }]
    const passwordRules = [{ required: true, message: t("common.passwordRequired") }, {
        validator(_: any, value: string) {
            if (!value || /^.{6,}$/.test(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(t("auth.passwordLengthRequired")));
        }
    }]
    const codeRules = [{ required: true, message: t("auth.authorizeCodeRequired") }, {
        validator(_: any, value: string) {
            if (!value || /^([a-f\d]{32}|[A-F\d]{32})$/.test(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(t("auth.authorizeCodeErrorMsg")));
        }
    }]


    useEffect(() => {

        const token = getToken();
        if (token) {
            setLoadingUser(true)
            getAuthUser().then((user) => {
                props.onAuthLogin(user.user, user.vip)
            }).finally(() => {
                setLoadingUser(false)
            })
        }

        window.addEventListener('message', (event) => {
            if (event.data.type === 'check-auth') {

                const auth = store.getState().auth;

                window.postMessage({ type: 'check-auth-callback', auth }, "*")

                if (event.data.show && (!auth.logined || !auth.vip || !auth.vip.is_vip)) {
                    onShow()
                    message.warning(event.data.msg || t(`auth.${(!auth.logined ? `loginRequired` : `loginVipRequired`)}`))
                }
            }
        })

        sharedEventBus.on('showAccount', () => {
            onShow();
        })


    }, [])

    return <>
        <BarItem id="app-guide-setting" disabled={loadingUser} icon={loadingUser ? <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} /> : props.logined ? <i className={["account-icon", props.vip?.is_vip ? " vip" : ""].join("")}>{props.user.username.toUpperCase().charAt(0)}</i> : <UserOutlined />} wrapClassName="app-bar-item" onClick={onShow} />

        <TransitionModal
            ref={transitionModal}
            title={null}
            footer={null}
            onOk={onHide}
            onCancel={onHide}
            width={300}
            top="-450px"
            maskStyle={{ backgroundColor: 'transparent' }}
            destroyOnClose={true}
            transitionName=""
            maskTransitionName=""
            closeIcon={null}
            closable={false}
            wrapClassName="account-modal"
        >
            <div className={["account-block", props.logined ? "account-block--actived" : ''].join(" ")}>
                <div className="account-nav">
                    <span className={["account-nav-title", props.vip?.is_vip ? " vip" : ""].join("")}>{props.user && props.user.username}</span>
                    <div>{t("auth.logon")}<span className="account-nav-btn" onClick={() => onLogout()}>{t("auth.logout")}<RightOutlined /></span></div>
                </div>
                <AppVIP />

            </div>
            <div className={["account-block", !props.logined && loginState ? "account-block--actived" : ''].join(" ")}>
                <div className="account-nav">
                    <span className="account-nav-title">{t("auth.loginAccount")}</span>
                    <div>{t("auth.noAccount")}<span className="account-nav-btn" onClick={() => onTriggerLogin(false)}>{t("auth.instantRegister")}<RightOutlined /></span></div>
                </div>
                <div className="account-form">
                    <Form
                        name="basic"
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onLogin}
                        onFinishFailed={onLoginFailed}
                        autoComplete="off"
                        form={loginForm}
                    >
                        <Form.Item
                            name="username"
                            rules={usernameRules}
                        >
                            <Input placeholder={t("auth.name")} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={passwordRules}
                        >
                            <Input.Password placeholder={t("auth.password")} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading} disabled={loading}>
                                {t("auth.login")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            <div className={["account-block", !props.logined && !loginState ? "account-block--actived" : ''].join(" ")}>
                <div className="account-nav">
                    <span className="account-nav-title">{t("auth.registerAccount")}</span>
                    <div>{t("auth.gotAccount")}<span className="account-nav-btn" onClick={() => onTriggerLogin(true)}>{t("auth.instantLogin")}<RightOutlined /></span></div>
                </div>
                <div className="account-form">
                    {!registered ? <Form
                        name="basic"
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onRegister}
                        onFinishFailed={onRegisterFailed}
                        autoComplete="off"
                        form={registerForm}
                    >
                        <Form.Item
                            name="username"
                            rules={usernameRules}
                        >
                            <Input placeholder={t("auth.name")} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            hasFeedback
                            rules={[{ required: true, message: t("common.passwordRequired") }, {
                                validator(_, value) {
                                    if (!value || /^.{6,}$/.test(value)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t("auth.passwordLengthRequired")));
                                }
                            }]}
                        >
                            <Input.Password placeholder={t("auth.password")} />
                        </Form.Item>

                        <Form.Item
                            name="comfirmPassword"
                            hasFeedback
                            rules={passwordRules}
                        >
                            <Input.Password placeholder={t("auth.passwordConfirm")} />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[{
                                type: 'email',
                                message: t("auth.validEmailRequired"),
                            }, { required: true, message: t("auth.validateCodeRequired") }]}
                        >
                            <Input placeholder={t("auth.email")} />
                        </Form.Item>

                        <Form.Item
                            className="account-code"
                        >
                            <Form.Item
                                name="captcha"
                                noStyle
                                rules={[{ required: true, message: t("auth.validateCodeRequired") }]}
                            >
                                <Input placeholder={t("auth.validateCode")} />
                            </Form.Item>
                            <Button onClick={onSendCaptcha}>{t("auth.getValidateCode")}</Button>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading} disabled={loading}>
                            {t("auth.register")}
                            </Button>
                        </Form.Item>
                    </Form> :
                        <Result
                            status="success"
                            title={t("auth.registerSuccess")}
                            extra={[
                                <Button type="primary" onClick={() => onTriggerLogin(true)}>
                                    {t("auth.toLogin")}
                                </Button>
                            ]}
                        />}

                </div>
            </div>

        </TransitionModal>
    </>
}

const CAppAccount = connect(mapStateToProps, mapDispatchToProps)(AppAccount);
export default CAppAccount;