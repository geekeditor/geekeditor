import React from 'react';
import "./fonts.css"
import "./normalize.css"
import "./grid.css"
import "./App.less"

import logo from './assets/icon_128x128.png'
import chromeIcon from './assets/chrome_128.png'
import checkIcon from './assets/check-circle.svg'
import startIcon from './assets/star.svg'
import { WithTranslation, withTranslation } from 'react-i18next';
import { GithubOutlined } from '@ant-design/icons';

class App extends React.Component<WithTranslation> {

    componentDidMount() {
    }

    render() {
        const {t} = this.props
        return <>
            <section className="background">
        <nav className="container">
            <div className="navigation">
                <a href="/" className="navigation__item logo" style={{flexFlow: '1'}}>
                    <img src={logo} alt="GeekEditor" />
                    <span className="brand" style={{fontSize: '20px'}}>{t("landing.geekEditor")}</span>
                </a>
                <a href="https://github.com/geekeditor" target='blank' className="navigation__item logo" style={{flexFlow: '1'}}>
                    <GithubOutlined style={{fontSize: "30px"}}/>
                </a>
            </div>
        </nav>
    
        <main className="container main">
    
            <div className="main__item">
                <h1>{t("landing.sologan")}</h1>
                <h3>{t("landing.toolTips")}</h3>
    
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <a href="https://chrome.google.com/webstore/detail/%E6%9E%81%E5%AE%A2%E7%BC%96%E8%BE%91%E5%99%A8/eljjnobigoedmlabbjdbkmdedadpeiba"
                        target="_blank" className="button button--empty">
                        <img src={chromeIcon} alt="Chrome" style={{height: '18px'}} />
                        <span style={{padding: '0 5px 0 10px'}}>{t("landing.extensionInstall")}</span>
                    </a>
                    {/* <a href="https://cdn.montisan.cn/geekeditor-extension.zip"
                        target="_blank" className="button button--empty" style={{marginLeft: '10px'}}>
                        <span style={{padding: '0 5px 0 5px;'}}>官网下载安装扩展</span>
                    </a> */}
                </div>
                <div style={{marginTop: '12px', fontWeight: 300, fontSize: '14px'}}>
                    <div style={{display: 'flex', alignItems: 'flex-end'}}>
                        <img src={startIcon} style={{marginRight: '6px'}} />{t("landing.extensionInstallTips")}
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', marginTop: '50px'}}>
                    <a href="./workspace.html" className="button button--filled">
                        <span style={{padding: '0 5px 0 5px'}}>{t("landing.startWriting")}</span>
                    </a>
                </div>
            </div>
        </main>
    
    
        <section
            className='profile'>
            <div className="container">
                <div className="row">
                <div className="col-1"></div>
                    <div className="col-10 editor">
                        <iframe
                            src="./workspace.html"></iframe>
                    </div>
                </div>
            </div>
        </section>
    </section>

    

    <section
    className='functions'>
        
        <div className="container">
            <div className="row facts">
                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>{t("landing.f1")}</strong>
                    <p>
                    {t("landing.f1Tips")}
                    </p>
                </div>
                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>Markdown</strong>
                    <p>
                    {t("landing.f2Tips")}
                    </p>
                </div>

                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>{t("landing.f3")}</strong>
                    <p>
                    {t("landing.f3Tips")}
                    </p>
                </div>
                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>{t("landing.f4")}</strong>
                    <p>
                    {t("landing.f4Tips")}
                    </p>
                </div>
                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>{t("landing.f5")}</strong>
                    <p>
                    {t("landing.f5Tips")}
                    </p>
                </div>
                <div className="col-4">
                    <div className="facts__separator"></div>
                    <strong>{t("landing.f6")}</strong>
                    <p>
                    {t("landing.f6Tips")}
                    </p>
                </div>
            </div>
        </div>
    </section>

    {/* <section className='features'>
        <div className="container">
            <div className="row">
                <div className="col-1"></div>
                <div className="col-10 list">
                    <div style={{padding: '40px'}}>
                        <h2 style={{textAlign: 'center', marginBottom: '60px'}}>
                            功能特征
                        </h2>

                        <table className="table">
                            <tr>
                                <th></th>
                                <th>免费版</th>
                                <th>高级版</th>
                            </tr>
                            <tr>
                                <td>私有仓库存储</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>本地仓库存储</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>富文本编辑</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>Markdown语法</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>一键主题排版</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>无限自定义排版主题</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>多格式导出</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>本地配置导入导出</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>多公众号登录(扩展)</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>多公众号同步(扩展)</td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>仓库配置云存储/载入</td>
                                <td>
                                    —
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>公众号已发布文章浏览(扩展)</td>
                                <td>
                                    —
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>公众号草稿查看(扩展)</td>
                                <td>
                                    —
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>公众号文章搜索(扩展)</td>
                                <td>
                                    —
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>
                            <tr>
                                <td>生成往期文章(扩展)</td>
                                <td>
                                    —
                                </td>
                                <td>
                                    <img className='check-icon' src={checkIcon} alt="check" />
                                </td>
                            </tr>

                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section> */}

    {/* <section className='questions'>
        <div className="container">
            <h2>
                常见问题
            </h2>

            <div className="row">
                <div className="col-6">
                    <h4>How does Notyfy work?</h4>
                    <p>
                        Notyfy will periodically check for notifications of platforms that
                        you are logged in to. Since this request is coming from the Chrome
                        Extension through your browser, the requests will be identified as
                        you and is able to check your notifications on your platforms.
                    </p>
                    <p>
                        The requests are super lightweight (from 0.7kb to 58kb) compared
                        to, for instance, the ~25 mb Facebook page load.
                    </p>
                </div>

                <div className="col-6">
                    <h4>Does Notyfy store anything of me?</h4>
                    <p>
                        Nothing is stored on servers. The only thing being locally stored
                        for caching purposes are your notifications for a faster loading
                        time.
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-6">
                    <h4>Can Notyfy read all of my data?</h4>
                    <p>
                        No, Notyfy only reads the data of the platforms it supports. There is no permission given to
                        read all your site data.
                    </p>
                </div>
            </div>
        </div>
    </section> */}

    <section style={{width: '100%', top: '-200px',display: 'flex', justifyContent: 'center', position: 'relative'}}>
    <div style={{display: 'flex', alignItems: 'center', marginTop: '200px'}}>
                    <a href="./workspace.html" className="button button--filled">
                        <span style={{padding: '0 5px 0 5px'}}>{t("landing.startWriting")}</span>
                    </a>
                </div>
    </section>
	

    <footer className="footer">
        <div className="container">
            <div>Copyright © 2021-2023 {t("landing.geekEditor")} <a href="http://beian.miit.gov.cn/" target="_blank">{t("landing.recordNumber")}</a></div>
            {/* <div style={{color: '#afafaf'}}>
                {t("landing.friendshipLink")}
                <a href="http://h5.dooring.cn/" target="_blank">{t("landing.h5Dooring")}</a>
            </div> */}
        </div>
    </footer>
        </>
    }
}

export default withTranslation()(App)