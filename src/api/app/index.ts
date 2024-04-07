import {get, post, del, put} from '../../utils/request';
import { AuthLoginParams, AuthLoginResposeData, AuthRegisterParams, AuthRegisterResposeData, AuthSendCaptchaParams, AuthSendCaptchaResposeData, AuthUserReponseData, PayCheckParams, PayCheckResponseData, PayCreateParams, PayCreateReponseData, ThemeData, ThemePaginationParams, ThemePaginationResponseData, UserConfig, VipBindParams, VipBindResponseData, VipCheckParams, VipCheckResponseData, VipListResponseData } from './model';

export const postAuthRegister = (params: AuthRegisterParams) => {
    return post<AuthRegisterParams, AuthRegisterResposeData>(`/auth/register`, params);
}

export const postAuthLogin = (params: AuthLoginParams) => {
    return post<AuthLoginParams, AuthLoginResposeData>(`/auth/login`, params);
}

export const postAuthSendCaptcha = (params: AuthSendCaptchaParams) => {
    return post<AuthSendCaptchaParams, AuthSendCaptchaResposeData>(`/auth/sendCaptcha`, params);
}

export const getAuthUser = () => {
    return get<any, AuthUserReponseData>(`/auth/user`)
}

export const postVipList = () => {
    return post<any, VipListResponseData>(`/vip/list`, {app_id: 1})
}

export const postVipCheck = () => {
    return post<VipCheckParams, VipCheckResponseData>(`/vip2/check`, {app_id: 1})
}

export const postVipBind = (code: string) => {
    return post<VipBindParams, VipBindResponseData>(`/vip2/bind`, {app_id: 1, code})
}

export const postPayCreate = (params: PayCreateParams) => {
    return post<PayCreateParams, PayCreateReponseData>(`/pay2/create`, params)
}

export const postPayCheck = (params: PayCheckParams) => {
    return post<PayCheckParams, PayCheckResponseData>(`/pay2/check`, params)
}

export const getUserConfig = () => {
    return get<any, UserConfig>(`/config/user`)
}

export const postUserConfig = (params: UserConfig) => {
    return post<UserConfig, UserConfig>(`/config/user`, params)
}

export const postThemeList = (params: ThemePaginationParams) => {
    params.example = params.example || {}
    params.example.app_id = 1
    return post<ThemePaginationParams, ThemePaginationResponseData>(`/theme/list`, params)
}

export const getTheme = (id: number|string) => {
    return get<any, ThemeData>(`/theme/${id}`)
}

export default {
    postAuthRegister,
    postAuthLogin,
    postAuthSendCaptcha,
    postVipList,
    postThemeList
}


