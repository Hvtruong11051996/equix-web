import React, { useState } from 'react';
import Logo from './images/logoDark.svg';
import LogoDemo from './images/logoDark_demo.svg';
import './truonghoang.css';
import dataStorage from '../../dataStorage';
import { addVerUrl } from '../../helper/functionUtils';
import SvgIcon, { path } from '../Inc/SvgIcon';
import s from '../AuthV2/Auth.module.css';

function index(props) {
  const demoEnv = dataStorage.web_config.demo || {}
  const liveEnv = dataStorage.web_config[dataStorage.web_config.common.project] || {}

  const RenderLogo = () => {
    return (
      <div className="equix-img">
        {[liveEnv].map(item => {
          const logo = addVerUrl(dataStorage.theme === 'theme-dark' ? item.branding.logoDark : item.branding.logoLight)
          return <img key={item.env} src={logo} />
        })}
      </div>
    )
  }

  const PopUpTitle = props => {
    return (
      <div className="pop-up-title">
        <div className="logo-equix">
          <RenderLogo />
          <div className="pop-up__icon"><SvgIcon path={path.mdiClose} /></div>
        </div>
      </div>
    )
  }

  const MainEquix = props => {
    return (
      <div className="main-equix">
        <div className="equix-top">
          <h3>Log in to your account</h3>
          <div className="equix-top__selector">
            <div className="selector-live">
              <h4>LIVE</h4>
            </div>
            <div className="selector-demo">
              <h4>DEMO</h4>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const EquixAction = () => {
    return (
      <div className="equix-form">
        <div className="equix-group">
          <select className="equix-inputs">
            <option>Việt Nam</option>
            <option>Mỹ</option>
            <option>Trung Quốc</option>
            <option>Nhật Bản</option>
            <option>Hàn Quốc</option>
          </select>
          <input type="text" placeholder="Address" className="equix-inputs" />
        </div>
        <button type="submit" className="equix-action">Sign - Up</button>
      </div>
    )
  }
  return (
    <form>
      <div className="equix-app">
        <div className="sign-up">
          <PopUpTitle />
          <MainEquix />
          <EquixAction />
        </div>
      </div>
    </form>
  );
}

export default index;
