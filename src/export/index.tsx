import React, { Component } from "react"
import ReactDOM from "react-dom"
import "./index.less"

import TransitionModal from "../widgets/TransitionModal";
import ExportController from "./Controller";
import { title } from "process";
import i18n from "../i18n";

const TypeTitles:{[key: string]: string} = {
    "wechat": i18n.t("export.syncToOA"),
    "image": i18n.t("export.exportImage") + "(.png)",
    "html": i18n.t("export.exportHTML") + "(.html)",
    "pdf": i18n.t("export.exportPDF") + "(.pdf)"
}


class Export extends Component<{
}, {
    content: string,
    type: string,
    title: string,
    id: string
}> {

    static newInstance(props?: any) {
        props = props || {}
        const div = document.createElement("div");
        document.body.appendChild(div);
        const instance = ReactDOM.render(React.createElement(Export, props), div);

        return {

            show(options: { content: string, type: string, title: string, id: string }) {
                instance.show(options);
            },

            close() {
                instance.hide();
            },

            destroy() {
                ReactDOM.unmountComponentAtNode(div);
                document.body.removeChild(div);
            }
        }
    }

    private transitionModal!: TransitionModal | null;
    // private update!: AppUpdate | null;
    constructor(props: any) {
        super(props);
        this.state = {
            content: "",
            type: "",
            title: "",
            id: ""
        }
    }

    show(options: { content: string, type: string, title: string, id: string }) {
        this.setState({
            ...options
        })
        if (this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }

    hide() {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }

    onOk = () => {
        this.hide()
    }


    componentWillUnmount() {
    }

    componentDidMount() {

    }


    render() {
        const { content, type, title, id } = this.state;
        return (
            <div className="export">
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={<>
                        <span>{TypeTitles[type]}</span>
                    </>}
                    footer={null}
                    onOk={this.onOk}
                    onCancel={this.onOk}
                    width={800}
                    top="-700px"
                    maskStyle={{ backgroundColor: "transparent" }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="export-modal"
                >
                    <ExportController onComplete={this.onOk} type={type} content={content} title={title} id={id}/>
                </TransitionModal>
            </div>
        )
    }
}

const exportInstance = Export.newInstance();
export default exportInstance;