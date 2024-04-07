import React, { Component } from 'react'
import "./BarItem.less"
import { Tooltip } from 'antd'
import { TooltipPlacement } from 'antd/lib/tooltip';
import tooltip from '../utils/tooltip';

export default class BarItem extends Component<{
    icon: React.ReactNode;
    id?: string;
    label?: string;
    tip?: string;
    placement?: TooltipPlacement;
    defaultOpen?: boolean;
    wrapClassName?: string;
    onClick?: (e?: React.MouseEvent) => void;
    selected?: boolean;
    disabled?: boolean;
}> {

    private wrapper!: HTMLDivElement|null;

    onAddTip = (wrapper: HTMLDivElement|null) => {
        const { tip, placement, defaultOpen } = this.props;
        if (tip && wrapper) {
            tooltip.onHover(wrapper, tip, {
                placement: placement || 'top',
                hidingDelay: 100,
            })

            if(defaultOpen) {
                tooltip.show(wrapper, tip, {
                    placement: placement || 'top',
                    hidingDelay: 100,
                })
                setTimeout(()=>{
                    tooltip.hide()
                }, 5000)
            }
        }
    }

    render() {
        const { icon, tip, placement, id } = this.props;
        const label = this.props.label;
        const wrapClassName = this.props.wrapClassName || '';
        const selClass = this.props.selected ? 'selected' : '';
        const disClass = this.props.disabled ? 'disabled' : '';
        const onClick = this.props.onClick;
        return (
            <>
                <div id={id} ref={this.onAddTip} className={["bar-item", wrapClassName, selClass, disClass].join(" ")} onClick={(e) => { if (onClick && !this.props.disabled) { onClick(e); e.stopPropagation() } }}>
                    {icon}
                    {label && <span className="bar-item__label">{label}</span>}
                </div>
                {/* {!!tip && <Tooltip placement={placement||'bottom'} title={tip} overlayClassName="bar-item-tooltip">
                    
                </Tooltip>}
                {!tip && <div id={id} className={["bar-item", wrapClassName, selClass, disClass].join(" ")} onClick={(e) => { if (onClick && !this.props.disabled) { onClick(e); e.stopPropagation() } }}>
                        {icon}
                        {label && <span className="bar-item__label">{label}</span>}
                    </div>} */}
            </>
        )
    }
}