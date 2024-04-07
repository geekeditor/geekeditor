import React, { Component } from "react"
import TransitionModal from '../widgets/TransitionModal'
import BarItem from '../widgets/BarItem'
import { Radio, RadioChangeEvent, Input, Button, Select } from "antd"
import './AppCode.less'
import vip1 from '../assets/vip1.jpeg'
import vip2 from '../assets/vip2.jpeg'
import vip3 from '../assets/vip3.jpeg'
import vip100 from '../assets/vip100.jpeg'
import support from '../assets/support.jpeg'

const { Option } = Select;
// const coffeeIcon = <svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2802" width="28" height="28"><path d="M590.2 790.6H351.2c-38.4 0-69.6-31.2-69.6-69.6h378c0 38.4-31 69.6-69.4 69.6z" fill="#FEFE71" p-id="2803"></path><path d="M417.8 721h-136.2c0 38.4 31.2 69.6 69.6 69.6h136.2c-38.4 0-69.6-31.2-69.6-69.6z" fill="#D6CD1E" p-id="2804"></path><path d="M470.6 721c-104.4 0-189-84.6-189-189v-83.2h378V532c0 104.4-84.6 189-189 189z" fill="#FE8E46" p-id="2805"></path><path d="M418.2 532v-83.2h-136.8V532c0 104.4 84.6 189 189 189 24.2 0 47.2-4.6 68.4-12.8-70.4-27.4-120.6-95.8-120.6-176.2z" fill="#E56823" p-id="2806"></path><path d="M470.6 735c-112 0-203-91-203-203v-83.2c0-7.8 6.2-14 14-14h378c7.8 0 14 6.2 14 14V532c0 112-91 203-203 203z m-175-272.2V532c0 96.6 78.6 175 175 175s175-78.6 175-175v-69.2h-350z" fill="#463218" p-id="2807"></path><path d="M590.2 804.6H351.2c-46 0-83.6-37.4-83.6-83.6 0-7.8 6.2-14 14-14h378c7.8 0 14 6.2 14 14 0 46.2-37.4 83.6-83.4 83.6z m-292.8-69.6c6.2 23.8 28 41.6 53.8 41.6h239c25.8 0 47.6-17.6 53.8-41.6H297.4zM664 661h-43.4c-7.8 0-14-6.2-14-14s6.2-14 14-14H664c12.4 0 24.4-3.6 35-10.2 18.4-12 29.6-32.2 29.6-54.2V504h-68.2c-7.8 0-14-6.2-14-14s6.2-14 14-14h82.2c7.8 0 14 6.2 14 14v78.6c0 31.6-15.8 60.6-42.4 77.6-15 9.6-32.4 14.8-50.2 14.8z" fill="#463218" p-id="2808"></path><path d="M569.4 504h28v64.4h-28z" fill="#FFFFFF" p-id="2809"></path><path d="M470.6 376.6c-3.6 0-7.2-1.4-9.8-4.2-11.2-11.2-17.4-26.2-17.4-42 0-14.6 5.2-28.4 14.8-39.2 0.6-1.4 1.6-2.6 2.6-3.6 6-6 9.2-13.8 9.2-22.2s-3.2-16.2-9.2-22.2c-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c11.2 11.2 17.4 26.2 17.4 42 0 14.6-5.2 28.4-14.8 39.2-0.6 1.4-1.6 2.6-2.6 3.6-6 6-9.2 13.8-9.2 22.2s3.2 16.2 9.2 22.2c5.4 5.4 5.4 14.4 0 19.8-2.8 2.8-6.4 4.2-10 4.2z m0-78.2zM376.8 394c-3.6 0-7.2-1.4-9.8-4-16-16-16.8-41.4-2.2-58.2 0.6-1 1.4-2 2.2-3 5.8-5.8 5.8-15.2 0-21.2-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c16 16 16.8 41.4 2.2 58.2-0.6 1-1.4 2-2.2 3-5.8 5.8-5.8 15.2 0 21.2 5.4 5.4 5.4 14.4 0 19.8-2.8 2.6-6.4 4-10 4z m0-54.8zM564.4 394c-3.6 0-7.2-1.4-10-4-16-16-16.8-41.4-2.2-58.2 0.6-1 1.4-2 2.2-3 5.8-5.8 5.8-15.2 0-21.2-5.4-5.4-5.4-14.4 0-19.8s14.4-5.4 19.8 0c16 16 16.8 41.4 2.2 58.2-0.6 1-1.4 2-2.2 3-5.8 5.8-5.8 15.2 0 21.2 5.4 5.4 5.4 14.4 0 19.8-2.6 2.6-6.2 4-9.8 4z m0-54.8z" fill="#463218" p-id="2810"></path></svg>

const vipMap = {
    '1': vip1,
    '2': vip2,
    '3': vip3,
    '100': vip100,
    'support': support
}
const vipIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3842" width="28" height="28"><path fill="currentColor" d="M236.144744 613.830223l-77.391725-278.248212L62.277897 335.582011l116.19504 389.152091 97.400228 0 116.860216-389.152091-75.975412 0L236.144744 613.830223zM456.617934 724.734102l90.40769 0L547.025625 335.580988 456.617934 335.580988 456.617934 724.734102zM932.567938 385.752668c-14.173372-18.808368-30.280871-31.868825-48.325569-39.192627-18.043674-7.310499-44.0623-10.979052-78.070205-10.979052L653.70148 335.580988l0 389.152091 92.098261 0L745.799742 580.184939l63.767892 0c27.593559 0 47.848688-1.704828 60.791995-5.128811 12.94433-3.423983 26.308234-10.357905 40.10399-20.802792 13.796779-10.459213 24.47337-24.803919 32.02875-43.049468 7.556403-18.24555 11.326417-36.96796 11.326417-56.167231C953.819809 427.66115 946.740286 404.576385 932.567938 385.752668zM848.96449 493.810732c-9.071981 10.459213-24.847916 15.673981-47.327804 15.673981l-58.942805 0L742.69388 406.281213l58.653198 0c20.601021 0 35.943056 4.666276 46.056806 13.969153 10.112726 9.317203 15.168066 21.856797 15.168066 37.632085C862.572973 471.390094 858.036471 483.35152 848.96449 493.810732z" p-id="3843"></path></svg>
export default class AppCode extends Component<{}, {
    subscribeWay: 'pay' | 'code';
    period: '1' | '2' | '3' | '100' | 'support';
}> {
    private transitionModal!: TransitionModal | null;
    constructor(props: any) {
        super(props);
        this.state = {
            subscribeWay: 'pay',
            period: '1'
        }
    }
    onHide = () => {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }
    onShow = () => {
        if (this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }
    onChangeSubscribeWay = (value: any) => {
        this.setState({
            subscribeWay: value
        })
    }
    onChangePeriod = (value: any) => {
        this.setState({
            period: value
        })
    }
    render() {
        const { subscribeWay, period } = this.state;
        return (
            <>
                <Button onClick={this.onShow}>购买</Button>
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={<><span>购买会员授权码</span></>}
                    footer={null}
                    onOk={this.onHide}
                    onCancel={this.onHide}
                    width={300}
                    top="-500px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    closeIcon={null}
                    closable={true}
                    wrapClassName="code-modal"
                >
                    <div className="code-info">
                        
                    </div>
                    <div className="code-pay">
                        <div className="code-pay__period">
                            <span className="code-pay__title">请选择类型</span>
                            <Select className="code-pay__option" value={period} onChange={this.onChangePeriod}>
                                <Option value="1">授权会员1年</Option>
                                <Option value="2">授权会员2年</Option>
                                <Option value="3">授权会员3年</Option>
                                <Option value="100">授权会员终身</Option>
                                <Option value="support"><span style={{color: 'var(--theme-color)'}}>联系微信购买</span></Option>
                            </Select>
                        </div>
                        <div className="code-pay__period-wrapper">
                            <div className="code-pay__item">
                                <div className="code-pay__qrcode">
                                    <img src={vipMap[period]} width="100%"></img>
                                </div>
                            </div>
                            <div className="code-pay__item">
                                {period === 'support' ? <div className="code-pay__tip" style={{textAlign: 'center'}}>扫码添加微信咨询购买</div>:<div className="code-pay__tip">请在备注中填入<span className="code-pay__platform">邮箱地址</span>，授权码将在24小时内发送。</div>}
                                
                            </div>
                        </div>

                    </div>
                </TransitionModal>
            </>
        )
    }
}