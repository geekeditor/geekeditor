const agent = navigator.userAgent.toLowerCase();
export const isCompatible = (/chrome\/(\d+\.\d)/i.test(agent) || /firefox/.test(agent) || /safari/.test(agent)) && !/wechat/i.test(agent)