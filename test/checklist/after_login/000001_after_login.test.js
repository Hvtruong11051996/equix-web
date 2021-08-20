const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const { findElementSync, closeWidget, getWidget } = require('../../helper/functionUtils');
const { defaultMarkets } = require('../../helper/constances')
const environment = process.env.ENV || 'prod';
const accountType = process.env.ACCOUNT_TYPE || 'operator';
const { NEW_ORDER, MARKET_OVERVIEW, CHART, MARKET_NEWS, MORNING_STAR, TIP_RANK } = config.menuOption[environment] || {};
const newOrder = NEW_ORDER[accountType]
const marketOverview = MARKET_OVERVIEW[accountType]
const chart = CHART[accountType]
const marketNews = MARKET_NEWS[accountType]
const morningStar = MORNING_STAR[accountType]
const tipRanks = TIP_RANK[accountType]
const acc = config.accounts[environment][accountType];
let driver;

describe(`---------- After Login 000001-000010 Login/${newOrder || ''}/${marketOverview || ''}/${marketNews || ''}/${chart || ''}/${morningStar || ''}/${tipRanks || ''} ---------`, () => {
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

        // newOrder && it(`Check ${newOrder}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Start checking ${newOrder}`);
        //             const newOrderComponent = await getWidget(driver, newOrder);
        //             await newOrderComponent.click();
        //             const widgetTitles = await findElementSync(driver, '.lm_title', null, false);
        //             let flag = false;
        //             for (let i = 0, len = widgetTitles.length; i < len; i++) {
        //                 const title = await widgetTitles[i].getText();
        //                 if (title === 'New Order') flag = true;
        //             }
        //             if (flag) {
        //                 console.log(`Open ${newOrder} widget: SUCCESSFUL`);
        //                 await closeWidget(driver);
        //                 done();
        //             } else {
        //                 console.log(`Open ${newOrder} widget: FAILED`)
        //             }
        //         } catch (error) {
        //             console.log(`Error openning ${newOrder}: ${error}`)
        //         }
        //         await closeWidget(driver);
        //     })();
        // })

        marketOverview && it(`Check ${marketOverview}`, function (done) {
            (async () => {
                try {
                    console.log(`Start openning ${marketOverview}`);
                    await driver.sleep(1000)
                    const marketOvwButton = await getWidget(driver, marketOverview);
                    await marketOvwButton.click();
                    const widgetTitles = await findElementSync(driver, '.lm_title', null, false);
                    let flag = false;
                    for (let i = 0, len = widgetTitles.length; i < len; i++) {
                        const title = await widgetTitles[i].getText();
                        if (title === 'Market Overview') flag = true;
                    }
                    if (flag) {
                        console.log(`Open ${marketOverview} widget: SUCCESSFUL`)
                        // Copy from 000001.beforeLogin.test.js file
                        console.log(`Start checking ${marketOverview}`);
                        await driver.sleep(500);
                        const marketOvwComponent = await findElementSync(driver, '.mk-overview');
                        const markets = await findElementSync(driver, '.flex', marketOvwComponent, false, null, false);
                        const result = [];
                        markets.map(mrk => {
                            result.push(mrk.getText());
                        })
                        const vals = await Promise.all(result)
                        let flag = true;
                        vals.map(val => {
                            const code = defaultMarkets[val];
                            if (code) console.log(`Market: ${code}`)
                            else flag = false;
                        })
                        if (flag) {
                            console.log(`Display markets: SUCCESSFUL`);
                            await closeWidget(driver);
                            done();
                        } else {
                            console.log(`Display markets: FAILED`);
                        }
                    } else {
                        console.log(`Open ${marketOverview} widget: FAILED`)
                    }
                } catch (error) {
                    console.log(`Error checking ${marketOverview}: ${error}`);
                }
                await closeWidget(driver);
            })();
        })

        marketNews && it(`Check ${marketNews}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${marketNews}`);
                    const NUMBER_OF_CASES = 3;
                    await driver.sleep(1000)
                    const newsButton = await getWidget(driver, marketNews);
                    await driver.sleep(1000)
                    await newsButton.click();
                    const newsComponent = await findElementSync(driver, '#newsContainer');
                    const nodeSearchBox1 = await findElementSync(driver, '.nodeSearchBox', newsComponent);
                    const input1 = await findElementSync(driver, 'input', nodeSearchBox1);
                    const symbol1 = await input1.getAttribute('value');
                    symbol1 && input1.clear();
                    await input1.sendKeys(`${config.symbolObj.symbolWithMarket}`);
                    await driver.sleep(3000)
                    let paginate = await findElementSync(driver, '.paginate>div', newsComponent);
                    await driver.sleep(7000)
                    let displayedNumber = await paginate.getText();
                    displayedNumber = displayedNumber.split(' ').pop();
                    let passedCase = 0;
                    if (isNaN(displayedNumber)) {
                        console.log(`Display records in tab All Market: FAILED`);
                    } else {
                        console.log(`Display ${displayedNumber} records in tab All market: SUCCESSFUL`);
                        passedCase++;
                    }
                    const marketnewsOptions = await findElementSync(driver, '.market-news-option', newsComponent);
                    const marketNewsBtnGroup = await findElementSync(driver, '.btnGroup', marketnewsOptions);
                    const marketNewsBtns = await findElementSync(driver, 'div', marketNewsBtnGroup, false);
                    const lastButton = marketNewsBtns[marketNewsBtns.length - 1];
                    await lastButton.click();
                    await driver.sleep(7000)
                    paginate = await findElementSync(driver, '.paginate>div', newsComponent);
                    displayedNumber = await paginate.getText();
                    displayedNumber = displayedNumber.split(' ').pop();
                    if (isNaN(displayedNumber)) {
                        console.log(`Display records in tab Related: FAILED`);
                    } else {
                        console.log(`Display ${displayedNumber} records in tab Related: SUCCESSFUL`);
                        passedCase++;
                    }
                    const nodeSearchBox = await findElementSync(driver, '.nodeSearchBox', marketnewsOptions);
                    const input = await findElementSync(driver, 'input', nodeSearchBox);
                    const symbol = await input.getAttribute('value');
                    symbol && input.clear();
                    await input.sendKeys(`${config.symbolObj.symbolWithMarket}`);
                    await driver.sleep(3000)
                    const itemSuggestSymbols = await findElementSync(driver, '.itemSuggestSymbol', nodeSearchBox, false);
                    if (itemSuggestSymbols && itemSuggestSymbols.length) {
                        await itemSuggestSymbols[0].click();
                        await driver.sleep(7000);
                        paginate = await findElementSync(driver, '.paginate>div', newsComponent);
                        displayedNumber = await paginate.getText();
                        displayedNumber = displayedNumber.split(' ').pop();
                        if (isNaN(displayedNumber)) {
                            console.log(`Display records when search ${config.symbolObj.symbolWithMarket} symbol: FAILED`);
                        } else {
                            console.log(`Display ${displayedNumber} records when search ${config.symbolObj.symbolWithMarket} symbol: SUCCESSFUL`);
                            passedCase++;
                        }
                        if (passedCase === NUMBER_OF_CASES) {
                            console.log(`Check ${marketNews}: SUCCESSFUL`)
                            done();
                        } else {
                            console.log(`Check ${marketNews}: FAILED`)
                        }
                    } else {
                        console.log('Symbol doesn\'t exist!');
                    }
                } catch (error) {
                    console.log(`Error checking ${marketNews}: ${error}`);
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
