const { By, until } = require('selenium-webdriver');
const { config, builder } = require('../../config');
let driver;

describe('---------- Before Login: 000005 - Check Depth ---------', () => {
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

        it('Check Depth', function (done) {
            (async () => {
                console.log('Start checking depth')
                driver.findElement(By.css('#theMostInformation')).then(result => {
                    console.log('Render Depth component: SUCCESSFUL');
                    done();
                }).catch(error => {
                    console.log('Render Depth component: FAILED')
                });
            })();
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
