const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
const { defaultMarkets, codes } = require('../../helper/constances');
let driver;
const {
    NEW_ORDER,
    MARKET_OVERVIEW,
    WATCHLIST,
    DEPTH,
    CHART,
    NEWS,
    MARKET_NEWS,
    MORNING_STAR,
    TIP_RANK, ORDERS,
    ACCOUNT_INFO,
    PORTFOLIO,
    ACCOUNT,
    CONTRACT_NOTE,
    REPORT,
    ACTIVITIES,
    SETTINGS,
    SAXO_CLIENT_MAN,
    USER_CLIENT_MAN,
    ALL_HOLDINGS,
    ALL_ORDER,
    CREATE_USER,
    USER_DETAIL,
    USER_MAN,
    TRADING_FEES,
    WHATS_NEW,
    TERM_OF_USE
} = config.menuOption[process.env.ENV] || {};

const OPERATOR = config.accounts.prod.operator;
var TOKEN;

describe('---------- After Login After Login 000061-000064 Create User/User Detail/User Management/Create Order ---------', () => {
    try {
        it('Open App', function (done) {
            driver = builder();
            (async () => {
                console.log('Start app')
                await driver.navigate().to(config.testDomain);
                console.log(`Go to domain: ${config.testDomain}`)
                await driver.wait(until.elementLocated(By.css('body')));
                await driver.sleep(7000);
                console.log('Open app: SUCCESSFUL')
                done()
            })();
        });

        it('Log in', function (done) {
            (async () => {
                try {
                    console.log('Logging in');
                    const loginFormOpenButton = await findElementSync(driver, '.loginButton');
                    await loginFormOpenButton.click();
                    const userInput = await findElementSync(driver, '#userNameInput', null, true, 500);
                    await userInput.sendKeys(OPERATOR.user);
                    const passInput = await findElementSync(driver, '#passwordInput', null, true, 500);
                    await passInput.sendKeys(OPERATOR.pass);
                    const loginBtn = await findElementSync(driver, '#loginButton', null, true, 500);
                    await loginBtn.click();
                    console.log('Click login button success');
                    await driver.sleep(5000);
                    const pinInput = await findElementSync(driver, '.pinFormRoot input', null, true, 300);
                    await driver.sleep(1000);
                    await pinInput.sendKeys(OPERATOR.pin);
                    console.log('Enter pin success');
                    await driver.sleep(5000);
                    const whatsNewButton = await findElementSync(driver, '.whatsNewFooter .btn');
                    await whatsNewButton.click();
                    await driver.sleep(3000);
                    const termUseButton = await findElementSync(driver, '.i-accept');
                    await termUseButton.click();
                    console.log('Close pop-ups successfully');
                    // Close widgets
                    await closeWidget(driver);
                    done();
                } catch (error) {
                    console.log('Error loggin in: ', error);
                }
            })();
        })

        // it('Check Create User', function (done) {
        //     (async () => {
        //         try {
        //             console.log('Start creating user');
        //             let passCases = 0;
        //             const NUMBER_OF_CASES = 54;
        //             const testText = 'RIO'
        //             await driver.sleep(300);
        //             const createUserButton = await getWidget(driver, 'Create user');
        //             await driver.sleep(300);
        //             await createUserButton.click();
        //             await driver.sleep(2000);
        //         } catch (error) {
        //             console.log('Error creating user: ', error);
        //         }
        //     })();
        // });

        it('Quit App', function (done) {
            (async () => {
                await driver.quit();
                done();
            })();
        });
    } catch (error) {
        console.log(`Error after login: ${error}`)
    }
});
