import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------08 - Check default status---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('08 - Check default status', function (done) {
            (async () => {
                console.log('Start checking default status')
                await driver.findElement(By.css('.loginButton')).click();
                const nextButton = await driver.findElement(By.css('.loginType > div:last-child'));
                const nextButtonText = await nextButton.getText();
                const liveButton = await driver.findElement(By.css('.loginType > div:first-child'));
                const liveButtonText = await liveButton.getText();

                if (nextButtonText === 'NEXT' && liveButtonText === 'LIVE') {
                    console.log('Found next && live button successfully')
                    const nextButtonCssBackgroundColor = await nextButton.getCssValue('backgroundColor');
                    const nextButtonCssColor = await nextButton.getCssValue('color');
                    const liveButtonCssBackgroundColor = await liveButton.getCssValue('backgroundColor');
                    const liveButtonCssColor = await liveButton.getCssValue('color');
                    if (nextButtonCssBackgroundColor === 'rgba(24, 189, 201, 1)' &&
                        nextButtonCssColor === 'rgba(255, 255, 255, 1)' &&
                        liveButtonCssBackgroundColor === 'rgba(0, 0, 0, 0)' &&
                        liveButtonCssColor === 'rgba(24, 189, 201, 0.54)') {
                        console.log('08 - Checked default status successfully')
                        done();
                    } else {
                        console.log('Checked color failed')
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
