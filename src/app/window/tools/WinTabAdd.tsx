import React, { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { LoadingOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { EDocsNodeType, IDocsNodeBase } from "../../../types/docs.d";
import sharedEventBus from "../../../utils/sharedEventBus";
import factory from '../../../docs/docsprovider/DocsProviderFactory';
import sharedScene from '../../../utils/sharedScene';
import TransitionModal from '../../../widgets/TransitionModal';
import { Button, Input, InputRef } from 'antd';
import { useTranslation } from 'react-i18next';


const WinTabAdd: React.FC<{ onOpen: (node: IDocsNodeBase) => void }> = function (props) {
    const { t } = useTranslation();
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState('Untitled')
    const transitionModal = useRef<TransitionModal>(null);
    const inputRef = useRef<InputRef>(null)
    const onHide = () => {
        if (transitionModal.current) {
            transitionModal.current.hideTransition();
        }
    }
    const onShow = () => {
        if (transitionModal.current) {
            transitionModal.current.showTransition();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300)
        }
    }

    const onSubmit = async () => {
        if (adding) {
            return;
        }


        const provider = factory.getSelectedProvider();

        const node = await sharedScene.getProviderScene(factory.selectedProvider) || provider;
        if (node) {
            setAdding(true);
            node.createNode({
                nodeType: EDocsNodeType.EDocsNodeTypeDoc,
                parentNode: node,
                data: {
                    title,
                    content: ""
                }
            }).then((node) => {
                if (node) {
                    node.mount().then((success) => {
                        if (success) {
                            props.onOpen(node);
                        }
                        setAdding(false)
                        onHide()
                    })
                } else {
                    setAdding(false)
                }
            })
        }
    }
    const onAddAtCurrentFolder = () => {
        onShow();
    }
    const onAdd = () => {
        sharedEventBus.trigger('onAdd');
    }

    const onChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const onConfirm = (event: FormEvent<HTMLInputElement>) => {
        if(title) {
            onSubmit()
        }
    }

    
    return <>
        <span className={["win-tab-bar__op", "win-tab-bar__op--add"].join(' ')} onClick={onAdd}><PlusOutlined /></span>
        {/* <TransitionModal
            ref={transitionModal}
            title={null}
            footer={null}
            onOk={onHide}
            onCancel={onHide}
            width={300}
            top="-200px"
            maskStyle={{ backgroundColor: 'transparent' }}
            destroyOnClose={true}
            transitionName=""
            maskTransitionName=""
            closeIcon={false}
            closable={true}
            wrapClassName="create-operation-modal"
        >
            <div className="create-form">
                <Input ref={inputRef} autoFocus={true} placeholder={t("settings.documentTitle")} value={title} onChange={onChangeTitle} onPressEnter={onConfirm}/>
                <Button type="primary" loading={adding} disabled={adding||!title} onClick={onSubmit}>
                    {t("common.create")}
                </Button>
            </div>
        </TransitionModal> */}
    </>
}
export default WinTabAdd