import React, { Component } from 'react'
import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { IWinTab, EWinTabType } from '../../types/win.d'
import WinTabHeaderDoc from './WinTabHeaderDoc'
import WinTabContentDoc from './WinTabContentDoc'
import { EDocsNodeChangeType, IDocsNodeBase } from '../../types/docs.d'
import TransitionModal from '../../widgets/TransitionModal'

export default class WinTab extends Component<{
    tab: IWinTab;
    activeTabID: number;
    live: boolean;
    onSelect: (tabId: number) => void;
    onRemove: (tabId: number) => void;
    onChangeTitle: (tabId: number) => void;
    onOpen: (node: IDocsNodeBase) => void;
    onAdd: () => void;
}, {
    confirmLoading: boolean;
}> {

    constructor(props:any) {
        super(props);
        this.state = {
            confirmLoading: false
        }
    }

    private transitionModal!: TransitionModal|null;
    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoved) {
            const { tab, onRemove } = this.props;
            onRemove(tab.id);
        }
    }

    onRemove = () => {
        const { tab, onRemove } = this.props;
        const node = tab.node;
        if (node.isChanged) {
            this.onShowConfirmModal();
        } else {
            onRemove(tab.id)
        }
    }

    onChangeTitle = () => {
        const {tab, onChangeTitle } = this.props;
        onChangeTitle(tab.id)
    }

    onConfirmSaveAndRemove = () => {
        const { tab , onRemove} = this.props;
        const node = tab.node;
        this.setState({
            confirmLoading: true,
        })
        return node.save().then((success)=>{
            this.setState({
                confirmLoading: false
            })
            if(success) {
                onRemove(tab.id);
                this.onHideConfirmModal();
            } else {
            }
        });
    }

    onCancelSaveAndRemove = () => {
        const { tab , onRemove} = this.props;
        onRemove(tab.id);
        this.onHideConfirmModal();
    }

    onShowConfirmModal = () => {
        if(this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }

    onHideConfirmModal = () => {
        if(this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }



    componentDidMount() {

        const { type } = this.props.tab;
        if (type === EWinTabType.WinTabDoc) {
            const node = this.props.tab.node
            node.onChanged(this.onNodeChanged);
            !node.isLoaded && node.load();
        }
    }

    componentWillUnmount() {
        const { type } = this.props.tab;
        if (type === EWinTabType.WinTabDoc) {
            const node = this.props.tab.node
            node.offChanged(this.onNodeChanged);
        }
    }

    render() {
        const { tab, activeTabID, onSelect, onOpen, onRemove } = this.props;
        const {confirmLoading} = this.state;
        const isActive = activeTabID === tab.id;
        const title = tab.node.title;
        const Header = <WinTabHeaderDoc wrapClassName={activeTabID === tab.id ? "active" : ""} node={tab.node} /*onRemove={this.onRemove}*/ onChangeTitle={this.onChangeTitle}/>
        const Content = <WinTabContentDoc key={tab.id} wrapClassName={activeTabID === tab.id ? "active" : ""} isActive={isActive} node={tab.node} onOpen={onOpen} onRemoved={()=>onRemove(tab.id)}/>;
        return (
            <>
                <div onMouseDown={() => { onSelect(tab.id) }} className={["win-tab-header-wrap", isActive ? " active" : ""].join("")}>
                    {Header}
                </div>
                <div className={["win-tab-content-wrap", isActive ? " active" : ""].join("")}>
                    {Content}
                </div>
                <TransitionModal
                    ref={(modal)=>{this.transitionModal=modal}}
                    title={null}
                    footer={<div className="remove-modal__footer"><Button onMouseDown={this.onCancelSaveAndRemove}>不保存</Button><div className="remove-modal__footer-right"><Button onMouseDown={this.onHideConfirmModal}>取消</Button><Button type="primary" onClick={this.onConfirmSaveAndRemove} loading={confirmLoading}>保存</Button></div></div>}
                    closable={false}
                    width={300}
                    top="-300px"
                    maskStyle={{backgroundColor: 'transparent'}}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="remove-modal"
                >
                    <div className="remove-modal__content">
                        <div className="remove-modal__title">
                            <ExclamationCircleOutlined className="remove-modal__icon"/>
                            <span>是否保存当前改动到 {title}? </span>
                        </div>
                        <div className="remove-modal__info">
                            <span>当前内容改动尚未保存，不保存将导致修改丢失</span>
                        </div>
                    </div>
                </TransitionModal>
            </>
        )
    }
}