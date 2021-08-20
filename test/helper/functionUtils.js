const { By, until } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

async function signin(driver) {
    const loginButton = await driver.wait(until.elementLocated(By.css('.loginButton')), 10000, 'waiting loginButton appear');
    await loginButton.click()
    await driver.findElement(By.css('#userNameInput')).sendKeys(config.username);
    await driver.findElement(By.css('#passwordInput')).sendKeys(config.password);
    await driver.findElement(By.css('#loginButton')).click();
    await driver.wait(until.elementLocated(By.css('.pinFormRoot>input')), 100000, 'waiting inputPin appear').sendKeys(config.pin);
    console.log('set pin success')
    const termFormAccept = await driver.wait(until.elementLocated(By.css('.i-accept')), 100000);
    if (termFormAccept) {
        console.log('term form is showed');
        await driver.findElement(By.css('#checkbox-termsform')).click();
        console.log('dont show again clicked');
        await termFormAccept.click();
        console.log('accept term clicked');
    }
    const whatNewsOk = await driver.findElement(By.css('.btn.fs15'));
    await driver.sleep(5000);
    if (whatNewsOk) {
        console.log('whatNews showed');
        // await whatNewsOk.click();
        // console.log('whatNews OK clicked');
    }
    console.log('Signed');
}

async function login(driver, done) {
    await driver.findElement(By.css('.loginButton')).click();
    await driver.findElement(By.css('#userNameInput')).sendKeys(config.username);
    await driver.findElement(By.css('#passwordInput')).sendKeys(config.password);
    await driver.findElement(By.css('#loginButton')).click();
    await driver.sleep(3000);
    await driver.findElement(By.css('.pinFormRoot'));
    await driver.findElement(By.css('.pinFormRoot > input')).sendKeys(config.pin);
    await driver.sleep(3000);
    await driver.findElement(By.css('.btn.fs15')).click();
    await driver.findElement(By.css('.i-accept')).click();
    done()
}

async function startApp(driver, done) {
    await driver.navigate().to(config.domain);
    console.log('go to domain')
    await driver.findElement(By.css('body'))
    await driver.sleep(4000);
    done();
}

async function findElementSync(driver, selector, container, isFindOne = true, sleep, needToWait = true) {
    try {
        needToWait && await driver.wait(until.elementLocated(By.css(selector)));
        await driver.sleep(500);
        const wrap = container || driver;
        sleep && await driver.sleep(sleep);
        let result;
        if (isFindOne) {
            result = wrap.findElement(By.css(selector));
        } else {
            result = wrap.findElements(By.css(selector));
        }
        return result;
    } catch (error) {
        console.log('Error: ', error)
        return null;
    }
}

async function getWidget(driver, widgetName) {
    const widgetsWithNoItem = ['New Order', 'Settings', `What's New`, 'Terms of Use'];
    try {
        await driver.sleep(100);
        const menuIcon = await findElementSync(driver, '.headerBoxHover');
        await driver.sleep(100);
        menuIcon.click();
        await driver.sleep(100);
        const itemMenus = await findElementSync(driver, '.menuContainer>.itemMenu', null, false);
        await driver.sleep(100);
        itemMenus.length = itemMenus.length - 1;
        for (let i = 0, len = itemMenus.length; i < len; i++) {
            const itemMenu = itemMenus[i];
            await driver.sleep(100);
            let text = await findElementSync(driver, '.itemMenuTitle', itemMenu);
            await driver.sleep(100);
            text = text && await text.getText();
            if (widgetsWithNoItem.indexOf(text) > -1) {
                if (text === widgetName) return itemMenu;
            } else {
                itemMenu.click();
                await driver.sleep(300);
                const menuContent = await findElementSync(driver, '.contentItemMenu', itemMenu);
                await driver.sleep(100);
                const subMenuOpts = await findElementSync(driver, '.contentItemMenuRow', menuContent, false);
                if (!subMenuOpts || !subMenuOpts.length) continue;
                else {
                    for (let i = 0, len = subMenuOpts.length; i < len; i++) {
                        const component = subMenuOpts[i];
                        await driver.sleep(100);
                        const text = await component.getText();
                        if (text === widgetName) return component;
                    }
                }
            }
        }
    } catch (error) {
        console.log(`Error getting widgets: ${error}`);
        return null;
    }
}

async function closeWidget(driver, isCloseCurrentWidget = false) {
    try {
        if (!isCloseCurrentWidget) {
            const closeIcons = await findElementSync(driver, '.lm_close_tab', null, false, null, false);
            if (closeIcons && closeIcons.length) {
                for (let i = 0, len = closeIcons.length; i < len; i++) {
                    await closeIcons[i].click();
                    await driver.sleep(500);
                }
            }
        } else {
            const widget = await findElementSync(driver, '.lm_tab.lm_active');
            const closeIcon = await findElementSync(driver, '.lm_close_tab', widget);
            if (closeIcon) {
                await closeIcon.click();
                await driver.sleep(500);
            }
        }
    } catch (error) {
        console.log('Error closing widgets: ', error)
    }
}

export {
    signin,
    login,
    startApp,
    getWidget,
    findElementSync,
    closeWidget
}
