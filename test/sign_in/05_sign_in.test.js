import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------05 - Check click signin from menu---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('05 - Check click signin from menu', function (done) {
            (async () => {
                console.log('Start checking click signin from menu')
                await driver.findElement(By.css('.headerBoxHover')).click();
                const signInButton = await driver.findElement(By.css(`.menuContainer>div:last-child .itemMenuTitle`))
                const text = await signInButton.getText()
                if (text === 'Sign In') {
                    console.log('Found login button successsully')
                    await signInButton.click();
                    await driver.findElement(By.css('.rootLogin'))
                    done();
                } else {
                    console.log('Found login button fail')
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
    }
});
