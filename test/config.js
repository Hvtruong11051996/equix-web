const config = {
    domain: 'https://dev1.equixapp.com/',
    prodDomain: 'https://openmarkets.equixapp.com/',
    betaDomain: 'https://openmarkets-beta.equixapp.com/',
    username: 'minhpham',
    password: '123456',
    pin: '888888',
    env: 'prod',
    false_username: '000000',
    false_password: '000000',
    false_pin: '000000',
    testDomain: 'https://openmarkets.equixapp.com/',
    url: {
        DepthANZ: 'https://om-demo-services.equixapp.com/v1/feed-delayed-snapshot/level1/ASX/ANZ',
        ChartANZ: 'https://om-demo-services.equixapp.com/v1/historical/ASX/ANZ?interval=5m&from=06/11/18-10:25&to=16/11/18-10:26&count=500',
        marketNewsRealated: 'https://om-prod1-services.equixapp.com/v1/news/inquery?symbol=NABPA,SEK,AMPPA,ACC.XNYS,JXT,KEY.XNYS,LEA.XNYS,TEAM.XNAS,BHP,ATBHP,YTMBH1,CSR,CSL.XNYS,AD1,HNG,NABHG,NABHH,NAC,BHL,AXL,ANZPD,NAB,ANG,NABHA,RIM,IRI,CTD&page_id=1&duration=year',
        marketNewsAll: 'https://om-prod1-services.equixapp.com/v1/news/inquery?page_id=1&duration=year',
        searchSymbolInNews: symbol => `https://om-prod1-services.equixapp.com/v1/news/inquery?symbol=${symbol}&page_id=1&duration=year`
    },
    accountInfo: '182756',
    accounts: {
        prod: {
            operator: {
                user: 'admin.operator@quant-edge.com',
                pass: 'sWbHh6e2Z6',
                pin: '111111',
                url: 'https://om-prod1-services.equixapp.com/v1/auth'
            },
            advisor: {},
            retail: {
                user: 'it.operator@quant-edge.com',
                pass: '9tJUghjipx',
                pin: '111111',
                url: 'https://om-prod1-services.equixapp.com/v1/auth'
            }
        },
        beta: {
            operator: {},
            advisor: {},
            retail: {}
        }
    },
    menuOption: {
        prod: {
            NEW_ORDER: {
                operator: '',
                advisor: '',
                retail: ''
            },
            MARKET_OVERVIEW: {
                operator: 'Market Overview',
                advisor: '',
                retail: ''
            },
            WATCHLIST: {
                operator: 'Watchlists',
                advisor: '',
                retail: ''
            },
            DEPTH: {
                operator: 'Depth',
                advisor: '',
                retail: ''
            },
            CHART: {
                operator: 'Chart',
                advisor: '',
                retail: ''
            },
            NEWS: {
                operator: '',
                advisor: '',
                retail: ''
            },
            MARKET_NEWS: {
                operator: 'Market News',
                advisor: '',
                retail: ''
            },
            MORNING_STAR: {
                operator: 'Morningstar Fundamentals',
                advisor: '',
                retail: ''
            },
            TIP_RANK: {
                operator: 'TipRanks (US stock analysis)',
                advisor: '',
                retail: ''
            },
            ORDERS: {
                operator: 'Orders',
                advisor: '',
                retail: ''
            },
            ACCOUNT_INFO: {
                operator: '',
                advisor: '',
                retail: ''
            },
            PORTFOLIO_HOLDING: {
                operator: 'Portfolio (holdings)',
                advisor: '',
                retail: ''
            },
            PORTFOLIO_SUMMARY: {
                operator: 'Portfolio Summary',
                advisor: '',
                retail: ''
            },
            ACCOUNT_DETAILS: {
                operator: 'Account Details',
                advisor: '',
                retail: ''
            },
            CONTRACT_NOTE: {
                operator: 'Contract Notes',
                advisor: '',
                retail: ''
            },
            REPORT: {
                operator: 'Reports',
                advisor: '',
                retail: ''
            },
            ACTIVITIES: {
                operator: 'Activities',
                advisor: '',
                retail: ''
            },
            SETTINGS: {
                operator: 'Setting',
                advisor: '',
                retail: ''
            },
            SAXO_CLIENT_MAN: {
                operator: '',
                advisor: '',
                retail: ''
            },
            USER_CLIENT_MAN: {
                operator: '',
                advisor: '',
                retail: ''
            },
            ALL_HOLDINGS: {
                operator: 'All Holdings',
                advisor: '',
                retail: ''
            },
            ALL_ORDERS: {
                operator: 'All Orders',
                advisor: '',
                retail: ''
            },
            CREATE_USER: {
                operator: 'Create User',
                advisor: '',
                retail: ''
            },
            USER_DETAIL: {
                operator: '',
                advisor: '',
                retail: ''
            },
            USER_MAN: {
                operator: 'User Management',
                advisor: '',
                retail: ''
            },
            TRADING_FEES: {
                operator: '',
                advisor: '',
                retail: ''
            },
            WHATS_NEW: {
                operator: 'What\'s New',
                advisor: '',
                retail: ''
            },
            TERM_OF_USE: {
                operator: 'Terms of Use',
                advisor: '',
                retail: ''
            }
        }
    },
    isShowTermOfUse: false,
    symbolObj: {
        symbol: 'ANZ',
        symbolWithMarket: 'ANZ.ASX'
    }
};

module.exports = {
    config: config,
    builder: () => {
        const { Builder, Capabilities } = require('selenium-webdriver');
        // const {config} = require('./config');
        const chrome = require('selenium-webdriver/chrome');
        const options = new chrome.Options();
        options.addArguments('incognito');
        // options.addArguments('user-data-dir=' + __dirname + '/Profile');
        // options.addArguments('start-minimized');

        const chromeCapabilities = Capabilities.chrome();
        // chromeCapabilities.setPageLoadStrategy('none');
        let driver;

        return new Builder().withCapabilities(chromeCapabilities).setChromeOptions(options).build();
    }
};
