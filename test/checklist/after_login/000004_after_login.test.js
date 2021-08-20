const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
const { defaultMarkets, codes } = require('../../helper/constances');
const environment = process.env.ENV || 'prod';
const accountType = process.env.ACCOUNT_TYPE || 'operator';
const { ACCOUNT_DETAILS, PORTFOLIO_HOLDING, PORTFOLIO_SUMMARY, CONTRACT_NOTE, NEW_ORDER } = config.menuOption[environment] || {};
const accountDetail = ACCOUNT_DETAILS[accountType]
const portfolioHolding = PORTFOLIO_HOLDING[accountType]
const portfolioSummary = PORTFOLIO_SUMMARY[accountType]
const contractNotes = CONTRACT_NOTE[accountType]
const newOrder = NEW_ORDER[accountType]
const acc = config.accounts[environment][accountType];
let driver;

describe(`---------- After Login 000031-000040 ${accountDetail}/${portfolioHolding}/${portfolioSummary}/${contractNotes} ---------`, () => {
    try {
        it('Open App', function (done) {
            driver = builder();
            (async () => {
                console.log('Start app')
                await driver.navigate().to(config.testDomain);
                console.log(`Go to domain: ${config.testDomain}`)
                await driver.wait(until.elementLocated(By.css('body')));
                await driver.sleep(15000);
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

        accountDetail && it(`Check ${accountDetail}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${accountDetail}`);
                    await driver.sleep(300);
                    const accountInfoButton = await getWidget(driver, accountDetail);
                    await driver.sleep(300);
                    await accountInfoButton.click();
                    await driver.sleep(3000);
                    const accountInfoComponent = await findElementSync(driver, '.userAccount')
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', accountInfoComponent);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    await driver.sleep(300);
                    const symbol = await input.getAttribute('value');
                    await driver.sleep(300);
                    symbol && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(config.accountInfo);
                    await driver.sleep(1000);
                    const account = await findElementSync(driver, '.itemSuggest.searchAllAccounts.showTitle', searchAccountContainer)
                    await driver.sleep(300);
                    await account.click();
                    await driver.sleep(5000);
                    const accountInfoContainer = await findElementSync(driver, '.accountInfoContainer', accountInfoComponent);
                    const infos = await findElementSync(driver, '.Info', accountInfoContainer, false);
                    let flag = true;
                    for (let i = 0, len = infos.length; i < len; i++) {
                        const innerText = await infos[i].getText();
                        if (!innerText) flag = false;
                    }
                    if (flag) {
                        console.log(`Check ${accountDetail}: SUCCESSFUL`);
                        await closeWidget(driver);
                        done();
                    } else {
                        console.log(`Check ${accountDetail}: FAILED`);
                    }
                } catch (error) {
                    console.log(`Error checking ${accountDetail}: ${error}`);
                }
                await closeWidget(driver);
            })()
        })

        portfolioHolding && it(`Check ${portfolioHolding}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${portfolioHolding}`);
                    let passCases = 0;
                    const NUMBER_OF_CASES = newOrder ? 5 : 4;
                    const ACCOUNT_ID = '159713'
                    await driver.sleep(300);
                    const portfolioButton = await getWidget(driver, portfolioHolding);
                    await driver.sleep(300);
                    await portfolioButton.click();
                    await driver.sleep(3000);
                    let portfolioComponent = await findElementSync(driver, '#portfolioRoot');
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', portfolioComponent);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    const accountID = await input.getAttribute('value');
                    await driver.sleep(300);
                    accountID && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(ACCOUNT_ID);
                    await driver.sleep(1000);
                    const account = await findElementSync(driver, '.itemSuggest', searchAccountContainer);
                    await driver.sleep(1000);
                    await account.click();
                    await driver.sleep(2000);
                    try {
                        await findElementSync(driver, '.accountInfo', portfolioComponent);
                        passCases++;
                        console.log(`Check ${portfolioHolding}: SUCCESSFUL`)
                    } catch (error) {
                        console.log(`Check ${portfolioHolding}: FAILED`)
                    }
                    try {
                        await findElementSync(driver, '.content-wrap', portfolioComponent);
                        passCases++;
                        console.log('Check holding state: SUCCESSFUL')
                    } catch (error) {
                        console.log('Check holding state: FAILED')
                    }
                    if (newOrder) {
                        await driver.sleep(2000);
                        const portfolioActions = await findElementSync(driver, '#portfolio-action', portfolioComponent);
                        const openNewOrderBtn = await findElementSync(driver, '.btn', portfolioActions);
                        await openNewOrderBtn.click();
                        await driver.sleep(3000);
                        try {
                            await findElementSync(driver, '.newOrderContainer');
                            passCases++;
                            console.log(`Open new order in ${portfolioHolding}: SUCCESSFUL`);
                        } catch (error) {
                            console.log(`Open new order in ${portfolioHolding}: SUCCESSFUL`);
                        }
                    }
                    await driver.sleep(1500);
                    portfolioComponent = await findElementSync(driver, '#portfolioRoot');
                    const option = await findElementSync(driver, '.content-nav>div.dropDown', portfolioComponent);
                    await driver.sleep(500);
                    await option.click();
                    await driver.sleep(300);
                    const list = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                    console.log('')
                    list && await list[1].click();
                    await driver.sleep(3000);
                    const lastDiv = await findElementSync(driver, '.content-nav>div:last-child', portfolioComponent);
                    const duration = await findElementSync(driver, '.dropDown>div:first-child', lastDiv);
                    const textDuration = await duration.getText();
                    if (textDuration === '3 Months') {
                        console.log(`Display duraion ${textDuration}: SUCCESSFUL`);
                        passCases++;
                    } else {
                        console.log(`Display duraion ${textDuration}: FAILED`);
                    }
                    await duration.click();
                    await driver.sleep(500);
                    let durationList = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                    let flag = true;
                    for (let i = 0, len = durationList.length; i < len; i++) {
                        if (i !== 0) {
                            await duration.click();
                            await driver.sleep(500);
                            durationList = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                        }
                        await driver.sleep(300);
                        await durationList[i].click();
                        await driver.sleep(3000);
                        try {
                            await findElementSync(driver, '.content-wrap .highcharts-container svg', portfolioComponent);
                        } catch (error) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        console.log(`Show chart when changing duration: SUCCESSFUL`);
                        passCases++;
                    } else {
                        console.log(`Show chart when changing duration: FAILED`);
                    }
                    if (passCases === NUMBER_OF_CASES) {
                        console.log(`Check ${portfolioHolding}: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Check ${portfolioHolding}: FAILED`);
                    }
                } catch (error) {
                    console.log(`Error checking ${portfolioHolding}: ${error}`);
                }
                await closeWidget(driver);
            })();
        })

        portfolioSummary && it(`Check ${portfolioSummary}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${portfolioSummary}`);
                    const ACCOUNT_ID = '159713';
                    await driver.sleep(300);
                    const accountSummaryButton = await getWidget(driver, portfolioSummary);
                    await driver.sleep(300);
                    await accountSummaryButton.click();
                    await driver.sleep(3000);
                    let accountSummaryComponent = await findElementSync(driver, '.accountSummaryContainer');
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', accountSummaryComponent);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    const symbol = await input.getAttribute('value');
                    symbol && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(ACCOUNT_ID);
                    await driver.sleep(1000);
                    const account = await findElementSync(driver, '.itemSuggest.searchAllAccounts.showTitle', searchAccountContainer)
                    await account.click();
                    await driver.sleep(3000);
                    console.log(`Check ${portfolioSummary}: SUCCESSFUL`);
                    done();
                } catch (error) {
                    console.log(`Error checking ${portfolioSummary}: ${error}`);
                }
                await closeWidget(driver);
            })()
        });

        contractNotes && it(`Check ${contractNotes}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${contractNotes}`);
                    let passCases = 0;
                    const NUMBER_OF_CASES = 3;
                    const SYMBOL = 'ANZ.ASX'
                    const ACCOUNT_ID = '159713';
                    await driver.sleep(300);
                    const contractNotesButton = await getWidget(driver, contractNotes);
                    await driver.sleep(300);
                    await contractNotesButton.click();
                    await driver.sleep(3000);
                    let contractNotesComponent = await findElementSync(driver, '.contractNoteContainer');
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', contractNotesComponent);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    const symbol = await input.getAttribute('value');
                    symbol && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(ACCOUNT_ID);
                    await driver.sleep(1000);
                    const account = await findElementSync(driver, '.itemSuggest.searchAllAccounts.showTitle', searchAccountContainer)
                    await account.click();
                    await driver.sleep(2000);
                    console.log(`Show data when changing account to ${ACCOUNT_ID}: SUCCESSFUL`);
                    passCases++;
                    const searchAndFilterContainer = await findElementSync(driver, '.searchAndFilterContainer', contractNotesComponent);
                    const nodeSearchBox1 = await findElementSync(driver, '.nodeSearchBox', searchAndFilterContainer);
                    const input1 = await findElementSync(driver, 'input', nodeSearchBox1);
                    const symbol1 = await input1.getAttribute('value');
                    symbol1 && input1.clear();
                    await driver.sleep(300);
                    await input1.sendKeys(SYMBOL);
                    await driver.sleep(1000);
                    const itemSuggestSymbol = await findElementSync(driver, '.itemSuggestSymbol', nodeSearchBox1);
                    await itemSuggestSymbol.click();
                    await driver.sleep(2000);
                    console.log(`Show data when changing symbol to ${SYMBOL}: SUCCESSFUL`);
                    passCases++;
                    const dropdown = await findElementSync(driver, '.dropDown>div:first-child', searchAndFilterContainer);
                    await dropdown.click();
                    await driver.sleep(500);
                    let list = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                    let flag = true;
                    for (let i = 0, len = list.length; i < len; i++) {
                        if (i !== 0) {
                            await dropdown.click();
                            await driver.sleep(500);
                            list = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                        }
                        const text = await list[i].getText();
                        await driver.sleep(300);
                        await list[i].click();
                        await driver.sleep(2000);
                        try {
                            await findElementSync(driver, '.contractNodeDataContainer', contractNotesComponent);
                            console.log(`Show data when changing duration to ${text}: SUCCESSFUL`);
                        } catch (error) {
                            flag = false;
                            console.log(`Show data when changing duration to ${text}: FAILED`);
                        }
                        await driver.sleep(500);
                    }
                    flag && passCases++;
                    if (passCases === NUMBER_OF_CASES) {
                        console.log(`Check ${contractNotes}: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Check ${contractNotes}: FAILED`);
                    }
                } catch (error) {
                    console.log(`Error checking ${contractNotes}: ${error}`);
                }
            })();
        })

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
