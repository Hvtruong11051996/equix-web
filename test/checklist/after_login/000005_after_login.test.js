const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
const environment = process.env.ENV || 'prod';
const accountType = process.env.ACCOUNT_TYPE || 'operator';
const { REPORT, ACTIVITIES, SAXO_CLIENT_MAN } = config.menuOption[environment] || {};
const report = REPORT[accountType]
const activities = ACTIVITIES[accountType]
const saxoClientManagement = SAXO_CLIENT_MAN[accountType]
const acc = config.accounts[environment][accountType];
let driver;

describe(`---------- After Login 000041-000048 ${report}/${activities}/${saxoClientManagement} ---------`, () => {
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

        report && it(`Check ${report}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${report}`);
                    const mappActivitiesWithClass = {
                        'Financial Summary': 'finacialRoot',
                        'Holdings Valuation': 'rootHold',
                        'Cash Account Summary': 'cashAccountSummaryRoot',
                        'Transaction Summary': 'transactionSummaryRoot'
                    }
                    let passCases = 0;
                    const NUMBER_OF_CASES = 21;
                    const ACCOUNT_ID = '182756';
                    await driver.sleep(300);
                    const reportsButton = await getWidget(driver, report);
                    await driver.sleep(300);
                    await reportsButton.click();
                    await driver.sleep(2000);
                    let reportsComponent = await findElementSync(driver, '#rootReportsTab');
                    const searchAccountContainer = await findElementSync(driver, '.searchAccountContainer', reportsComponent);
                    const input = await findElementSync(driver, 'input', searchAccountContainer);
                    const symbol = await input.getAttribute('value');
                    symbol && input.clear();
                    await driver.sleep(300);
                    await input.sendKeys(ACCOUNT_ID);
                    await driver.sleep(1000);
                    const account = await findElementSync(driver, '.itemSuggest.searchAllAccounts.showTitle', searchAccountContainer)
                    await account.click();
                    await driver.sleep(2000);
                    try {
                        await findElementSync(driver, '.contentOfTab');
                        passCases++;
                        console.log(`Show ${report} content when changing account to ${ACCOUNT_ID}: SUCCESSFUL`);
                    } catch (error) {
                        console.log(`Show ${report} content when changing account to ${ACCOUNT_ID}: FAILED`);
                    }
                    const headBoxReport = await findElementSync(driver, '.headBoxReport', reportsComponent);
                    const reportType = await findElementSync(driver, '.dropDown', headBoxReport);
                    const div1 = await findElementSync(driver, 'div', reportType);
                    await div1.click();
                    await driver.sleep(500);
                    let list1 = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                    let flag = true;
                    for (let i = 0, len = list1.length; i < len; i++) {
                        if (i !== 0) {
                            await div1.click();
                            await driver.sleep(500);
                            list1 = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                        }
                        const text = await list1[i].getText();
                        console.log()
                        await driver.sleep(300);
                        await list1[i].click();
                        await driver.sleep(1500);
                        // FBI WARNING
                        const dropdowns = await findElementSync(driver, '.dropDown', headBoxReport, false);
                        const dropdown = dropdowns && dropdowns.length && dropdowns[dropdowns.length - 1];
                        const div = await findElementSync(driver, 'div', dropdown);
                        await div.click();
                        await driver.sleep(500);
                        let list = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                        const cls = mappActivitiesWithClass[text];
                        let flag = true;
                        for (let i = 0, len = list.length; i < len; i++) {
                            if (i !== 0) {
                                await dropdown.click();
                                await driver.sleep(300);
                                list = await findElementSync(driver, '#dropDownContent .DropDownTimeTab > div', false, false);
                            }
                            const durationText = await list[i].getText();
                            await driver.sleep(300);
                            await list[i].click();
                            await driver.sleep(1500);
                            try {
                                await findElementSync(driver, `.${cls}`, reportsComponent);
                                await driver.sleep(500);
                                console.log(`Display ${report} of ${text} in ${durationText}: SUCCESSFUL`);
                                passCases++;
                            } catch (error) {
                                console.log(`Display ${report} of ${text} in ${durationText}: FAILED`);
                            }
                        }
                        // END OF FBI WARNING
                    }
                    if (passCases === NUMBER_OF_CASES) {
                        console.log(`Check ${report}: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Check ${report}: FAILED`);
                    }
                } catch (error) {
                    console.log(`Error checking ${report}: ${error}`);
                }
                await closeWidget(driver);
            })();
        })

        activities && it(`Check ${activities}`, function (done) {
            (async () => {
                try {
                    console.log(`Start checking ${activities}`);
                    let passCases = 0;
                    const NUMBER_OF_CASES = 54;
                    await driver.sleep(300);
                    const activitiesButton = await getWidget(driver, activities);
                    await driver.sleep(300);
                    await activitiesButton.click();
                    await driver.sleep(2000);
                    let activitiesComponent = await findElementSync(driver, '.businessLogContainer');
                    const searchVsDropdown = await findElementSync(driver, '.searchVsDropdown', activitiesComponent);
                    const durations = await findElementSync(driver, '.dropDown', searchVsDropdown);
                    const div1 = await findElementSync(driver, 'div', durations);
                    await div1.click();
                    await driver.sleep(1500);
                    let list1 = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                    let flag = true;
                    for (let i = 0, len = list1.length; i < len; i++) {
                        if (i !== 0) {
                            await div1.click();
                            await driver.sleep(500);
                            list1 = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                        }
                        const text = await list1[i].getText();
                        console.log()
                        await driver.sleep(300);
                        await list1[i].click();
                        await driver.sleep(2000);
                        // FBI WARNING
                        const dropdowns = await findElementSync(driver, '.dropDown', searchVsDropdown, false);
                        const dropdown = dropdowns && dropdowns.length && dropdowns[dropdowns.length - 1];
                        const div = await findElementSync(driver, 'div', dropdown);
                        await div.click();
                        await driver.sleep(500);
                        let list = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                        let flag = true;
                        for (let i = 0, len = list.length; i < len; i++) {
                            if (i !== 0) {
                                await dropdown.click();
                                await driver.sleep(300);
                                list = await findElementSync(driver, '#dropDownContent .list > div', false, false);
                            }
                            const durationText = await list[i].getText();
                            await driver.sleep(300);
                            await list[i].click();
                            await driver.sleep(2000);
                            try {
                                await findElementSync(driver, `.agWapperContainer`, activitiesComponent);
                                await driver.sleep(500);
                                console.log(`Display report of ${text} in ${durationText}: SUCCESSFUL`);
                                passCases++;
                            } catch (error) {
                                console.log(`Display report of ${text} in ${durationText}: FAILED`);
                            }
                        }
                        // END OF FBI WARNING
                    }
                    if (passCases === NUMBER_OF_CASES) {
                        console.log(`Check ${activities}: SUCCESSFUL`);
                        done();
                    } else {
                        console.log(`Check ${activities}: FAILED`);
                    }
                } catch (error) {
                    console.log(`Error checking ${activities}: ${error}`);
                }
            })();
        });

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
