import React, { Component } from "react"
import "./TextEdit.less"

export default class TextEdit extends Component<{
    text: string;
    onFinishing: (text:string)=>void;
}, {
    inputText: string
}> {

    textInput!: HTMLInputElement|null;
    constructor(props:any) {
        super(props);
        this.state = {
            inputText: 'Untitled'
        }
    }

    componentDidMount() {
        this.setState({
            inputText: this.props.text
        })

        if(this.textInput) {
            this.textInput.focus();
            this.textInput.select();
        }
    }


    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter' && this.textInput) {
            this.textInput.blur();
        }
    }

    onEnd = () => {
        const {onFinishing} = this.props;
        onFinishing(this.state.inputText.trim());
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            inputText: e.target.value
        })
    }

    render() {
        const { inputText } = this.state;
        return (
            <div className="text-edit">
                <input type="text" value={inputText} ref={(input) => { this.textInput = input; }} onClick={(e)=>{e.stopPropagation()}} onChange={this.onChange} onBlur={this.onEnd} onKeyDown={this.onKeyDown}/>
            </div>
        )
    }
}