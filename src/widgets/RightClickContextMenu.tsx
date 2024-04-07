import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import {bindEvent, unbindEvent} from '../utils/utils'
import "./RightClickContextMenu.less"


export default class RightClickContextMenu extends Component<{
    children?: React.ReactElement;
    menus?: React.ReactNode;
}, {
    visible: boolean,
    left: number,
    top: number
}> {
    constructor(props: any) {
        super(props)

        this.state = {
            visible: false,
            left: 0,
            top: 0
        }
    }

    onHideContextMenus = () => {
        this.setState({
            visible: false
        })
        unbindEvent(document, 'click', this.onHideContextMenus);
    }

    onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            visible: true,
            left: e.pageX + 5,
            top: e.pageY
        })
        
        bindEvent(document, 'click', this.onHideContextMenus)
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
        unbindEvent(document, 'click', this.onHideContextMenus);
    }

    render() {

        let children
        if(this.props.children) {
            children = React.cloneElement(this.props.children, {
                onContextMenu: this.onContextMenu
            });
        }
        const {visible, left, top} = this.state
        
        const MenusPop = 
        <div style={{position: 'absolute', top: '0px', left: '0px', width: '100%'}} onClick={(e)=>{e.stopPropagation()}}>
            <div className="context-menus-popover" style={{left: `${left}px`, top: `${top}px`}}>
                <div className="context-menus-inner">
                {this.props.menus}
            </div>
            </div>
        </div>

        return (
            <>
                {children}
                {visible && ReactDOM.createPortal(MenusPop, document.body)}
            </>
        )
    }
}