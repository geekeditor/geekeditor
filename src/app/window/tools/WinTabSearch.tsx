import React, { ChangeEvent, Component } from 'react'
import './WinTabSearch.less'
import { Popover, Input, Select, Button, InputRef } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, RightOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons'
import { debounce } from '../../../utils/throttle';
import { EDocsNodeChangeType, IDocsNode } from '../../../types/docs.d';
import { MESearchResult } from '@geekeditor/meditable/dist/types/types/index.d';
import { WithTranslation, withTranslation } from 'react-i18next';
const InputGroup = Input.Group
const ButtonGroup = Button.Group
const { Option } = Select;
const formats = ['bold', 'italic', 'underline', 'strikethrough', 'inlinecode', 'kbd', 'subscript', 'superscript', 'mark']
class WinTabSearch extends Component<{
    node: IDocsNode;
} & WithTranslation, {
    mode: string;
    searchKey: string;
    replaceKey: string;
    result: MESearchResult;
    isReplace: boolean;
    visible: boolean;
    replaceType: 'text' | 'format';
    replaceFormat: string;
}> {

    private onSearchDebounce!: Function;
    private inputRef!: InputRef|null;
    constructor(props: any) {
        super(props)
        this.state = {
            mode: 'search',
            searchKey: '',
            replaceKey: '',
            isReplace: false,
            result: {
                list: [],
                index: 0
            },
            visible: false,
            replaceType: 'text',
            replaceFormat: 'bold'
        }
        this.onSearchDebounce = debounce(this.onSearch, 200);
    }

    onReplaceTrigger = () => {
        this.setState({
            isReplace: !this.state.isReplace
        })
    }

    onChangeSearchKey = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            searchKey: (e.target as HTMLInputElement)?.value
        })
        this.onSearchDebounce()
    }

    onChangeReplaceKey = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            replaceKey: (e.target as HTMLInputElement)?.value
        })
    }

    onReplaceCurrent = () => {
        const { editable } = this.props.node
        if (editable) {
            const result = editable.replace({
                searchKey: this.state.searchKey,
                replaceKey: this.state.replaceKey,
                replaceType: this.state.replaceType,
                replaceFormat: this.state.replaceFormat,
                all: false,
                dir: 1
            })
            this.onUpdateResult(result);
        }
    }

    onReplaceAll = () => {
        const { editable } = this.props.node
        if (editable) {
            const result = editable.replace({
                searchKey: this.state.searchKey,
                replaceKey: this.state.replaceKey,
                replaceType: this.state.replaceType,
                replaceFormat: this.state.replaceFormat,
                all: true,
                dir: 1
            })
            this.onUpdateResult(result);
        }
    }

    onSearch = () => {
        const { editable } = this.props.node
        if (editable) {
            if (this.state.searchKey) {
                const result = editable.search({
                    searchKey: this.state.searchKey,
                    all: true,
                    dir: 1
                })
                this.onUpdateResult(result);
            } else {
                const result = editable.searchClear()
                this.onUpdateResult(result);
            }
        }
    }

    onPrev = () => {
        const { editable } = this.props.node
        if (editable) {
            const result = editable.searchJumpPrev()
            this.onUpdateResult(result);
        }
    }

    onNext = () => {
        const { editable } = this.props.node
        if (editable) {
            const result = editable.searchJumpNext()
            this.onUpdateResult(result);
        }
    }

    onSearchTrigger = (visible: boolean) => {

        if (visible) {
            this.onSearch()
        } else {
            this.onClear()
        }
        this.setState({
            visible
        }, ()=>{
            setTimeout(()=>{
                if(this.state.visible) {
                    if(this.inputRef){
                        this.inputRef.focus()
                    }
                }
            }, 500)
        })
    }

    onClear = () => {
        const { editable } = this.props.node
        if (editable) {
            const result = editable.searchClear()
            this.onUpdateResult(result);
        }
    }

    onUpdateResult = (result: MESearchResult | undefined) => {
        if (!result) {
            this.setState({
                result: {
                    list: [],
                    index: 0
                }
            })
        } else {
            this.setState({
                result
            })
        }
    }

    onChangeReplaceType = (replaceType: 'text' | 'format') => {
        this.setState({
            replaceType,
            replaceKey: replaceType === 'format' ? '' : this.state.replaceKey
        })
    }

    onChangeReplaceFormat = (replaceFormat: string) => {
        this.setState({
            replaceFormat,
        })
    }

    onSearchEvent = () => {
        const { editable } = this.props.node;
        if (editable) {
            const range = editable.selection.getRangeAt(0);
            const frag = range.cloneContents();
            const div = document.createElement('div');
            frag && div.appendChild(frag);
            const searchKey = div.textContent;
            if (searchKey) {
                this.setState({
                    searchKey
                })
            }
            this.setState({
                visible: true
            }, ()=>{
                setTimeout(()=>{
                    if(this.state.visible) {
                        if(this.inputRef){
                            this.inputRef.focus()
                        }
                    }
                }, 500)
                
            })
            this.onSearch();
        }

    }

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNode; }>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.node != this.props.node) {

            if (prevProps.node.editable) {
                prevProps.node.editable.off('search', this.onSearchEvent)
            }

            if (this.props.node.editable) {
                this.props.node.editable.on('search', this.onSearchEvent)
            }

            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged);

        }
    }


    onNodeChanged = (type: EDocsNodeChangeType) => {

        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeEditable) {
            const { editable } = this.props.node
            if (editable) {
                editable.on('search', this.onSearchEvent)
            }
        }
    }

    componentDidMount() {
        const node = this.props.node
        node.onChanged(this.onNodeChanged);
        setTimeout(() => {
            const { editable } = this.props.node
            if (editable) {
                editable.on('search', this.onSearchEvent)
            }

        }, 100)
    }

    componentWillUnmount() {
        const { editable } = this.props.node
        if (editable) {
            editable.off('search', this.onSearchEvent)
        }
        const node = this.props.node
        node.offChanged(this.onNodeChanged);
    }


    render() {
        const { t, node } = this.props;
        const { isReplace, searchKey, replaceKey, result, visible, replaceType, replaceFormat } = this.state;
        const isDisabled = node.extension !== '.md';
        // const searchBefore = (
        //     <Select defaultValue="text" className="search-before">
        //         <Option value="text"><i className="gei-text"></i></Option>
        //         <Option value="regex"><i className="gei-regex"></i></Option>
        //     </Select>
        // );
        const replaceBefore = (
            <Select value={replaceType} onChange={this.onChangeReplaceType} className="search-before">
                <Option value="text"><i className="gei-text"></i></Option>
                {/* <Option value="regex"><i className="gei-regex"></i></Option> */}
                <Option value="format"><i className="gei-format"></i></Option>
            </Select>
        );
        const formatOptions = formats.map((format) => {
            return <Option value={format} key={format}><i className={`gei-${format}`}></i></Option>
        })
        const formatAfter = (
            <Select value={replaceFormat} onChange={this.onChangeReplaceFormat} className="search-after">
                {formatOptions}
            </Select>
        )
        const isReplaceFormat = replaceType === 'format';
        const content = (
            <div className="search-replace">
                <div className="search-replace__trigger" onClick={this.onReplaceTrigger}>
                    {!isReplace ? <RightOutlined /> : <DownOutlined />}
                </div>
                <div className="search-replace__main">
                    <div className="search-block">
                        <InputGroup className="search-input-box">
                            <Input
                                type="text"
                                className="search-input"
                                ref={(ref)=>this.inputRef=ref}
                                // addonBefore={searchBefore}
                                value={searchKey}
                                onChange={this.onChangeSearchKey}
                                placeholder={t("settings.searchText")}
                                onPressEnter={this.onSearch}
                                suffix={
                                    <span className="search-result">{!!result.list.length && <span>{result.index + 1}/{result.list.length}</span>}</span>
                                }
                            />
                        </InputGroup>

                        {<ButtonGroup className="search-arrow">
                            <Button
                                size="small"
                                type="text"
                                className="search-arrow-btn"
                                disabled={result.list.length == 0}
                                onClick={this.onPrev}
                                icon={<ArrowUpOutlined />}
                            ></Button>

                            <Button
                                size="small"
                                type="text"
                                icon={<ArrowDownOutlined />}
                                className="search-arrow-btn"
                                disabled={result.list.length == 0}
                                onClick={this.onNext}
                            ></Button>
                        </ButtonGroup >
                        }
                    </div >
                    {isReplace && <div className="replace-block">
                        <Input disabled={isReplaceFormat} addonBefore={replaceBefore} addonAfter={isReplaceFormat ? formatAfter : null} type="text" className="replace-input" value={replaceKey} onChange={this.onChangeReplaceKey} placeholder={t("settings.replaceTo")} />
                        {<div className="operation-btns">
                            <InputGroup>
                                <Button size="small" type="text" onClick={this.onReplaceCurrent} disabled={result.list.length == 0} icon={<i className="gei-replace"></i>}></Button>
                                <Button size="small" type="text" disabled={result.list.length == 0} onClick={this.onReplaceAll} icon={<i className="gei-replace-all"></i>}></Button>
                            </InputGroup>

                        </div >}
                    </div >}
                </div >
            </div>
        );
        return (
            <Popover placement="leftTop" title={null} content={content} open={visible} trigger="click" onOpenChange={this.onSearchTrigger}>
                <span className={["win-tab-bar__op", isDisabled ? " win-tab-bar__op--disabled" : "", visible ? " active" : ""].join("")}><SearchOutlined /></span>
            </Popover>
        )
    }
}

export default withTranslation()(WinTabSearch)