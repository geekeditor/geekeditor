import React, { Component } from "react";
import TransitionModal from "../widgets/TransitionModal";
import { Radio, RadioChangeEvent, Input, Button, Select, Form } from "antd";
import "./AppVIP.less";
import { Vip } from "../types/auth";
import { ACTION_AUTH_BIND_VIP } from "../store/auth";
import { connect } from "react-redux";
import { dateStringFormat } from "../utils/utils";
import { PayCreateReponseData, VipCheckResponseData, VipData } from "../api/app/model";
import { postPayCheck, postPayCreate, postVipBind, postVipCheck, postVipList } from "../api/app";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;
// const coffeeIcon = <svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2802" width="28" height="28"><path d="M590.2 790.6H351.2c-38.4 0-69.6-31.2-69.6-69.6h378c0 38.4-31 69.6-69.4 69.6z" fill="#FEFE71" p-id="2803"></path><path d="M417.8 721h-136.2c0 38.4 31.2 69.6 69.6 69.6h136.2c-38.4 0-69.6-31.2-69.6-69.6z" fill="#D6CD1E" p-id="2804"></path><path d="M470.6 721c-104.4 0-189-84.6-189-189v-83.2h378V532c0 104.4-84.6 189-189 189z" fill="#FE8E46" p-id="2805"></path><path d="M418.2 532v-83.2h-136.8V532c0 104.4 84.6 189 189 189 24.2 0 47.2-4.6 68.4-12.8-70.4-27.4-120.6-95.8-120.6-176.2z" fill="#E56823" p-id="2806"></path><path d="M470.6 735c-112 0-203-91-203-203v-83.2c0-7.8 6.2-14 14-14h378c7.8 0 14 6.2 14 14V532c0 112-91 203-203 203z m-175-272.2V532c0 96.6 78.6 175 175 175s175-78.6 175-175v-69.2h-350z" fill="#463218" p-id="2807"></path><path d="M590.2 804.6H351.2c-46 0-83.6-37.4-83.6-83.6 0-7.8 6.2-14 14-14h378c7.8 0 14 6.2 14 14 0 46.2-37.4 83.6-83.4 83.6z m-292.8-69.6c6.2 23.8 28 41.6 53.8 41.6h239c25.8 0 47.6-17.6 53.8-41.6H297.4zM664 661h-43.4c-7.8 0-14-6.2-14-14s6.2-14 14-14H664c12.4 0 24.4-3.6 35-10.2 18.4-12 29.6-32.2 29.6-54.2V504h-68.2c-7.8 0-14-6.2-14-14s6.2-14 14-14h82.2c7.8 0 14 6.2 14 14v78.6c0 31.6-15.8 60.6-42.4 77.6-15 9.6-32.4 14.8-50.2 14.8z" fill="#463218" p-id="2808"></path><path d="M569.4 504h28v64.4h-28z" fill="#FFFFFF" p-id="2809"></path><path d="M470.6 376.6c-3.6 0-7.2-1.4-9.8-4.2-11.2-11.2-17.4-26.2-17.4-42 0-14.6 5.2-28.4 14.8-39.2 0.6-1.4 1.6-2.6 2.6-3.6 6-6 9.2-13.8 9.2-22.2s-3.2-16.2-9.2-22.2c-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c11.2 11.2 17.4 26.2 17.4 42 0 14.6-5.2 28.4-14.8 39.2-0.6 1.4-1.6 2.6-2.6 3.6-6 6-9.2 13.8-9.2 22.2s3.2 16.2 9.2 22.2c5.4 5.4 5.4 14.4 0 19.8-2.8 2.8-6.4 4.2-10 4.2z m0-78.2zM376.8 394c-3.6 0-7.2-1.4-9.8-4-16-16-16.8-41.4-2.2-58.2 0.6-1 1.4-2 2.2-3 5.8-5.8 5.8-15.2 0-21.2-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c16 16 16.8 41.4 2.2 58.2-0.6 1-1.4 2-2.2 3-5.8 5.8-5.8 15.2 0 21.2 5.4 5.4 5.4 14.4 0 19.8-2.8 2.6-6.4 4-10 4z m0-54.8zM564.4 394c-3.6 0-7.2-1.4-10-4-16-16-16.8-41.4-2.2-58.2 0.6-1 1.4-2 2.2-3 5.8-5.8 5.8-15.2 0-21.2-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c16 16 16.8 41.4 2.2 58.2-0.6 1-1.4 2-2.2 3-5.8 5.8-5.8 15.2 0 21.2 5.4 5.4 5.4 14.4 0 19.8-2.6 2.6-6.2 4-9.8 4z m0-54.8z" fill="#463218" p-id="2810"></path></svg>

const mapStateToProps = (state: any) => {
    return {
        vip: state.auth.vip,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onAuthVipBind: (vip: Vip) => {
            dispatch(ACTION_AUTH_BIND_VIP(vip));
        },
    };
};

class AppVIP extends Component<{
    vip: Vip,
    onAuthVipBind: (vip: Vip) => void
}, {
    subscribeWay: 'pay' | 'code';
    loading: boolean;
    vips: VipData[];
    selectVip: number;
    bindLoading: boolean;
    createLoading: boolean;
    invalidPayQrcode: boolean;
    createdOrder: PayCreateReponseData;
    uuid: string;
}> {

    private transitionModal!: TransitionModal | null;
    private checkTimer!: any;
    private checkCount!: number;
    constructor(props: any) {
        super(props);
        this.state = {
            subscribeWay: 'pay',
            loading: false,
            vips: [],
            selectVip: 0,

            bindLoading: false,
            createLoading: false,
            invalidPayQrcode: false,
            createdOrder: {},
            uuid: ''
        }
    }
    onHide = () => {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
        this.onStopPayCheck(true);
    }
    onShow = async () => {

        if (!this.state.vips.length) {


            this.setState({
                loading: true
            })

            const value = await postVipList()
            if (!value.vips) {
                return;
            }

            this.setState({
                vips: value.vips,
                loading: false
            })
        }

        if (this.transitionModal && this.state.vips.length) {

            this.setState({
                selectVip: this.state.vips[0].id,
            })
            this.onCreatePayQrcode()
            this.transitionModal.showTransition();
        }
    }

    onChangeSubscribeWay = (value: any) => {
        this.setState({
            subscribeWay: value
        }, () => {
            this.onCreatePayQrcode()
        })
    }
    onChangeVip = (vip_id: number) => {

        if (this.state.createLoading) {
            return;
        }

        this.setState({
            selectVip: vip_id
        }, () => {
            this.onCreatePayQrcode()
        })


    }
    onCreatePayQrcode = () => {
        this.onStopPayCheck(true);
        if (this.state.subscribeWay !== 'pay') {
            return;
        }



        this.setState({
            createLoading: true
        })

        postPayCreate({ vip_id: this.state.selectVip }).then((data) => {

            this.setState({
                createdOrder: { ...data },
                createLoading: false
            }, () => {
                this.onStartPayCheck();
            })

        }).catch(() => {
            this.setState({
                createLoading: false,
                invalidPayQrcode: true
            })
        })


    }

    onStartPayCheck = () => {

        this.onStopPayCheck(false);

        this.checkCount = 20;
        this.checkTimer = setTimeout(this.onPayCheck, 3000);

    }

    onPayCheck = () => {

        this.checkCount--;
        if (this.checkCount <= 0) {
            this.onStopPayCheck(true)
        } else if (this.state.createdOrder.pay_order_id) {

            postPayCheck({
                pay_order_id: this.state.createdOrder.pay_order_id
            }).then((data) => {

                if (data.is_paid) {

                    if (data.vip) {
                        this.props.onAuthVipBind(data.vip);
                    }

                    this.onHide()

                } else {
                    this.checkTimer = setTimeout(this.onPayCheck, 3000);
                }

            }).catch(() => {
                this.onStopPayCheck(true);
            })

        }

    }
    onStopPayCheck = (invalid: boolean) => {

        clearTimeout(this.checkTimer);
        this.setState({
            invalidPayQrcode: invalid
        })

    }

    onBind = (values: any) => {

        this.setState({
            bindLoading: true
        })
        postVipBind(values.code).then((value) => {

            this.props.onAuthVipBind(value)

        }).finally(() => {
            this.setState({
                bindLoading: false
            })
        })

    }

    onBindFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    componentWillUnmount() {
        this.onStopPayCheck(false)
    }
    render() {
        const { subscribeWay, bindLoading, loading, vips, selectVip, createdOrder, createLoading, invalidPayQrcode } = this.state;
        const { vip } = this.props;
        
        const VIPS = vips.map((vip) => {
            const years = Math.floor(vip.duration / (365 * 24 * 3600));
            const months = Math.floor(vip.duration / (30 * 24 * 3600));
            return <div className={["vip-pay__option", vip.id === selectVip ? 'vip-pay__option--active' : ''].join(' ')} key={vip.id} onClick={() => { this.onChangeVip(vip.id) }}>
                {vip.total_fee !== vip.discount_fee && <div className="vip-pay__totalfee">
                    ￥<span className="vip-pay__count">{vip.total_fee / 100.0}</span>
                </div>}
                <div className="vip-pay__disfee">
                    ￥<span className="vip-pay__count">{vip.discount_fee / 100.0}</span>
                </div>
                <div className="vip-pay__fee">
                    约<span className="vip-pay__count">{(vip.discount_fee / (100.0 * vip.duration / (24 * 3600))).toFixed(2)}</span>元/天
                </div>
                <div className="vip-pay__duration">
                    <span className="vip-pay__count">{years > 0 ? years : months > 0 ? months : (Math.floor(vip.duration / (24 * 3600)))}</span>{years > 0 ? '年' : months > 0 ? '月' : '天'}
                </div>
                <div className="vip-pay__mark">
                    {vip.mark}
                </div>
            </div>
        })
        const codeRules = [{ required: true, message: '请输入会员授权码' }, {
            validator(_: any, value: string) {
                if (!value || /^([a-f\d]{32}|[A-F\d]{32})$/.test(value)) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('请输入有效授权码'));
            }
        }]
        return (
            <>
                {vip &&
                    (!vip.code || !vip.is_vip ? (
                        <Button
                            type="primary"
                            style={{ width: "100%" }}
                            onClick={this.onShow}
                            loading={loading}
                            disabled={loading}
                        >
                            升级会员
                        </Button>
                    ) : (
                        <div className="account-vip">
                            <div>
                                会员激活时间：{dateStringFormat(vip.actived)}
                            </div>
                            <div>
                                会员到期时间：
                                {dateStringFormat(vip.expire_in)}
                            </div>
                        </div>
                    ))}
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={<span>升级会员</span>}
                    footer={null}
                    onOk={this.onHide}
                    onCancel={this.onHide}
                    width={300}
                    top="-350px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    closeIcon={null}
                    closable={true}
                    maskClosable={false}
                    wrapClassName="vip-modal"
                >
                    {/* {loading && <LoadingOutlined />} */}
                    <div className="vip-pay">
                        <div className="vip-pay__way">
                            <span className="vip-pay__title">请选择授权方式</span>
                            <Select value={subscribeWay} style={{ width: 120, marginLeft: '10px' }} onChange={this.onChangeSubscribeWay}>
                                <Option value="pay">支付授权</Option>
                                <Option value="code">使用授权码</Option>
                            </Select>
                        </div>
                        {subscribeWay === 'pay' ? <div className="vip-pay__way-wrapper">
                            <div className="vip-pay__item">
                                {/* <div className="vip-pay__title">请选择类型</div> */}
                                <div className="vip-pay__options">
                                    {VIPS}
                                </div>
                            </div>
                            <div className="vip-pay__item">
                                <div className="vip-pay__title" style={{ textAlign: 'center' }}>使用<span className="vip-pay__platform">微信</span>扫码支付</div>
                                <div className="vip-pay__qrcode">
                                    {createLoading && <LoadingOutlined />}
                                    {!createLoading && !!createdOrder.qrcode && <img src={createdOrder.qrcode} />}
                                    {invalidPayQrcode && !createLoading && <div className="vip-pay__invalid-qrcode" onClick={this.onCreatePayQrcode}>
                                        <ReloadOutlined />
                                    </div>}
                                </div>
                            </div>
                        </div> : <div className="vip-pay__way-wrapper">
                            <div className="vip-pay__item">
                                <Form
                                    name="basic"
                                    style={{ maxWidth: 600, marginTop: '20px' }}
                                    initialValues={{}}
                                    onFinish={this.onBind}
                                    onFinishFailed={this.onBindFailed}
                                    autoComplete="off"
                                >

                                    <Form.Item
                                        name="code"
                                        rules={codeRules}
                                    >
                                        <Input placeholder="会员授权码" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={bindLoading} disabled={bindLoading}>
                                            授权会员
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </div>}
                    </div>
                </TransitionModal>
            </>
        )
    }
}

const CAppVIP = connect(mapStateToProps, mapDispatchToProps)(AppVIP);
export default CAppVIP;
