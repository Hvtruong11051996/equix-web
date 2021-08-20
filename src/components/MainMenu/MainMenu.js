import React from 'react';
import dataStorage from '../../dataStorage';
import Lang from '../Inc/Lang';
import NoTag from '../Inc/NoTag';
import { checkRole, checkShowAccountSearch, setLanguage, setFontSize, setTheme, isDev, isUAT1, isUAT2, checkShowOpeningAccount } from '../../helper/functionUtils';
import roleOrder from '../../constants/role_order';
import role from '../../constants/role';
import userTypeEnum from '../../constants/user_type_enum';
import s from './MainMenu.module.css';
import SvgIcon, { path } from '../Inc/SvgIcon';
import showModal from '../Inc/Modal';
import ConfirmLogout from '../ConfirmLogout';
import sideEnum from '../../constants/enum';
import { requirePin } from '../../helper/request';
import MapRoleComponent from '../../constants/map_role_component'
import Auth from '../AuthV2/Auth';
import env from '../../constants/enviroments'

class MainMenu extends React.Component {
  constructor() {
    super();
    dataStorage.mainMenuCallBack = () => {
      this.renderMenu()
    }
  }
  shouldComponentUpdate() {
    return false;
  }

  menuList = () => {
    const userGuide = dataStorage.translate('lang_config_user_guide')
    const loggedIn = dataStorage.userInfo;
    const isOperator = dataStorage.userInfo && (dataStorage.userInfo.user_type === userTypeEnum.OPERATOR)
    const lst = [];
    let show = true
    if (dataStorage.userInfo && dataStorage.userInfo.user_type !== role.OPERATION) {
      if (!(dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.filter(x => x.value.status === 'active').length)) show = false
    }

    lst.push({
      title: 'TruongHoang',
      role: MapRoleComponent.ENABLE,
      path: path.mdiAccountPlus,
      action: () => dataStorage.goldenLayout.addComponentToStack('Truong')
    });

    if (loggedIn && show) {
      lst.push({
        title: 'lang_new_order',
        role: MapRoleComponent.NEW_ORDER,
        path: path.mdiCartPlus,
        action: () => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { side: sideEnum.BUYSIDE } }))
      });
    }
    if (loggedIn) {
      if (dataStorage.env_config.roles.openingAccount) {
        lst.push({
          title: dataStorage.env_config.env === 'demo' ? 'lang_open_live_account' : 'lang_account_opening',
          path: path.mdiAccountPlus,
          action: () => {
            dataStorage.goldenLayout.addComponentToStack('OpeningAccount')
          },
          role: [MapRoleComponent.OPENING_ACCOUNT, checkShowOpeningAccount()]
        });
      }
    }
    if (loggedIn && show) {
      lst.push({
        title: 'lang_new_contingent_order',
        action: () => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { side: sideEnum.BUYSIDE }, contingentOrder: true })),
        role: [MapRoleComponent.CONTINGENT_ORDER_PAD, dataStorage.env_config.roles.contingentOrder]
      });
      lst.push('divider');
    }
    lst.push({
      title: 'lang_market_analysis',
      path: path.mdiCheckerboard,
      children: [
        {
          title: 'lang_market_overview',
          path: path.mdiChartMultiline,
          action: () => dataStorage.goldenLayout.addComponentToStack('MarketOverview'),
          role: [dataStorage.env_config.roles.viewMarketOverview, loggedIn ? MapRoleComponent.MarketOverview : true]
        },
        {
          title: 'lang_chart',
          path: path.mdiFinance,
          action: () => dataStorage.goldenLayout.addComponentToStack('ChartTV'),
          role: loggedIn ? MapRoleComponent.ChartTV : ''
        },
        {
          title: 'lang_alerts',
          path: path.mdiBell,
          action: () => dataStorage.goldenLayout.addComponentToStack('AlertList'),
          role: [!!loggedIn, MapRoleComponent.AlertList]
        },
        {
          title: 'lang_market_news',
          path: path.mdiNewspaper,
          action: () => dataStorage.goldenLayout.addComponentToStack('RelatedNews'),
          role: [dataStorage.env_config.roles.viewMarketNew, loggedIn ? MapRoleComponent.News : true]
        },
        {
          title: 'lang_morningstar_fundamentals',
          img: 'https://www.morningstar.com/favicon.ico',
          action: () => dataStorage.goldenLayout.addComponentToStack('MorningStar'),
          addOn: 'A1',
          role: [dataStorage.env_config.roles.viewMorningStar, !!loggedIn]
        },
        {
          title: 'lang_broker_data_reports',
          path: path.mdiFileAccount,
          action: () => dataStorage.goldenLayout.addComponentToStack('BrokerDataReports'),
          addOn: 'A2',
          role: [isOperator, dataStorage.env_config.roles.viewBrokerData, !!loggedIn]
        }
      ]
    });
    if (loggedIn) {
      lst.push({
        title: 'lang_trading',
        path: path.mdiTrendingUp,
        children: [
          {
            title: 'lang_new_order',
            path: path.mdiCartPlus,
            action: () => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Order', { stateOrder: 'NewOrder', data: { side: sideEnum.BUYSIDE } })),
            role: MapRoleComponent.NEW_ORDER
          },
          {
            title: 'lang_orders',
            path: path.mdiFormatListBulleted,
            action: () => dataStorage.goldenLayout.addComponentToStack('OrderList'),
            role: MapRoleComponent.OrderList
          },
          {
            title: 'lang_market_depth',
            path: path.mdiChartGantt,
            action: () => dataStorage.goldenLayout.addComponentToStack('MarketDepth'),
            role: MapRoleComponent.MarketDepth
          },
          {
            title: 'lang_course_of_sales',
            path: path.cos,
            action: () => dataStorage.goldenLayout.addComponentToStack('CourseOfSale'),
            role: MapRoleComponent.CourseOfSale
          },
          {
            title: 'lang_security_detail',
            path: path.mdiInformationOutline,
            action: () => dataStorage.goldenLayout.addComponentToStack('SecurityDetail', { openFromMenu: true }),
            role: MapRoleComponent.SecurityDetail
          },
          {
            title: 'lang_contract_list',
            path: path.contractList,
            action: () => dataStorage.goldenLayout.addComponentToStack('ContractList', { openFromMenu: true }),
            role: [dataStorage.env_config.roles.viewContractList, MapRoleComponent.ContractList]
          },
          {
            title: 'lang_watchlist',
            path: path.mdiViewList,
            action: () => dataStorage.goldenLayout.addComponentToStack('WatchlistBottom'),
            role: MapRoleComponent.WatchlistBottom
          }
        ]
      });
      lst.push({
        title: 'lang_portfolio',
        path: path.mdiBriefcaseVariant,
        children: [
          {
            title: 'lang_portfolio_holding',
            path: path.mdiWalletTravel,
            action: () => dataStorage.goldenLayout.addComponentToStack('Portfolio'),
            role: MapRoleComponent.Portfolio
          },
          {
            title: 'lang_portfolio_summary',
            path: path.mdiAccountAlert,
            action: () => {
              dataStorage.goldenLayout.addComponentToStack('PortfolioSummary');
            },
            isAnd: false,
            role: MapRoleComponent.PortfolioSummary
          }
        ]
      })
      lst.push({
        title: 'lang_account',
        path: path.mdiAccount,
        children: [
          {
            title: 'lang_account_details',
            path: path.mdiAccount,
            action: () => dataStorage.goldenLayout.addComponentToStack(dataStorage.env_config.roles.openingAccount ? 'AccountDetailNew' : dataStorage.env_config.roles.viewAccountDetail ? 'AccountDetail' : 'AccountInfo'),
            role: MapRoleComponent.AccountInfo
          },
          {
            title: 'lang_contract_notes',
            path: path.mdiClipboardText,
            action: () => dataStorage.goldenLayout.addComponentToStack('ContractNote'),
            role: [dataStorage.env_config.roles.viewContractNotes, MapRoleComponent.ContractNote]
          },
          {
            title: 'lang_insights',
            path: path.mdiFile,
            action: () => dataStorage.goldenLayout.addComponentToStack('Report'),
            role: [dataStorage.env_config.roles.viewInsights, MapRoleComponent.Report]
          },
          {
            title: 'lang_reports',
            path: path.mdiFileDocument,
            action: () => dataStorage.goldenLayout.addComponentToStack('NewReport'),
            role: [dataStorage.env_config.roles.viewReports, MapRoleComponent.NewReport]
          },
          {
            title: 'lang_activities',
            path: path.mdiInformationVariant,
            action: () => dataStorage.goldenLayout.addComponentToStack('Activities'),
            role: MapRoleComponent.Activities
          },
          {
            title: 'lang_user_infor',
            path: path.mdiAccountBox,
            action: () => dataStorage.goldenLayout.addComponentToStack('UserInfor'),
            role: MapRoleComponent.UserInfor
          }
        ]
      });
      const isHaveCreateUser = () => {
        return [2, 3].includes(dataStorage.userInfo.user_group)
      }
      lst.push('divider');
      if (dataStorage.userInfo && (dataStorage.userInfo.user_type === userTypeEnum.OPERATOR)) {
        lst.push({
          title: 'lang_operator',
          path: path.mdiFileAccount,
          children: [
            {
              title: 'lang_all_holdings',
              path: path.mdiWalletTravel,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllHoldings'),
              role: MapRoleComponent.AllHoldings
            },
            {
              title: 'lang_all_orders',
              path: path.mdiFormatListBulleted,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllOrders'),
              role: MapRoleComponent.AllOrders
            },
            {
              title: 'lang_create_user',
              path: path.mdiAccountPlus,
              action: () => dataStorage.goldenLayout.addComponentToStack('CreateUserNew'),
              role: MapRoleComponent.CreateUser
            },
            {
              title: 'lang_user_manager',
              path: path.mdiFolderAccount,
              action: () => dataStorage.goldenLayout.addComponentToStack('UserManager'),
              role: MapRoleComponent.UserManager
            },
            {
              title: 'lang_roles_management',
              path: path.mdiAccountGroup,
              action: () => dataStorage.goldenLayout.addComponentToStack('UserGroupManagement'),
              role: MapRoleComponent.UserGroupManagement
            },
            {
              title: 'lang_account_management',
              path: path.mdiFileAccount,
              action: () => dataStorage.goldenLayout.addComponentToStack(dataStorage.env_config.roles.openingAccount ? 'NewAccountManager' : 'AccountManager'),
              role: MapRoleComponent.AccountManager
            },
            // {
            //   title: 'lang_margin_account_summary',
            //   path: path.marginAccount,
            //   action: () => dataStorage.goldenLayout.addComponentToStack('MarginAccountSummary'),
            //   role: MapRoleComponent.MarginAccountSummary
            // },
            dataStorage.env_config.roles.showFuture ? {
              title: 'lang_margin_control_management',
              path: path.mdiMargin,
              action: () => dataStorage.goldenLayout.addComponentToStack('MarginControlManagement'),
              role: [dataStorage.env_config.roles.viewMarginControl, MapRoleComponent.MarginControlManagement]
            } : null,
            {
              title: 'lang_vetting_rules_management',
              path: path.mdiSourceBranch,
              action: () => dataStorage.goldenLayout.addComponentToStack('VettingRulesManagement'),
              role: MapRoleComponent.BranchManagement
            },
            {
              title: 'lang_market_data_management',
              path: path.mdiDatabase,
              action: () => dataStorage.goldenLayout.addComponentToStack('MarketDataManagement'),
              role: MapRoleComponent.MarketDataManagement
            },
            // {
            //   title: 'lang_margin_control_management',
            //   path: path.mdiMargin,
            //   action: () => dataStorage.goldenLayout.addComponentToStack('MarginControlManagement'),
            //   role: [dataStorage.env_config.roles.viewMarginControl, MapRoleComponent.MarginControlManagement]
            // },
            // {
            //   title: 'lang_margin_control_management',
            //   path: path.mdiMargin,
            //   action: () => dataStorage.goldenLayout.addComponentToStack('MarginControlManagementHTML'),
            //   role: [dataStorage.env_config.roles.viewMarginControl, MapRoleComponent.MarginControlManagement]
            // },
            {
              title: 'lang_process_end_of_day',
              path: path.mdiCalendarClock,
              action: () => dataStorage.goldenLayout.addComponentToStack('ProcessEod'),
              role: [dataStorage.env_config.roles.viewProcessEod, MapRoleComponent.ProcessEod]
            }
          ]
        });
      } else if (dataStorage.userInfo && dataStorage.userInfo.user_type === userTypeEnum.ADVISOR) {
        lst.push({
          title: 'lang_advisor',
          path: path.mdiFileAccount,
          children: [
            {
              title: 'lang_client_management',
              path: path.mdiAccountCircle,
              action: () => dataStorage.goldenLayout.addComponentToStack('UserAccount'),
              role: MapRoleComponent.UserAccount
            },
            dataStorage.env_config.roles.openingAccount ? {
              title: 'lang_account_management',
              path: path.mdiFileAccount,
              action: () => dataStorage.goldenLayout.addComponentToStack('NewAccountManager'),
              role: MapRoleComponent.AccountManager
            } : null,
            {
              title: 'lang_all_holdings',
              path: path.mdiWalletTravel,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllHoldings'),
              role: MapRoleComponent.AllHoldings
            },
            {
              title: 'lang_all_orders',
              path: path.mdiFormatListBulleted,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllOrders'),
              role: MapRoleComponent.AllOrders
            },
            {
              title: 'lang_create_user',
              path: path.mdiAccountPlus,
              action: () => dataStorage.goldenLayout.addComponentToStack('CreateUserNew'),
              role: [MapRoleComponent.CreateUser, isHaveCreateUser()]
            }
          ]
        });
      } else if (checkShowAccountSearch() || (dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length > 1)) {
        lst.push({
          title: 'lang_account_manager',
          path: path.mdiFileAccount,
          children: [
            {
              title: 'lang_client_management',
              path: path.mdiAccountCircle,
              action: () => dataStorage.goldenLayout.addComponentToStack('UserAccount'),
              role: MapRoleComponent.UserAccount
            },
            {
              title: 'lang_all_holdings',
              path: path.mdiWalletTravel,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllHoldings'),
              role: MapRoleComponent.AllHoldings
            },
            {
              title: 'lang_all_orders',
              path: path.mdiFormatListBulleted,
              action: () => dataStorage.goldenLayout.addComponentToStack('AllOrders'),
              role: MapRoleComponent.AllOrders
            }
          ]
        });
      }
      if (checkRole(MapRoleComponent.WHAT_NEWS) || checkRole(MapRoleComponent.TERM_OF_USE)) {
        lst.push('divider');
      }
      this.defineUtilitiesMenu(lst)
      lst.push({
        title: 'lang_settings',
        path: path.mdiCog,
        action: () => requirePin(() => dataStorage.goldenLayout.addComponentToStack('Settings')),
        role: MapRoleComponent.SETTING
      });
      lst.push('divider');
      lst.push({
        title: 'lang_whats_new',
        titleClass: 'text-normal',
        path: path.mdiAlertDecagram,
        action: () => dataStorage.goldenLayout.addComponentToStack('WhatsNew'),
        role: MapRoleComponent.WHAT_NEWS
      });
      lst.push({
        title: 'lang_terms_of_use',
        path: path.mdiMarkerCheck,
        action: () => dataStorage.goldenLayout.addComponentToStack('Terms', {
          name: 'TermsAndConditions'
        }),
        role: MapRoleComponent.TERM_OF_USE
      });
      lst.push({
        title: 'lang_support_ticket',
        path: path.mdiAccountAlert,
        action: () => {
          dataStorage.goldenLayout.addComponentToStack('SupportTicket');
        }
      });
      lst.push({
        title: 'lang_help_centre',
        path: path.mdiHelpCircle,
        action: () => {
          const helpCentreTab = window && window.open && window.open(userGuide, '_blank');
          helpCentreTab && helpCentreTab.focus();
        }
      });
      lst.push('divider');
      lst.push({
        title: 'lang_sign_out',
        path: path.mdiImport,
        action: () => {
          showModal({
            component: ConfirmLogout
          })
        }
      });
    } else {
      lst.push('divider');
      this.defineUtilitiesMenu(lst)
      lst.push('divider');
      lst.push({
        title: 'lang_help_centre',
        path: path.mdiHelpCircle,
        action: () => {
          const helpCentreTab = window && window.open && window.open(userGuide, '_blank');
          helpCentreTab && helpCentreTab.focus();
        }
      });
      lst.push('divider');
      lst.push({
        title: 'lang_sign_in',
        path: path.mdiImport,
        action: () => {
          showModal({
            component: Auth
          })
        }
      });
    }
    return lst;
  }
  fontAction = (e) => {
    setFontSize(e);
    this.renderMenu()
  }
  themeAction = (e) => {
    setTheme(e);
    this.renderMenu()
  }
  langAction = (lang) => {
    setLanguage(lang)
    this.renderMenu()
  }
  defineUtilitiesMenu = (list) => {
    const options = [
      {
        title: 'lang_text_size',
        path: path.mdiFormatSize,
        children: [
          {
            title: 'lang_small',
            path: path.mdiFormatSize,
            iconStyle: { width: '16px', margin: '2px' },
            action: () => this.fontAction('small'),
            active: dataStorage.currentFontSize === 'small'
          },
          {
            title: 'lang_medium',
            path: path.mdiFormatSize,
            action: () => this.fontAction('medium'),
            active: dataStorage.currentFontSize === 'medium'
          },
          {
            title: 'lang_large',
            path: path.mdiFormatSize,
            iconStyle: { width: '24px', margin: '-2px' },
            action: () => this.fontAction('large'),
            active: dataStorage.currentFontSize === 'large'
          }
        ]
      },
      {
        title: 'lang_theme_colour',
        path: path.mdiBrightness6,
        children: [
          {
            title: 'lang_dark_theme',
            path: path.mdiBrightness2,
            action: () => this.themeAction('theme-dark'),
            active: dataStorage.currentTheme === 'theme-dark'
          },
          {
            title: 'lang_light_theme',
            path: path.mdiBrightness7,
            action: () => this.themeAction('theme-light'),
            active: dataStorage.currentTheme === 'theme-light'
          }
        ]
      },
      {
        title: 'lang_language',
        path: path.mdiTranslate,
        children: [
          {
            title: 'lang_english',
            img: '/flag/gb.png',
            action: () => this.langAction('en'),
            active: dataStorage.currentLang === 'en'
          },
          {
            title: 'lang_chinese',
            img: '/flag/cn.png',
            action: () => this.langAction('cn'),
            active: dataStorage.currentLang === 'cn'
          },
          {
            title: 'lang_vietnamese',
            img: '/flag/vn.png',
            action: () => this.langAction('vi'),
            active: dataStorage.currentLang === 'vi'
          }
        ]
      }
    ]
    options.map(opt => list.push(opt))
  }
  enterMenuItem = (event) => {
    const menu = this.getMenuDom();
    const target = event.currentTarget;
    let rectOld = null;
    const sub = menu.querySelector('[parent=' + target.id + ']');
    target.parentNode.querySelectorAll('.' + s.hover).forEach(node => {
      node.classList.remove(s.hover);
      const subOld = menu.querySelector('[parent=' + node.id + ']');
      if (subOld) {
        rectOld = subOld.getBoundingClientRect();
        if (sub) {
          subOld.style.display = null;
        } else {
          subOld.style.pointerEvents = 'none';
          subOld.style.opacity = 1;
          subOld.style.transition = 'opacity .3s';
          subOld.style.opacity = 0;
        }
      }
    });
    target.classList.add(s.hover);
    if (sub) {
      sub.querySelectorAll('.' + s.hover).forEach(node => {
        node.classList.remove(s.hover);
      });
      const rect = target.getBoundingClientRect();
      const x = (window.innerWidth - 288 < rect.left + rect.width ? window.innerWidth - 288 : rect.left + rect.width) + 'px';
      sub.style.opacity = null;
      sub.style.pointerEvents = null;
      if (rectOld) {
        sub.style.transition = null;
        sub.style.transform = 'translate(' + x + ',' + rectOld.top + 'px)';
        sub.style.transition = 'transform .3s';
      } else {
        sub.style.pointerEvents = null;
        sub.style.opacity = 0;
        sub.style.transition = 'opacity .3s';
        sub.style.opacity = 1;
      }
      sub.style.display = 'block';
      // scroll
      if (sub.scrollHeight > window.innerHeight - 56) {
        sub.style.transform = 'translate(' + x + ',56px)';
      } else if (rect.top + sub.scrollHeight > window.innerHeight) sub.style.transform = 'translate(' + x + ',' + (window.innerHeight - sub.scrollHeight) + 'px)';
      // end scroll
      else sub.style.transform = 'translate(' + x + ',' + rect.top + 'px)';
    }
  }
  fillMenu = (item, index, prefix) => {
    prefix = (prefix || 'menu') + '-' + index;
    if (item === 'divider') return <div className={s.divider} key={index}></div>
    if (!item) return null;
    if (item.addOn) {
      if (dataStorage.userInfo && dataStorage.userInfo.addon && !dataStorage.userInfo.addon.includes(item.addOn)) return null;
      else if (!checkRole(item.role, item.isAnd)) return null;
    } else if (!checkRole(item.role, item.isAnd)) return null;
    let iconRight = null;
    if (item.active) iconRight = <SvgIcon path={path.mdiCheck} fill='var(--ascend-default)' />;
    else if (item.children) {
      const lst = item.children.map((m, i) => this.fillMenu(m, i, prefix)).filter(i => i);
      if (!lst.length) return null;
      this.children.push(<div className={s.subMenu} parent={prefix} key={prefix}>{lst}</div>)
      iconRight = <SvgIcon path={path.mdiChevronRight} />
    }
    const icon = item.img ? <img className='iconMenu' src={item.img} /> : <SvgIcon style={item.iconStyle} path={item.path || path.mdiChevronRight} />
    return <div className={s.item + (item.active ? ' ' + s.active : '')} key={index} id={prefix} onClick={item.action} onMouseEnter={this.enterMenuItem}>
      <div className={s.title}>
        {icon}
        <div className={s.text + ' ' + (item.titleClass || 'text-capitalize')}>{<Lang>{item.title}</Lang>}</div>
      </div>
      {iconRight}
    </div>
  }
  renderMenuContainer = () => {
    let text = [];
    dataStorage.env_config.branding && dataStorage.env_config.branding.env_desc && text.push(dataStorage.env_config.branding && dataStorage.env_config.branding.env_desc);
    if (dataStorage.userInfo && !checkRole(roleOrder)) {
      text.push('lang_view_only');
    } else {
      if (dataStorage.userInfo && dataStorage.userInfo.user_type !== role.OPERATION) {
        if (dataStorage.lstAccountCheck && dataStorage.lstAccountCheck.length === 1) {
          const accountInfo = (dataStorage.lstAccountCheck[0] && dataStorage.lstAccountCheck[0].value) || {};
          if (dataStorage.account_id === accountInfo.account_id) {
            if (!accountInfo.status) text.push('lang_this_account_is_not_enabled');
            else if (accountInfo.status === 'inactive') text.push('lang_this_account_is_inactive');
          }
        }
      }
    }
    const lst = this.menuList();
    this.children = [];
    return <NoTag>
      <div className={s.mainMenu}>
        {text.length ? <div className='DEMO size--3'>{text.map((txt, index) => {
          if (index && text.length > 1) return <span className='firstLetterUpperCase' key={index}>&nbsp;-&nbsp;{<Lang>{txt}</Lang>}</span>
          return <span className='firstLetterUpperCase' key={index}>{<Lang>{txt}</Lang>}</span>
        })}</div> : ''}
        <div>
          {lst.map((m, i) => this.fillMenu(m, i))}
        </div>
      </div>
      {this.children}
    </NoTag>
  }
  getMenuDom = () => {
    let menu = document.getElementById('mainMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'mainMenu';
      menu.className = '';
      menu.style.opacity = 0;
      // menu.style.transition = 'opacity .3s';
      menu.style.pointerEvents = 'none';
      document.body.appendChild(menu);
      menu.addEventListener('mouseenter', this.mouseEnter);
      ReactDOM.render(this.renderMenuContainer(), menu);
    }
    return menu;
  }
  renderMenu = () => {
    ReactDOM.render(this.renderMenuContainer(), this.getMenuDom());
  }
  mouseEnter = () => {
    if (this.opening) return;
    this.opening = true;
    const menu = this.getMenuDom();
    menu.style.opacity = 1;
    menu.style.pointerEvents = null;
    // scroll
    menu.firstChild.lastChild.style.maxHeight = window.innerHeight - menu.firstChild.lastChild.getBoundingClientRect().y + 'px';
    // end scroll
    this.dom.classList.add(s.hover);
    const closeMenu = (e) => {
      if (e.type === 'click' || (!menu.contains(e.target) && !this.dom.contains(e.target))) {
        menu.querySelectorAll('.' + s.hover).forEach(node => {
          node.classList.remove(s.hover);
          const sub = menu.querySelector('[parent=' + node.id + ']');
          if (sub) sub.style.display = null;
        });
        this.dom.classList.remove(s.hover);
        menu.style.opacity = 0;
        menu.style.pointerEvents = 'none';
        menu.removeEventListener('click', closeMenu);
        document.removeEventListener('mouseover', closeMenu);
        this.opening = false;
      }
    };
    menu.addEventListener('click', closeMenu);
    document.addEventListener('mouseover', closeMenu);
  }
  componentDidMount() {
    this.getMenuDom();
  }
  render() {
    return <div ref={dom => this.dom = dom} className={s.button} onMouseEnter={this.mouseEnter}><SvgIcon path={path.mdiMenu} /></div>
  }
}
export default MainMenu;
