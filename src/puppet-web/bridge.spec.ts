#!/usr/bin/env ts-node
/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2017 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import * as test  from 'blue-tape'
// tslint:disable:no-shadowed-variable

// import * as sinon from 'sinon'
// const sinonTest   = require('sinon-test')(sinon)

import {
  launch,
}                 from 'puppeteer'

import Profile    from '../profile'

import Bridge     from './bridge'

test('PuppetWebBridge', async t => {
  const profile = new Profile()
  const bridge = new Bridge({ profile })
  await bridge.init()
  t.ok(bridge, 'Bridge instnace')
  await bridge.quit()
})

test('testBlockedMessage()', async t => {
  const BLOCKED_XML_ZH = `
    <error>
     <ret>1203</ret>
     <message>当前登录环境异常。为了你的帐号安全，暂时不能登录web微信。你可以通过手机客户端或者windows微信登录。</message>
    </error>
  `
  const BLOCKED_TEXT_ZH = [
    '当前登录环境异常。为了你的帐号安全，暂时不能登录web微信。',
    '你可以通过手机客户端或者windows微信登录。',
  ].join('')
   // tslint:disable:max-line-length
  const BLOCKED_XML_EN = `
    <error>
     <ret>1203</ret>
     <message>For account security, newly registered WeChat accounts are unable to log in to Web WeChat. To use WeChat on a computer, use Windows WeChat or Mac WeChat at http://wechat.com</message>
    </error>
  `
  const BLOCKED_TEXT_EN = [
    'For account security, newly registered WeChat accounts are unable to log in to Web WeChat.',
    ' To use WeChat on a computer, use Windows WeChat or Mac WeChat at http://wechat.com',
  ].join('')

  test('not blocked', async t => {
    const profile = new Profile()
    const bridge = new Bridge({ profile })

    try {
      await bridge.testBlockedMessage('this is not xml')
      t.pass('should not throw when no block message')
    } catch (e) {
      t.fail('should throw when no block message')
    }
  })

  test('zh', async t => {
    const profile = new Profile()
    const bridge = new Bridge({ profile })

    try {
      await bridge.testBlockedMessage(BLOCKED_XML_ZH)
      t.fail('should throw exception')
    } catch (e) {
      t.equal(e.message, BLOCKED_TEXT_ZH, 'should get zh blocked message')
    }
  })

  test('en', async t => {
    const profile = new Profile()
    const bridge = new Bridge({ profile })

    try {
      await bridge.testBlockedMessage(BLOCKED_XML_EN)
      t.fail('should throw exception')
    } catch (e) {
      t.equal(e.message, BLOCKED_TEXT_EN, 'should get en blocked message')
    }
  })
})

test('clickSwitchAccount()', async t => {
  const SWITCH_ACCOUNT_HTML = `
    <div class="association show" ng-class="{show: isAssociationLogin &amp;&amp; !isBrokenNetwork}">
    <img class="img" mm-src="" alt="" src="//res.wx.qq.com/a/wx_fed/webwx/res/static/img/2KriyDK.png">
    <p ng-show="isWaitingAsConfirm" class="waiting_confirm ng-hide">Confirm login on mobile WeChat</p>
    <a href="javascript:;" ng-show="!isWaitingAsConfirm" ng-click="associationLogin()" class="button button_primary">Log in</a>
    <a href="javascript:;" ng-click="qrcodeLogin()" class="button button_default">Switch Account</a>
    </div>
  `
  const profile = new Profile()
  const bridge = new Bridge({ profile} )

  test('switch account', async t => {
    const browser = await launch()
    const page = await browser.newPage()

    await page.setContent(SWITCH_ACCOUNT_HTML)
    const clicked = await bridge.clickSwitchAccount(page)

    await page.close()
    await browser.close()

    t.equal(clicked, true, 'should click the switch account button')
  })

  test('switch account', async t => {
    const browser = await launch()
    const page = await browser.newPage()

    await page.setContent('<h1>ok</h1>')
    const clicked = await bridge.clickSwitchAccount(page)

    await page.close()
    await browser.close()

    t.equal(clicked, false, 'should no button found')
  })

})
