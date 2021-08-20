import React from 'react';
import News from '../News';

export class RelatedNews extends React.Component {
    constructor(props) {
        super(props);
        this.temp = '';
    }

    render() {
        return <News {...this.props} isRelated={true} />
    }
}

export default RelatedNews;
