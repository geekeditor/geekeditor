import React, { Component } from 'react'
import './MenuItem.less'
export default class MenuItem extends Component<{
    icon: React.ReactNode;
    name: string|React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>)=>void;
    incoming?: boolean;
    disabled?: boolean;
}> {
    render() {
        const {icon, name, onClick, incoming, disabled} = this.props;
        return (
            <div className={["ge-menu-item", incoming ? "ge-menu-item--incoming" : "", disabled ? "ge-menu-item--disabled" : ""].join(" ")} onClick={(event)=>!incoming && !disabled && onClick && onClick(event)}>
                {icon && <span className="ge-menu-item__icon">{icon}</span>}
                <span className="ge-menu-item__name">{name}</span>
            </div>
        )
    }
}