var chUrl = '',
    mixpanelToken = '',
    googleAnalytics = '';

var _gaq = _gaq || [];
var ga;

$.getJSON("settings.json", function(json) {
    chUrl = json.url;
    mixpanelToken = json.mixpanelToken;
    googleAnalytics = json.googleAnalytics;



});

currentWebsiteSlug = '';
currentWebsiteUrl = '';
csrfToken = '';
countryCode = '';
countryName = '';
chUserStatus = false;
incognitoMode = false;
chrome.tabs.getSelected(null, function (tab) {
    if (tab.incognito) {
        incognitoMode = true;
    }
    currentWebsiteSlug = tab.url;
    var windowURL = processURL(tab.url);
    if(windowURL){
        currentWebsiteUrl = windowURL.protocol + '//' + windowURL.hostname;
    }
    currentWebsiteSlug = process(currentWebsiteSlug);
});

function process(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    domain = domain.split(':')[0];
    domain = domain.replace("www.", "");
    return domain;
}
function processURL(url) {
    var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

function setCookie(cname, cvalue, exdays, domain) {
    chrome.cookies.set({ 
        name: cname, 
        value: cvalue, 
        expirationDate: (new Date().getTime()/1000) + (exdays * 24 * 60 * 60),
        url: domain
    }, function (response) {
    });
}

function getCookie(cname, domain) {
    var defer = new jQuery.Deferred();
    chrome.cookies.get({
        "name": cname,
        "url": domain
    }, function (cookie) {
        defer.resolve(cookie);
    });

    return defer.promise();
}


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        if ((tab.url.indexOf("http://") === 0) ||
            (tab.url.indexOf("https://")) === 0 ||
            (tab.url.indexOf("ftp")) === 0) {
            logURLs(tab.url);

            var tsitesTime;
            getCookie('log_tsites', chUrl).done(function (cookie) {
                tsitesTime = cookie?cookie.value:null;
                if (tsitesTime == null){
                    var currentDatetime = new Date().getTime()/1000;
                    setCookie('log_tsites', currentDatetime.toString(), 7, chUrl);
                    logTopSites();
                }
            })
        }
    }
});

chrome.runtime.onMessageExternal.addListener(
    function (req, sender, callback) {
        if (req) {
            if (req.message) {
                if (req.message == "installed") {
                    callback(true);
                }
            }
        }
        return true;
    });

function logURLs(tabUrl) {
    $.ajax({
        type: "get",
        url: chUrl + '/resource/v1/cext/log/visited-url?url=' + tabUrl,
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        },
        success: function (data) {
            if (data['success'] && data['required']) {
                // logTopSites();
            }
        },
        error: function (data) {
        }
    });
}

function logTopSites() {
    chrome.topSites.get(function (response) {
        var data = JSON.stringify(response);
        data = {
            'topsites': response
        };
        chrome.cookies.get({
            "url": chUrl,
            "name": "csrftoken"
        }, function (cookie) {
            csrfToken = cookie.value;
            if (csrfToken) {
                $.ajax({
                    type: "post",
                    dataType: 'json',
                    url: chUrl + '/resource/v1/cext/log/topsites',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(data),
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader("X-CSRFToken", csrfToken);
                        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    },
                    success: function (data) {
                    },
                    error: function (data) {
                    }
                });
            }
        });
    });
}
