import React, {Component, createRef} from 'react';

import './App.css';

class App extends Component {
    state = {
        datas: []
    };

    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/canvas');

        this.websocket.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);

                if (data.type === 'NEW_DATA') {
                    this.setState({datas: [...this.state.datas]});

                    this.onCanvasDraw(data.data.x, data.data.y);
                } else if (data.type === 'LAST_DATAS') {
                    this.setState({datas: data.datas});

                    data.datas.forEach(d => {
                        this.onCanvasDraw(d.data.x, d.data.y);
                    });
                }
            } catch (e) {
                console.log('Something went wrong', e);
            }
        }
    }

    generateColor = () => {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    };

    onCanvasDraw = (x, y) => {
        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = this.generateColor();
        ctx.fillRect(x, y, 10, 10);
    };

    onCanvasClick = e => {
        e.persist();

        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX - rect.left) - 5;
        const y = (e.clientY - rect.top) - 5;

        const data = {
            type: 'CREATE_DATA',
            data: {
                x: x,
                y: y
            }
        };

        ctx.fillStyle = this.generateColor();
        ctx.fillRect(x, y, 10, 10);

        this.websocket.send(JSON.stringify(data));
    };

    canvas = createRef();

    render() {
        return (
            <div className='App'>
                <canvas width="1200" height="600" ref={this.canvas} onClick={this.onCanvasClick}/>
            </div>
        );
    }
}

export default App;
