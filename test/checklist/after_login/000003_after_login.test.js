const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
const environment = process.env.ENV || 'prod';
const accountType = process.env.ACCOUNT_TYPE || 'operator';
const { DEPTH, ORDERS, NEW_ORDER } = config.menuOption[environment] || {};
const depth = DEPTH[accountType]
const orders = ORDERS[accountType]
const newOrder = NEW_ORDER[accountType]
const acc = config.accounts[environment][accountType];
let driver;

describe(`---------- After Login 000020-000030 ${orders}/${depth} ---------`, () => {
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
                    await userInput.sendKeys(acc.user);
                    const passInput = await findElementSync(driver, '#passwordInput', null, true, 500);
                    await passInput.sendKeys(acc.pass);
                    const loginBtn = await findElementSync(driver, '#loginButton', null, true, 500);
                    await loginBtn.click();
                    console.log('Click login button success');
                    await driver.sleep(5000);
                    const pinInput = await findElementSync(driver, '.pinFormRoot input', null, true, 300);
                    await driver.sleep(1000);
                    await pinInput.sendKeys(acc.pin);
                    console.log('Enter pin success');
                    await driver.sleep(5000);
                    const whatsNewButton = await findElementSync(driver, '.whatsNewFooter .btn');
                    await whatsNewButton.click();
                    await driver.sleep(2000);
                    if (config.isShowTermOfUse) {
                        const termUseButton = await findElementSync(driver, '.i-accept');
                        await termUseButton.click();
                    }
                    console.log('Close pop-ups successfully');
                    // Close widgets
                    await closeWidget(driver);
                    done();
                } catch (error) {
                    console.log('Error loggin in: ', error);
                }
            })();
        })

        orders && it(`Check ${orders}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${orders}`);
                    // Display widget with Open as default tab
                    const accountId = '182756'
                    let passedCase = 0;
                    const DEFAULT_TAB = 'Open';
                    const NUMBER_OF_CASE = 2;
                    await driver.sleep(300);
                    const ordersBtn = await getWidget(driver, orders);
                    await driver.sleep(300);
                    await ordersBtn.click();
                    await driver.sleep(2000);
                    const orderRoot = await findElementSync(driver, '#orderRoot');
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', orderRoot);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    const symbol = await input.getAttribute('value');
                    await driver.sleep(300);
                    symbol && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(accountId);
                    await driver.sleep(300);
                    const account = await findElementSync(driver, '.itemSuggest.searchAllAccounts.showTitle', searchAccountContainer)
                    await driver.sleep(300);
                    await account.click();
                    await driver.sleep(2000);
                    const firstRow = await findElementSync(driver, '.firstRow', orderRoot)
                    const content = await findElementSync(driver, '.grid-theme', orderRoot)
                    const orderHide = await findElementSync(driver, '.orderHide', firstRow);
                    const text = await orderHide.getText();
                    if (text === DEFAULT_TAB && content) {
                        console.log('Display tab Open: SUCCESSFUL');
                        passedCase++;
                    } else {
                        console.log('Display tab Open: FAILED');
                    }
                    // Check others tab
                    await orderHide.click();
                    await driver.sleep(1000);
                    let list = await findElementSync(driver, '.list>div', firstRow, false);
                    let options = [
                        {label: 'All', hasBtnDisable: true},
                        {label: 'Open', hasBtnDisable: false},
                        {label: 'Stop Loss', hasBtnDisable: false},
                        {label: 'Filled', hasBtnDisable: true},
                        {label: 'Cancelled', hasBtnDisable: true}
                    ];
                    const resetDropdown = async () => {
                        const allOpt = list[0];
                        await allOpt.click();
                        await driver.sleep(1000);
                        let text = await orderHide.getText();
                        if (text !== '--') {
                            await allOpt.click();
                        }
                    }
                    for (let i = 0, len = options.length; i < len; i++) {
                        await resetDropdown();
                        const opt = options[i];
                        await driver.sleep(300);
                        if (i !== 0) {
                            await orderHide.click();
                            await driver.sleep(300);
                            list = await findElementSync(driver, '.list>div', firstRow, false)
                        }
                        await driver.sleep(300);
                        await list[i].click();
                        await driver.sleep(700);
                        const overlay = await findElementSync(driver, '.ag-overlay', orderRoot);
                        await driver.sleep(300);
                        const noDataText = await overlay.getText();
                        if (noDataText === 'No Data') {
                            console.log(`Tab ${opt.label} have no data`);
                            continue;
                        };
                    }
                    // Check filter
                    await resetDropdown();
                    await orderHide.click();
                    await driver.sleep(300);
                    list = await findElementSync(driver, '.list>div', firstRow, false);
                    await list[0].click();
                    await driver.sleep(1000);
                    const filterInput = await findElementSync(driver, '.input-filter', orderRoot);
                    const filterText = await filterInput.getText();
                    filterText && await filterInput.clear();
                    await filterInput.sendKeys(config.symbolObj.symbolWithMarket);
                    await driver.sleep(1000);
                    let overlay = await findElementSync(driver, '.ag-overlay', orderRoot);
                    let noDataText = await overlay.getText();
                    if (!noDataText) {
                        const rows = await findElementSync(driver, '.ag-body-container>div', orderRoot, false);
                        if (rows && rows.length) {
                            console.log('Check filtering: SUCCESSFUL')
                            passedCase++;
                        } else {
                            console.log('Check filtering: FAILED')
                        }
                    } else {
                        console.log('No symbol found!')
                        passedCase++;
                    }
                    await filterInput.clear();
                    await filterInput.sendKeys('');
                    await driver.sleep(4000);
                    // Check click buttons
                    await resetDropdown();
                    await orderHide.click();
                    await driver.sleep(300);
                    list = await findElementSync(driver, '.list>div', firstRow, false);
                    await list[1].click();
                    await driver.sleep(1000);
                    overlay = await findElementSync(driver, '.ag-overlay', orderRoot);
                    await driver.sleep(2000);
                    noDataText = await overlay.getText();
                    if (!noDataText) {
                        console.log('Check clicking action buttons')
                        const btnGroup = await findElementSync(driver, '.btn-group', orderRoot, true, null, false);
                        const actionButtons = await findElementSync(driver, '.btn', btnGroup, false);
                        for (let i = 0, len = actionButtons.length; i < len; i++) {
                            await actionButtons[i].click();
                        }
                    } else {
                        console.log('No buttons to click!')
                    }
                    if (passedCase === NUMBER_OF_CASE) {
                        console.log(`Check ${orders}: SUCCESSFUL`)
                        done();
                    } else {
                        console.log(`Check ${orders}: FAILED`)
                    }
                } catch (error) {
                    console.log(`Error checking ${orders}: ${error}`)
                }
            })();
        })

        // depth && it(`Check ${depth}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Starting checking ${depth}`);
        //             let passedCase = 0;
        //             const NUMBER_OF_CASES = newOrder ? 4 : 2;
        //             const SYMBOL = `AMC.ASX`
        //             const ordersBtn = await getWidget(driver, depth);
        //             await driver.sleep(500);
        //             await ordersBtn.click();
        //             await driver.sleep(2000);
        //             let securityInfo = await findElementSync(driver, '.securityInfo');
        //             const nodeSearchBox1 = await findElementSync(driver, '.nodeSearchBox', securityInfo);
        //             const input = await findElementSync(driver, 'input', nodeSearchBox1);
        //             const symbol = await input.getAttribute('value');
        //             symbol && input.clear();
        //             await input.sendKeys(SYMBOL);
        //             await driver.sleep(1000)
        //             const itemSuggestSymbol = await findElementSync(driver, '.itemSuggestSymbol', nodeSearchBox1);
        //             await itemSuggestSymbol.click();
        //             await driver.sleep(3000)
        //             console.log(`Checking changing symbol in ${depth}: SUCCESSFUL`);
        //             passedCase++;
        //             if (newOrder) {
        //                 // Click BUY button
        //                 const buyBtn = await findElementSync(driver, '.btnOrderinTM>.buyBtn', securityInfo);
        //                 await buyBtn.click();
        //                 const newOrderCom1 = await findElementSync(driver, '.newOrderContainer');
        //                 await driver.sleep(500);
        //                 const nodeSearchBox2 = await findElementSync(driver, '.nodeSearchBox', newOrderCom1);
        //                 const input2 = await findElementSync(driver, 'input', nodeSearchBox2);
        //                 const symbol2 = await input2.getAttribute('value');
        //                 const btnGroup1 = await findElementSync(driver, '.btnOrder.buy', newOrderCom1, false, null, false);
        //                 if (btnGroup1 && btnGroup1.length && symbol2 === SYMBOL) {
        //                     console.log('Check openning new order form with BUY side: SUCCESSFUL');
        //                     passedCase++;
        //                 } else {
        //                     console.log('Check openning new order form with BUY side: FAILED');
        //                 }
        //                 await closeWidget(driver, true);
        //                 await driver.sleep(3000);
        //                 // Click SELL button
        //                 securityInfo = await findElementSync(driver, '.securityInfo');
        //                 const sellBtn = await findElementSync(driver, '.btnOrderinTM>.sellBtn', securityInfo);
        //                 await sellBtn.click();
        //                 const newOrderCom2 = await findElementSync(driver, '.newOrderContainer');
        //                 await driver.sleep(500);
        //                 const nodeSearchBox3 = await findElementSync(driver, '.nodeSearchBox', newOrderCom2);
        //                 const input3 = await findElementSync(driver, 'input', nodeSearchBox3);
        //                 const symbol3 = await input3.getAttribute('value');
        //                 const btnGroup2 = await findElementSync(driver, '.btnOrder.sell', newOrderCom2, false, null, false);
        //                 if (btnGroup2 && btnGroup2.length && symbol3 === SYMBOL) {
        //                     console.log('Check openning new order form with SELL side: SUCCESSFUL');
        //                     passedCase++;
        //                 } else {
        //                     console.log('Check openning new order form with SELL side: FAILED');
        //                 }
        //             }
        //             const refreshBtn = await findElementSync(driver, '.refreshText');
        //             await refreshBtn.click();
        //             await driver.sleep(1500);
        //             passedCase++;
        //             if (passedCase === NUMBER_OF_CASES) {
        //                 console.log(`Check ${depth}: SUCCESSFUL`);
        //                 done();
        //             } else {
        //                 console.log(`Check ${depth}: FAILED`);
        //             }
        //         } catch (error) {
        //             console.log(`Error checking ${depth}: ${error}`)
        //         }
        //     })();
        // })

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
