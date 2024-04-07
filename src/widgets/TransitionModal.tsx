
import React, { Component } from "react"
import {Modal, ModalProps} from 'antd'
import './TransitionModal.less'

interface TransitionModalProps extends ModalProps{
    top: string;
}

export default class TransitionModal extends Component<TransitionModalProps, {
    visible: boolean;
    showTransition: boolean;
}> {
    constructor(props:any) {
        super(props);
        this.state = {
            visible: false,
            showTransition: false
        }
    }
    showTransition() {
        this.setState({
            visible: true
        }, ()=>{
            setTimeout(()=>{
                this.setState({
                    showTransition: true
                })
            }, 0)
        })
    }
    hideTransition() {
        this.setState({
            showTransition: false
        }, ()=>{
            setTimeout(()=>{
                this.setState({
                    visible: false
                })
            }, 300)
        })
    }
    render() {
        const {visible, showTransition} = this.state;
        const {top, ...others} = this.props;
        const props = {
            ...others,
            style: {...this.props.style, top, marginTop: '0px'},
            visible,
            wrapClassName: [this.props.wrapClassName || '', ' transition-modal', showTransition ? ' transition-modal--show': ''].join('')
        }
        return (
            <Modal {...props}>{this.props.children}</Modal>
        )
    }
}