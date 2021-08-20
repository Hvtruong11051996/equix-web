import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------09 - Check status of LIVE button---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('09 - Check status of LIVE button', function (done) {
            (async () => {
                console.log('09 - Start checking status of LIVE button')
                await driver.findElement(By.css('.loginButton')).click();
                const nextButton = await driver.findElement(By.css('.loginType > div:last-child'));
                const nextButtonText = await nextButton.getText();
                const liveButton = await driver.findElement(By.css('.loginType > div:first-child'));
                const liveButtonText = await liveButton.getText();

                if (nextButtonText === 'NEXT' && liveButtonText === 'LIVE') {
                    console.log('Found next && live button successfully')
                    await nextButton.click();
                    const liveButtonCssBackgroundColor = await liveButton.getCssValue('backgroundColor');
                    const liveButtonCssColor = await liveButton.getCssValue('color');
                    if (liveButtonCssBackgroundColor === 'rgba(0, 0, 0, 0)' &&
                        liveButtonCssColor === 'rgba(24, 189, 201, 0.54)') {
                        console.log('09 - Checked status of LIVE button successfully')
                        done();
                    } else {
                        console.log('09 - Checked status of LIVE button failed')
                    }
                } else {
                    console.log('Checked next && live  button failed')
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
