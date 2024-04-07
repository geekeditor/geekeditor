import React, {Component} from 'react'
import './SketchBar.less'
import {bindEvent, unbindEvent} from '../utils/utils'

export default class SketchBar extends Component<{
    width: number;
    placementLeft?: boolean;
    onStart: ()=>void;
    onChange: (width:number)=>void;
    onEnd?: ()=>void;
}, {
    sketching: boolean
}> {
    private stretchStartX!: number;
    constructor(props:any) {
        super(props);
        this.state = {
            sketching: false
        }
    }

    onSketchStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.stretchStartX = event.pageX;
        this.setState({
            sketching: true
        })

        const {onStart} = this.props;
        bindEvent( document, 'mousemove', this.onSketchMove);
        bindEvent( document, 'mouseup', this.onSketchEnd);
        // bindEvent( document, 'mouseout', this.onSketchEnd);
        onStart();
    }

    onSketchMove = (e: Event) => {
        const event = e as MouseEvent
        const pageX = event.pageX;
        const offset = this.props.placementLeft ? this.stretchStartX - pageX : pageX - this.stretchStartX;
        const {width, onChange} = this.props;
        onChange(width + offset);
        // const width = Math.min(Math.max(width + offset, 200), 500);
        // this.setState({
        //     tabWidth: width
        // })
    }

    onSketchEnd = (e: Event) => {
        const onEnd = this.props.onEnd;
        this.setState({
            sketching: false
        })
        unbindEvent( document, 'mousemove', this.onSketchMove);
        unbindEvent( document, 'mouseup', this.onSketchEnd);
        // unbindEvent( document, 'mouseout', this.onSketchEnd);
        onEnd && onEnd();
    }

    render() {
        const {sketching} = this.state;
        // const style = this.props.placementLeft ? { width: sketching ? `600px` : `4px`, left: sketching ? `-300px` : `-2px`}: { width: sketching ? `600px` : `4px`, right: sketching ? `-300px` : `-2px`}
        return (
            <div className={["sketch-bar", sketching ? " sketch-bar--sketching" : "", this.props.placementLeft ? ' left' : ' right'].join("")} onMouseDown={this.onSketchStart}>
                <div className='sketch-bar__indirator'></div>
            </div>
        )
    }
}