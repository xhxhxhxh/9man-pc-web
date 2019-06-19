function getBrowserInfo() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
    var m = ua.match(re);
    Sys.browser = m[1].replace(/version/, "'safari");
    Sys.ver = m[2];
    return Sys;
}
var browserInfo = getBrowserInfo();

var browser = true;
var version = parseInt(browserInfo.ver.split('.')[0]);
switch (browserInfo.browser) {
    case 'msie': version <= 9? browser = false: browser = true; break;
    case 'firefox': version <= 20? browser = false: browser = true; break;
    case 'chrome': version <= 22? browser = false: browser = true; break;
    case 'opera': version <= 14? browser = false: browser = true; break;
    case 'edge': version <= 11? browser = false: browser = true; break;
}
var close = document.getElementById('close');
var killIe = document.getElementById('kill-ie');
// console.log(browserInfo.browser,browser,version)
// console.log(killIe);
close.onclick = function () {
    killIe.style.display = 'none';
};
if (!browser) {
    killIe.style.display = 'block';
}
