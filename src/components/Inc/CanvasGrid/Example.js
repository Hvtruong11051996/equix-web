import { Component } from 'react';
import CanvasGrid from './CanvasGrid';
export default class Example extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                header: 'this is long title',
                name: 'title',
                type: 'label'
            },
            {
                header: 'Abc',
                name: 'abc',
                type: 'boolean'
            },
            {
                header: 'XYZ',
                name: 'xyz',
                type: 'dropdown',
                options: [
                    { label: 'AA', value: 'a' },
                    { label: 'BB', value: 'b' }
                ]
            },
            {
                header: 'aaa',
                name: 'aaa',
                type: 'boolean'
            },
            {
                header: 'bbb',
                name: 'bbb',
                type: 'boolean'
            }
        ];
    }
    componentDidMount() {
        this.setData([
            { title: 1, abc: 1 },
            { title: 2 },
            { title: 3 }
        ]);
    }
    render() {
        return <div>
            <div onClick={() => this.setEditmode(true)}>Edit</div>
            <div onClick={() => this.setEditmode(false)}>Cancel</div>
            <CanvasGrid
                columns={this.columns}
                fn={fn => {
                    this.setColumn = fn.setColumn
                    this.setData = fn.setData
                    this.setEditmode = fn.setEditmode
                }}
            />
        </div>
    }
}
