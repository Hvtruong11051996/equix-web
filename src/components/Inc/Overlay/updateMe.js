import Lang from '../Lang';
import Icon from '../Icon';
import React from 'react';
import ReactDom from 'react-dom';
import LoadingScreen from '../../LoadingScreen/LoadingScreen'

class UpdateMe extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    handleClickUpdate() {
        localStorageNew.clear();
        window.location.reload();
    }
    render() {
        return <LoadingScreen className='updateMeContainer'>
            <div><img className='loading_logo' src='updateLogo.png' /></div>
            <div className='textUpdateMe'>
                <Lang>lang_update_me_part1</Lang>
            </div>
            <div className='textUpdateMe'>
                <Lang>lang_update_me_part2</Lang>
            </div>
            <div className='buttonUpdateMe text-uppercase' onClick={() => this.handleClickUpdate()}>
                <Lang>lang_update_me</Lang>
            </div>
        </LoadingScreen>
    }
}
export default UpdateMe;
