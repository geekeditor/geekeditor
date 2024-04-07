import React, { Component } from "react"
import './AppQRCode.less'
import TransitionModal from '../widgets/TransitionModal'
import BarItem from '../widgets/BarItem'
import { QrcodeOutlined } from '@ant-design/icons'
import QRIMG from '../assets/qrcode_for_geekeditor.jpg'


const feedbackIcon = <svg viewBox="0 0 1097 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4443" width="14" height="14"><path fill="currentColor" d="M146.285714 0h804.571429a146.285714 146.285714 0 0 1 146.285714 146.285714v514.779429a146.285714 146.285714 0 0 1-146.285714 146.285714h-196.973714a36.571429 36.571429 0 0 0-27.648 12.507429L548.571429 1024l-165.156572-203.190857a36.571429 36.571429 0 0 0-28.379428-13.458286H146.285714a146.285714 146.285714 0 0 1-146.285714-146.285714V146.285714a146.285714 146.285714 0 0 1 146.285714-146.285714z m36.571429 73.362286a109.714286 109.714286 0 0 0-109.714286 109.714285V623.908571a109.714286 109.714286 0 0 0 109.714286 109.714286h217.380571a36.571429 36.571429 0 0 1 29.257143 14.701714L548.571429 907.702857l136.265142-161.133714a36.571429 36.571429 0 0 1 27.867429-13.019429H914.285714a109.714286 109.714286 0 0 0 109.714286-109.714285V183.076571a109.714286 109.714286 0 0 0-109.714286-109.714285h-731.428571zM219.428571 366.957714h146.285715v146.797715H219.428571V366.957714z m253.952 0h146.285715v146.797715h-146.285715V366.957714z m258.048 0h146.285715v146.797715h-146.285715V366.957714z" p-id="4444"></path></svg>
export default class AppQRCode extends Component {
    private transitionModal!: TransitionModal|null;
    onHide = () => {
        if(this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }
    onShow = () => {
        if(this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }
    render() {
        return (
            <>
                <BarItem id="app-guide-qrcode" icon={feedbackIcon} wrapClassName="app-bar-item" onClick={this.onShow}/>
                <TransitionModal
                    ref={(modal)=>{this.transitionModal=modal}}
                    title={null}
                    footer={null}
                    onOk={this.onHide}
                    onCancel={this.onHide}
                    width={260}
                    top="-350px"
                    maskStyle={{backgroundColor: 'transparent'}}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    closeIcon={null}
                    closable={false}
                    wrapClassName="qrcode-modal"
                >
                    <div className="qrcode-main">
                        <div className="qrcode-img">
                            <img src={QRIMG}></img>
                        </div>
                        <div className="qrcode-tip">
                            <p>关注「极客编辑器」公众号</p>
                            <p>反馈Bug、提需求及了解后续版本更新</p>
                        </div>
                    </div>
                </TransitionModal>
            </>
        )
    }
}