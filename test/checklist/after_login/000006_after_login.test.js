const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
const environment = process.env.ENV || 'prod';
const accountType = process.env.ACCOUNT_TYPE || 'operator';
const { USER_CLIENT_MAN, ALL_HOLDINGS, ALL_ORDERS, TRADING_FEES, WHATS_NEW, TERM_OF_USE } = config.menuOption[environment] || {};
const userClientManagement = USER_CLIENT_MAN[accountType]
const allHoldings = ALL_HOLDINGS[accountType]
const allOrders = ALL_ORDERS[accountType]
const tradingFees = TRADING_FEES[accountType]
const whatsNew = WHATS_NEW[accountType]
const termOfUse = TERM_OF_USE[accountType]
const acc = config.accounts[environment][accountType];
let driver;

describe(`---------- After Login 000049-000056 ${userClientManagement}/${allHoldings}/${allOrders}/${tradingFees}/${whatsNew}/${termOfUse} ---------`, () => {
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

        // allHoldings && it(`Check ${allHoldings}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Start checking ${allHoldings}`);
        //             let passCases = 0;
        //             const NUMBER_OF_CASES = 3;
        //             const testText = ['RIO', 'CCP']
        //             await driver.sleep(300);
        //             const allHoldingsButton = await getWidget(driver, allHoldings);
        //             await driver.sleep(300);
        //             await allHoldingsButton.click();
        //             await driver.sleep(2000);
        //             let allHoldingsComponent;
        //             try {
        //                 allHoldingsComponent = await findElementSync(driver, '#portfolioRoot');
        //                 await driver.sleep(2500);
        //                 console.log(`Check opening ${allHoldings}: SUCCESSFUL`);
        //                 passCases++;
        //             } catch (error) {
        //                 console.log(`Check opening ${allHoldings}: FAILED`);
        //             }
        //             const input = await findElementSync(driver, '.portfolioManagementSearch input', allHoldingsComponent);
        //             const text = await input.getText();
        //             text && input.clear();
        //             input.sendKeys(testText[0]);
        //             await driver.sleep(4000);
        //             try {
        //                 await findElementSync(driver, '.main-content', allHoldingsComponent);
        //                 passCases++;
        //                 console.log(`Check ${allHoldings} when filtered by ${testText[0]}: SUCCESSFUL`);
        //             } catch (error) {
        //                 console.log(`Check ${allHoldings} when filtered by ${testText[0]}: FAILED`);
        //             }
        //             input.clear();
        //             input.sendKeys(testText[1]);
        //             await driver.sleep(4000);
        //             try {
        //                 await findElementSync(driver, '.main-content', allHoldingsComponent);
        //                 passCases++;
        //                 console.log(`Check ${allHoldings} when filtered by ${testText[1]}: SUCCESSFUL`);
        //             } catch (error) {
        //                 console.log(`Check ${allHoldings} when filtered by ${testText[1]}: FAILED`);
        //             }
        //             await driver.sleep(1000);
        //             if (passCases === NUMBER_OF_CASES) {
        //                 console.log(`Check ${allHoldings}: SUCCESSFUL`);
        //                 done();
        //             } else {
        //                 console.log(`Check ${allHoldings}: FAILED`);
        //             }
        //         } catch (error) {
        //             console.log(`Error checking ${allHoldings}: ${error}`);
        //         }
        //         await closeWidget(driver);
        //     })()
        // })

        allOrders && it(`Check ${allOrders}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${allOrders}`);
                    let passedCase = 0;
                    const NUMBER_OF_CASE = 1;
                    const DEFAULT_TAB = 'Open';
                    await driver.sleep(300);
                    const ordersBtn = await getWidget(driver, allOrders);
                    await driver.sleep(300);
                    await ordersBtn.click();
                    await driver.sleep(2000);
                    const orderRoot = await findElementSync(driver, '#orderRoot');
                    const dropDownNormalAdmin = await findElementSync(driver, '.dropDownNormalAdmin', orderRoot)
                    const orderHide = await findElementSync(driver, '.orderHide', dropDownNormalAdmin);
                    const content = await findElementSync(driver, '.grid-theme', orderRoot)
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
                    let list = await findElementSync(driver, '.list>div', dropDownNormalAdmin, false);
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
                            list = await findElementSync(driver, '.list>div', dropDownNormalAdmin, false)
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
                    list = await findElementSync(driver, '.list>div', dropDownNormalAdmin, false);
                    await list[0].click();
                    await driver.sleep(1000);
                    const filterInput = await findElementSync(driver, '.input-filter', orderRoot);
                    const filterText = await filterInput.getText();
                    filterText && await filterInput.clear();
                    await filterInput.sendKeys('NAB.ASX');
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
                    await driver.sleep(2000);
                    if (passedCase === NUMBER_OF_CASE) {
                        console.log(`Check ${allOrders}: SUCCESSFUL`)
                        done();
                    } else {
                        console.log(`Check ${allOrders}: FAILED`)
                    }
                } catch (error) {
                    console.log(`Error checking ${allOrders}: ${error}`)
                }
                await closeWidget(driver);
            })()
        })

        // whatsNew && it(`Check ${whatsNew}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Start checking ${whatsNew}`);
        //             await driver.sleep(1000);
        //             const whatNewButton = await getWidget(driver, whatsNew);
        //             await driver.sleep(1000);
        //             await whatNewButton.click();
        //             const whatNewComponent = await findElementSync(driver, '.whatsNew');
        //             const whatNewHeaderOpts = await findElementSync(driver, '.whatsNewHeader>div', whatNewComponent, false);
        //             const closeBtn = whatNewHeaderOpts && whatNewHeaderOpts.length && whatNewHeaderOpts[whatNewHeaderOpts.length - 1]
        //             await driver.sleep(500);
        //             closeBtn && await closeBtn.click();
        //             console.log(`Check ${whatsNew}: SUCCESSFUL`);
        //             done();
        //         } catch (error) {
        //             console.log(`Error checking ${whatsNew}: ${error}`);
        //         }
        //     })()
        // })

        // termOfUse && it(`Check ${termOfUse}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Start checking ${termOfUse}`);
        //             await driver.sleep(1000);
        //             const termOfUseButton = await getWidget(driver, termOfUse);
        //             await driver.sleep(300);
        //             await termOfUseButton.click();
        //             const termUseComponent = await findElementSync(driver, '.terms-form');
        //             const closeBtn = await findElementSync(driver, '.ic-close', termUseComponent);
        //             await driver.sleep(500);
        //             closeBtn && await closeBtn.click();
        //             console.log(`Check ${termOfUse}: SUCCESSFUL`);
        //             done();
        //         } catch (error) {
        //             console.log(`Error checking ${termOfUse}: ${error}`);
        //         }
        //     })()
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
