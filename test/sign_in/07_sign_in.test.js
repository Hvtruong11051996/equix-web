import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------Check fields in signin popup---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('Check fields in signin popup', function (done) {
            (async () => {
                console.log('Start checking fields in signin popup')
                await driver.findElement(By.css('.loginButton')).click();
                await driver.findElement(By.css('.closeLoginForm'));
                const liveButton = await driver.findElement(By.css('.loginType > div:first-child'));
                const liveButtonText = await liveButton.getText()
                const nextButton = await driver.findElement(By.css('.loginType > div:last-child'));
                const nextButtonText = await nextButton.getText();
                if (liveButtonText === 'LIVE' && nextButtonText === 'NEXT') {
                    console.log('Found next && live button successfully')
                    await driver.findElement(By.css('#closeEmail'));
                    await driver.findElement(By.css('#checkPassword'));
                    await driver.findElement(By.css('#checkBoxStayLogin'));
                    await driver.findElement(By.css('.backgroundCheckBox'));
                    console.log('Checked fields in signin popup successfully')
                    done();
                } else {
                    console.log('Checked next && live button failed')
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
