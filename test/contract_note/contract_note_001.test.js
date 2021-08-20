import { signin } from '../helper/functionUtils';

const { By, until } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------ContractNote - Test---------', () => {
    try {
        before((done) => {
            (async () => {
                driver = builder();
                await driver.navigate().to(config.domain);
                await driver.findElement(By.css('body'))
                await driver.sleep(4000);
                await signin(driver);
                done()
            })()
        });

        beforeEach(() => {
            console.log('Before each');
        });

        after((done) => {
            (async () => {
                console.log('Quit test');
                // await driver.quit();
                done();
            })()
        });

        it('Test display on Menu', (done) => {
            (async () => {
                await driver.wait(until.elementLocated(By.css('.headerBoxHover')), 10000).click();
                await driver.findElement(By.css(`.menuContainer>div:nth-child(6)`)).click();
                await driver.findElement(By.css(`.contentItemMenu>div:nth-child(3)`)).click();
                await driver.sleep(3000);
                done();
            })()
        });
    } catch (err) {
        console.log('ContractNote - Test error')
    }
})
