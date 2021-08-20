const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const { getWidget, findElementSync, closeWidget } = require('../../helper/functionUtils');
let driver;
let driver2;
const { WATCHLIST } = config.menuOption[process.env.ENV || 'prod'] || {};
const OPERATOR = config.accounts.prod.operator;

describe(`---------- After Login 000011-000019 Check ${WATCHLIST} ---------`, () => {
    try {
        it('Open App', function (done) {
            driver = builder();
            driver2 = builder();
            (async () => {
                console.log('Start app')
                // await Promise.all([
                //     driver.navigate().to(config.testDomain),
                //     driver2.navigate().to(config.testDomain)
                // ])
                await driver.navigate().to(config.testDomain);
                await driver2.navigate().to(config.testDomain);
                console.log(`Go to domain: ${config.testDomain}`)
                // await Promise.all([
                //     driver.wait(until.elementLocated(By.css('body'))),
                //     driver2.wait(until.elementLocated(By.css('body')))
                // ]);
                await driver.wait(until.elementLocated(By.css('body')));
                await driver2.wait(until.elementLocated(By.css('body')));
                // await Promise.all([
                //     driver.sleep(7000),
                //     driver2.sleep(7000)
                // ])
                await driver.sleep(7000);
                await driver2.sleep(7000);
                console.log('Open app: SUCCESSFUL')
                done()
            })();
        });

        it('Log in', function (done) {
            (async () => {
                try {
                    console.log('Logging in');
                    // const [loginFormOpenButton, loginFormOpenButton2] = await Promise.all([
                    //     findElementSync(driver, '.loginButton'),
                    //     findElementSync(driver2, '.loginButton')
                    // ])
                    const loginFormOpenButton = await findElementSync(driver, '.loginButton');
                    const loginFormOpenButton2 = await findElementSync(driver2, '.loginButton');
                    // await Promise.all([
                    //     loginFormOpenButton.click(),
                    //     loginFormOpenButton2.click()
                    // ])
                    await loginFormOpenButton.click();
                    await loginFormOpenButton2.click();
                    // const [userInput, userInput2] = await Promise.all([
                    //     await findElementSync(driver, '#userNameInput', null, true, 500),
                    //     await findElementSync(driver2, '#userNameInput', null, true, 500)
                    // ])
                    const userInput = await findElementSync(driver, '#userNameInput', null, true, 500);
                    const userInput2 = await findElementSync(driver2, '#userNameInput', null, true, 500);
                    // await Promise.all([
                    //     userInput.sendKeys(OPERATOR.user),
                    //     userInput2.sendKeys(OPERATOR.user)
                    // ]);
                    await userInput.sendKeys(OPERATOR.user);
                    await userInput2.sendKeys(OPERATOR.user);
                    // const [passInput, passInput2] = await Promise.all([
                    //     findElementSync(driver, '#passwordInput', null, true, 500),
                    //     findElementSync(driver2, '#passwordInput', null, true, 500)
                    // ])
                    const passInput = await findElementSync(driver, '#passwordInput', null, true, 500);
                    const passInput2 = await findElementSync(driver2, '#passwordInput', null, true, 500);
                    // await Promise.all([
                    //     passInput.sendKeys(OPERATOR.pass),
                    //     passInput2.sendKeys(OPERATOR.pass)
                    // ]);
                    await passInput.sendKeys(OPERATOR.pass);
                    await passInput2.sendKeys(OPERATOR.pass);
                    // const [loginBtn, loginBtn2] = await Promise.all([
                    //     findElementSync(driver, '#loginButton', null, true, 500),
                    //     findElementSync(driver2, '#loginButton', null, true, 500)
                    // ])
                    const loginBtn = await findElementSync(driver, '#loginButton', null, true, 500);
                    const loginBtn2 = await findElementSync(driver2, '#loginButton', null, true, 500);
                    // await Promise.all([
                    //     loginBtn.click(),
                    //     loginBtn2.click()
                    // ]);
                    await loginBtn.click();
                    await loginBtn2.click();
                    console.log('Click login button success');
                    // await Promise.all([
                    //     driver.sleep(3000),
                    //     driver2.sleep(3000)
                    // ]);
                    await driver.sleep(3000);
                    await driver2.sleep(3000);
                    // const [pinInput, pinInput2] = await Promise.all([
                    //     findElementSync(driver, '.pinFormRoot input', null, true, 300),
                    //     findElementSync(driver2, '.pinFormRoot input', null, true, 300)
                    // ])
                    const pinInput = await findElementSync(driver, '.pinFormRoot input', null, true, 300);
                    const pinInput2 = await findElementSync(driver2, '.pinFormRoot input', null, true, 300);
                    // await Promise.all([
                    //     driver.sleep(1500),
                    //     driver2.sleep(1500)
                    // ]);
                    await driver.sleep(1500);
                    await driver2.sleep(1500);
                    // await Promise.all([
                    //     pinInput.sendKeys(OPERATOR.pin),
                    //     pinInput2.sendKeys(OPERATOR.pin)
                    // ]);
                    await pinInput.sendKeys(OPERATOR.pin);
                    await pinInput2.sendKeys(OPERATOR.pin);
                    console.log('Enter pin success');
                    // await Promise.all([
                    //     driver.sleep(7000),
                    //     driver2.sleep(7000)
                    // ]);
                    await driver.sleep(7000);
                    await driver2.sleep(7000);
                    // const [whatsNewButton, whatsNewButton2] = await Promise.all([
                    //     findElementSync(driver, '.whatsNewFooter .btn'),
                    //     findElementSync(driver2, '.whatsNewFooter .btn')
                    // ])
                    const whatsNewButton = await findElementSync(driver, '.whatsNewFooter .btn');
                    const whatsNewButton2 = await findElementSync(driver2, '.whatsNewFooter .btn');
                    // await Promise.all([
                    //     whatsNewButton.click(),
                    //     whatsNewButton2.click()
                    // ]);
                    await whatsNewButton.click();
                    await whatsNewButton2.click();
                    // await Promise.all([
                    //     driver.sleep(5000),
                    //     driver2.sleep(5000)
                    // ]);
                    await driver.sleep(5000);
                    await driver2.sleep(5000);
                    // const [termUseButton, termUseButton2] = await Promise.all([
                    //     findElementSync(driver, '.i-accept'),
                    //     findElementSync(driver2, '.i-accept')
                    // ])
                    const termUseButton = await findElementSync(driver, '.i-accept');
                    const termUseButton2 = await findElementSync(driver2, '.i-accept');
                    // await Promise.all([
                    //     termUseButton.click(),
                    //     termUseButton2.click()
                    // ]);
                    await termUseButton.click();
                    await termUseButton2.click();
                    console.log('Close pop-ups successfully');
                    // Close widgets
                    // await Promise.all([
                    //     closeWidget(driver),
                    //     closeWidget(driver2)
                    // ]);
                    await closeWidget(driver);
                    await closeWidget(driver2);
                    done();
                } catch (error) {
                    console.log('Error loggin in: ', error);
                }
            })();
        })

        // WATCHLIST && it(`Check ${WATCHLIST}`, function (done) {
        //     (async () => {
        //         try {
        //             console.log(`Start checking ${WATCHLIST}`);
        //             let passedCase = 0;
        //             const NUMBER_OF_CASE = 1;
        //             await driver.sleep(300);
        //             const watchlistBtn = await getWidget(driver, WATCHLIST);
        //             await driver.sleep(300);
        //             await watchlistBtn.click();
        //             await driver.sleep(2000);
        //             const watchlistComponent = await findElementSync(driver, '.watchlistRoot');
        //             const preDropDownNormal = await findElementSync(driver, '.pre-dropDownNormal', watchlistComponent);
        //             const dropDownHeader = await findElementSync(driver, '.dropDownHeader', preDropDownNormal);
        //             await driver.sleep(300);
        //             await dropDownHeader.click();
        //             await driver.sleep(700);
        //             let marketGroups = await findElementSync(driver, '.pre-qm>div', preDropDownNormal, false);
        //             marketGroups = marketGroups.slice(3);
        //             for (let i = 0, len = marketGroups.length; i < len; i++) {
        //                 await driver.sleep(300);
        //                 const marketGroup = await findElementSync(driver, '.qm-label>div', marketGroups[i]);
        //                 const marketGroupLabel = await marketGroup.getText();
        //                 await driver.sleep(300);
        //                 await await marketGroup.click();
        //                 await driver.sleep(500);
        //                 console.log(`-------: ${marketGroupLabel}`);
        //                 const qmLabels = await findElementSync(driver, '.submenu>.qm-label', marketGroups[i], false);
        //                 await driver.sleep(1500);
        //                 for (let i = 0, len = qmLabels.length; i < len; i++) {
        //                     const market = await findElementSync(driver, 'div:first-child', qmLabels[i]);
        //                     await driver.sleep(300);
        //                     const innerText = await market.getText();
        //                     await driver.sleep(300);
        //                     await qmLabels[i].click();
        //                     await driver.sleep(4000);
        //                     console.log(`Display ${WATCHLIST} [${marketGroupLabel}] - (${innerText}): SUCCESSFULL `);
        //                 }
        //             }
        //             await driver.sleep(3000);
        //             done();
        //         } catch (error) {
        //             console.log(`Error checking ${WATCHLIST}: ${error}`);
        //         }
        //     })();
        // })

        it('Quit App', function (done) {
            (async () => {
                // await Promise.all([
                //     driver.quit(),
                //     driver2.quit()
                // ]);
                await driver.quit();
                await driver2.quit();
                done();
            })();
        });
    } catch (error) {
        console.log(`Error after login: ${error}`)
    }
});
