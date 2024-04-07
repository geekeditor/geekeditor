import { notification, Button, Checkbox } from 'antd'
import Driver, { Element } from 'driver.js'
import 'driver.js/dist/driver.min.css';

import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import './index.less'
import sharedPreferences from '../../utils/sharedPreferences'
import sharedPreferencesKeys from '../../utils/sharedPreferencesKeys'
import sharedEventBus from '../../utils/sharedEventBus';
import { NotificationPlacement } from 'antd/lib/notification';

let timerCount = 0;
let timer: NodeJS.Timeout;
let isShowingNotificaiton = false;

const driverOptions = {
    className: 'app-guide-popover',        // className to wrap driver.js popover
    animate: true,                    // Whether to animate or not
    opacity: 0.75,                    // Background opacity (0 means only popovers and without overlay)
    padding: 0,                      // Distance of element from around the edges
    allowClose: false,                 // Whether the click on overlay should close or not
    overlayClickNext: false,          // Whether the click on overlay should move next
    doneBtnText: '知道了',              // Text on the final button
    closeBtnText: '关闭',            // Text on the close button for this step
    stageBackground: '#ffffff',       // Background color for the staged behind highlighted element
    nextBtnText: '下一步',              // Next button text for this step
    prevBtnText: '上一步',          // Previous button text for this step
    showButtons: true,               // Do not show control buttons in footer
    keyboardControl: true,            // Allow controlling through keyboard (escape to close, arrow keys to move)
    scrollIntoViewOptions: {},        // We use `scrollIntoView()` when possible, pass here the options for it if you want any
    onHighlightStarted: () => { }, // Called when element is about to be highlighted
    onHighlighted: (element: Element) => {
    },      // Called when element is fully highlighted
    onDeselected: () => { },       // Called when element has been deselected
    onReset: () => { },            // Called when overlay is about to be cleared
    onNext: () => { },                    // Called when moving to next step on any step
    onPrevious: () => { },                // Called when moving to previous step on any step
};
const stepNew = {
    element: '#app-guide-new',        // Query selector string or Node to be highlighted
    popover: {
        title: '添加存储仓库',             // Title on the popover
        description: '添加个人文档/图床仓库，当前支持本地/Github/Gitee/Gitlab存储', // Body of the popover
        position: 'right'
    }
};
const stepDocs = {
    element: '#app-guide-docs',        // Query selector string or Node to be highlighted
    popover: {
        title: '查看仓库文档',             // Title on the popover
        description: '浏览所有仓库文档，可打开/新建文档，新建文档/图床仓库', // Body of the popover
        position: 'right',
    }
};
const stepCollapse = {
    element: '#app-guide-collapse',        // Query selector string or Node to be highlighted
    popover: {
        title: '收起文档列表',             // Title on the popover
        description: '一键收起已展开文档列表', // Body of the popover
        position: 'bottom',
    }
};
const stepExpand = {
    element: '#app-guide-expand',        // Query selector string or Node to be highlighted
    popover: {
        title: '展开文档列表',             // Title on the popover
        description: '一键展开仓库文档列表，连续点击可逐层展开', // Body of the popover
        position: 'bottom',
    }
};
const stepRepo = {
    element: '#app-guide-repo',        // Query selector string or Node to be highlighted
    popover: {
        title: '添加存储仓库',             // Title on the popover
        description: '添加个人文档/图床仓库，当前支持本地/Github/Gitee/Gitlab存储', // Body of the popover
        position: 'bottom',
    }
};
const stepNewFile = {
    element: '.app-guide-newfile',        // Query selector string or Node to be highlighted
    popover: {
        title: '新建文档',             // Title on the popover
        description: '在目录下新建文档', // Body of the popover
        position: 'bottom',
    }
};
const stepNewFolder = {
    element: '.app-guide-newfolder',        // Query selector string or Node to be highlighted
    popover: {
        title: '新建文件夹',             // Title on the popover
        description: '在目录下新建文件夹', // Body of the popover
        position: 'bottom',
    }
};
const stepRefresh = {
    element: '.app-guide-refresh',        // Query selector string or Node to be highlighted
    popover: {
        title: '刷新目录',             // Title on the popover
        description: '刷新目录下文档列表', // Body of the popover
        position: 'bottom',
    }
};
const stepSearch = {
    element: '#app-guide-search',        // Query selector string or Node to be highlighted
    popover: {
        title: '搜索文档',             // Title on the popover
        description: '匹配文档标题搜索文档', // Body of the popover
        position: 'right'
    }
};
const stepDarkmode = {
    element: '#app-guide-darkmode',        // Query selector string or Node to be highlighted
    popover: {
        title: '切换暗黑模式',             // Title on the popover
        description: '一键开启，减轻眼部的疲劳', // Body of the popover
        position: 'top'
    }
};
const stepQrcode = {
    element: '#app-guide-qrcode',        // Query selector string or Node to be highlighted
    popover: {
        title: '关注公众号',             // Title on the popover
        description: '反馈建议、了解后续版本更新', // Body of the popover
        position: 'top'
    }
};

const stepVIP = {
    element: '#app-guide-vip',        // Query selector string or Node to be highlighted
    popover: {
        title: '订阅会员功能',             // Title on the popover
        description: '订阅会员功能，获得更多功能权限', // Body of the popover
        position: 'bottom'
    }
};


const stepSetting = {
    element: '#app-guide-setting',        // Query selector string or Node to be highlighted
    popover: {
        title: '打开设置',             // Title on the popover
        description: '新建/删除文档仓库、隐藏示例文档库', // Body of the popover
        position: 'top'
    }
};

const stepZenmode = {
    element: '#app-guide-zenmode',        // Query selector string or Node to be highlighted
    popover: {
        title: '切换Zen模式',             // Title on the popover
        description: 'Zen模式，让写作更专注', // Body of the popover
        position: 'top'
    }
};

const stepDesktop = {
    element: '#app-guide-desktop',        // Query selector string or Node to be highlighted
    popover: {
        title: '安装浏览器扩展',             // Title on the popover
        description: '离线写作，更多高级功能', // Body of the popover
        position: 'top'
    }
};

const stepAlwaysTop = {
    element: '#app-guide-alwaystop',        // Query selector string or Node to be highlighted
    popover: {
        title: '置顶窗口',             // Title on the popover
        description: '置顶窗口，让写作更便捷', // Body of the popover
        position: 'top'
    }
};

/** Guide in editor */
const stepMore = {
    element: '#app-guide-more',
    popover: {
        title: '更多操作',             // Title on the popover
        description: '快捷切换已打开文档，查看编辑器快捷键', // Body of the popover
        position: 'left'
    }
}

const stepFullscreen = {
    element: '.app-guide-fullscreen',
    popover: {
        title: '编辑模式',             // Title on the popover
        description: '收起其它面板，仅显示编辑区', // Body of the popover
        position: 'left'
    }
}

const stepExport = {
    element: '.app-guide-export',
    popover: {
        title: '导出文档',             // Title on the popover
        description: '复制到微信公众号、知乎、掘金等', // Body of the popover
        position: 'left'
    }
}

const stepProfile = {
    element: '.app-guide-profile',
    popover: {
        title: '设置封面、摘要，同步文章',             // Title on the popover
        description: '可一键同步到微信公众号', // Body of the popover
        position: 'left'
    }
}

const stepTypeset = {
    element: '.app-guide-typeset',
    popover: {
        title: '主题排版',             // Title on the popover
        description: '一键主题排版，自定义排版CSS', // Body of the popover
        position: 'left'
    }
}

const stepLayout = {
    element: '.app-guide-layout',
    popover: {
        title: '编辑版式',             // Title on the popover
        description: 'Web版式、页面版式及手机版式切换', // Body of the popover
        position: 'left'
    }
}

const stepCatalog = {
    element: '.app-guide-catalog',
    popover: {
        title: '目录大纲',             // Title on the popover
        description: '快捷创建/跳转大纲标题', // Body of the popover
        position: 'left'
    }
}

const stepSearchReplace = {
    element: '.app-guide-searchreplace',
    popover: {
        title: '搜索/替换',             // Title on the popover
        description: '快捷搜索/替换文档文字', // Body of the popover
        position: 'left'
    }
}


const stepUndo = {
    element: '.app-guide-undo',
    popover: {
        title: '回撤',             // Title on the popover
        description: '回撤修改', // Body of the popover
        position: 'left'
    }
}

const stepRedo = {
    element: '.app-guide-redo',
    popover: {
        title: '重做',             // Title on the popover
        description: '恢复修改', // Body of the popover
        position: 'left'
    }
}


const stepUpload = {
    element: '.app-guide-upload',
    popover: {
        title: '一键上传图片到图床',             // Title on the popover
        description: '自动检查文档中未在图床中的图片，点击一键上传', // Body of the popover
        position: 'left'
    }
}

const driver = new Driver(driverOptions);

function onEnterGuide() {
    // closeGuideNotification()
    // sharedEventBus.trigger('onOpenDocs');
    driver.defineSteps([
        stepNew,
        // stepDocs,
        // stepRepo,
        // stepExpand,
        // stepCollapse,
        // stepNewFile,
        // stepNewFolder,
        // stepRefresh,
        // stepSearch,
        
        
        stepZenmode,
        stepDesktop,
        stepDarkmode,
        stepSetting,
        stepAlwaysTop,
        stepVIP,
        stepQrcode,
    ])
    driver.start();
    // driver.start();
}

const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsHideGuideNotification, e.target.checked);
}

function closeGuideNotification() {
    notification.close('app-guide-notification');
}

function openGuideNotification() {

    if (sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsHideGuideNotification)) {
        return;
    }
    if (sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsDarkmode)) {
        return;
    }

    timerCount = 10;
    const args = {
        message: '是否查看操作引导？',
        description: <div className="app-guide"><Checkbox onChange={onCheckBoxChange} className="app-guide-checkbox">下次不再提示</Checkbox><Button onClick={onEnterGuide} className="app-guide-btn" type="primary" size="small">立即查看(10s)</Button></div>,
        duration: timerCount,
        className: 'app-guide-notification',
        key: 'app-guide-notification',
        placement:  'topLeft' as NotificationPlacement,
        onClose: () => {
            clearInterval(timer)
            isShowingNotificaiton = false;
        }
    };
    isShowingNotificaiton = true;
    notification.open(args);
    timer = setInterval(() => {
        if (timerCount === 0) {
            closeGuideNotification()
            return;
        }
        timerCount--;
        const guideBtn = document.querySelector('.app-guide-btn');
        if (guideBtn) {
            guideBtn.innerHTML = `立即查看(${timerCount}s)`
        }

    }, 1000)
};

function showModeOperationsGuideIfNotShown() {
    if(!sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsShownMoreOperationsGuide)) {
        setTimeout(()=>{
            driver.defineSteps([
                stepMore,
                stepFullscreen,
                stepCatalog,
                stepSearchReplace,
                stepLayout,
                stepUndo,
                stepRedo,
                stepUpload,
                stepTypeset,
                stepProfile,
                stepExport,
            ])
            driver.start()
        },0)
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsShownMoreOperationsGuide, true);
    }
}

export default {
    onEnterGuide,
    showModeOperationsGuideIfNotShown
}
