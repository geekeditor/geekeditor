export type PaginationParams<T> = {
    pageSize?: number;
    pageIndex?: number;
    example?: T
}

export type PaginationResponseData<T> = {
    pageSize: number;
    pageIndex: number;
    total: number;
    list: T[]
}


export type AuthRegisterParams = {
    email: string;
    username: string;
    password: string;
    captcha: string;
}

export type AuthRegisterResposeData = any;

export type AuthLoginParams = {
    username: string;
    password: string;
}

export type AuthLoginResposeData = {
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
    vip: {
        is_vip: boolean;
        code?: string;
        actived?: string;
        expire_in?: string;
    }
}

export type AuthUserReponseData = {
    user: {
        id: number;
        email: string;
        username: string;
    },
    vip: {
        is_vip: boolean;
        code?: string;
        actived?: string;
        expire_in?: string;
    }
}


export type AuthSendCaptchaParams = {
    email: string
}

export type AuthSendCaptchaResposeData = any;

export type VipCheckParams = {
    app_id: number
}

export type VipCheckResponseData = {
    is_vip: boolean;
    code?: string;
    actived?: string;
    expire_in?: string;
}


export type VipBindParams = {
    code: string;
    app_id: number
}

export type VipBindResponseData = {
    is_vip: boolean;
    code: string;
    actived: string;
    expire_in: string;
}

export type VipData = {
    id: number;
    app_id: number;
    total_fee: number;
    discount_fee: number;
    title: string;
    duration: number;
    body: string;
    device_count: number;
    mark: string;
}

export type VipListResponseData = {
    vips: VipData[]
}

export type PayCreateParams = {
    vip_id: number
}

export type PayCreateReponseData = {
    pay_order_id?: string;
    qrcode?: string;
    total_fee?: number;
    vip_id?: number
}

export type PayCheckParams = {
    pay_order_id: string;
}

export type PayCheckResponseData = {
    is_paid: boolean;
    vip?: {
        is_vip: boolean;
        code: string;
        actived: string;
        expire_in: string;
    }
}


export type UserConfig = {
    content?: string;
    created?: string;
    updated?: string;
}

export type ThemeData = {
    id?: number;
    app_id?: number;
    title?: string;
    type?: number;
    cover?: string;
    css?: string;
    is_vip?: number;
    on?: number;
}
export type ThemePaginationParams = PaginationParams<ThemeData>
export type ThemePaginationResponseData = PaginationResponseData<ThemeData>

