const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
const axios = require('axios');
const { defaultMarkets } = require('../../helper/constances');
let driver;

describe('---------- Before Login: 000008 - Check Menu ---------', () => {
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

        it('Check Menu', function (done) {
            (async () => {
                const menuOpts = {
                    'Sign In': 'Sign In',
                    'Chart': 'Chart',
                    'Market Overview': 'Market Overview',
                    'News': 'News'
                }
                console.log('Start checking menu')
                try {
                    let menuOptions = [];
                    const menuIcon = await driver.findElement(By.css('.headerBoxHover'));
                    menuIcon.click();
                    await driver.sleep(1000);
                    const signInButton = await driver.findElement(By.css(`.menuContainer>div.itemMenu:last-child .itemMenuTitle`))
                    const text = await signInButton.getText()
                    menuOptions.push(text);
                    const menuParts = await driver.findElements(By.css(`.menuContainer>.itemMenu`));
                    let promises = [];
                    menuParts.length = menuParts.length - 1;
                    for (let i = 0, len = menuParts.length; i < len; i++) {
                        const itemMenu = menuParts[i];
                        await itemMenu.click();
                        await driver.sleep(2000);
                        const menuContent = await itemMenu.findElement(By.css('.contentItemMenu'));
                        const subMenuOpts = await menuContent.findElements(By.css('.contentItemMenuRow'));
                        if (!subMenuOpts || !subMenuOpts.length) continue;
                        else {
                            for (let i = 0, len = subMenuOpts.length; i < len; i++) {
                                promises.push(subMenuOpts[i].getText());
                            }
                        }
                    }
                    const options = await Promise.all(promises);
                    options.map(opt => {
                        menuOptions.push(opt)
                    })
                    let flag = true;
                    menuOptions.map(opt => {
                        const option = menuOpts[opt];
                        if (option) console.log(`Menu option: ${opt}`);
                        else flag = false;
                    })
                    if (flag) {
                        console.log(`Display options ['Sign In', 'Market Overview', 'News', 'Chart']: SUCCESSFUL`)
                        done();
                    } else {
                        console.log(`Display options ['Sign In', 'Market Overview', 'News', 'Chart']: FAILED`)
                    }
                } catch (error) {
                    console.log(`Check Menu : FAILED\n${error}`)
                }
            })()
        })

        it('Quit App', function (done) {
            (async () => {
                await driver.quit();
                done();
            })();
        });
    } catch (error) {
        console.log(`Error: ${error}`)
    }
});
