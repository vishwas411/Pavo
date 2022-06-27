(function () {
    'use strict';

    angular
        .module('chExtension')
        .controller('homeCtrl', homeCtrl)
        .config([
            '$compileProvider',
            function ($compileProvider) {
                $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|http|ftp|file|blob):|data:image\/)|chrome-extension:/);
            }
        ]);

    homeCtrl.$inject = ['$scope', 'chSvc', '$rootScope'];

    /* @ngInject */
    function homeCtrl($scope, chSvc, $rootScope) {
        var vm = this;
        vm.title = 'homeCtrl';

        activate();

        function activate() {
            // $scope.chUrl = chUrl;
            setTimeout(function () {
                $scope.chUrl = chUrl;
            }, 5);
            $scope.searchActive = false;
            chrome.tabs.getSelected(null, function (tab) {
                currentWebsiteSlug = tab.url;
                currentWebsiteSlug = processSlug(currentWebsiteSlug);
                $scope.currentWebsiteSlug = currentWebsiteSlug;

                function processSlug(url) {
                    var domain;
                    //find & remove protocol (http, ftp, etc.) and get domain
                    if (!/^(f|ht)tps?:\/\//i.test(url)) {
                        return null;
                    }
                    if (url.indexOf("://") > -1) {
                        domain = url.split('/')[2];
                    } else {
                        domain = url.split('/')[0];
                    }

                    //find & remove port number
                    domain = domain.split(':')[0];
                    domain = domain.replace("www.", "");
                    return domain;
                }

                function minifyNumber(x) {
                    if (x < 1000)
                        return x;
                    if (x < 1000000)
                        return (x / 1000).toFixed(1) + 'k+';
                    else
                        return (x / 1000000).toFixed(1) + 'M+';
                }

                chSvc.getUserDetails().then(function (userData) {
                    $scope.userDetail = userData;
                    mixpanel.init(mixpanelToken);
                    if (userData.registered_user) {
                        chUserStatus = true;
                        $scope.chUserStatus = true;

                        if (userData.data.is_ch_employee) {
                            userData.data.is_ch_employee = "True";
                        } else if (userData.data.is_ch_employee === false) {
                            userData.data.is_ch_employee = "False";
                        } else if (userData.data.is_ch_employee === null) {
                            userData.data.is_ch_employee = "None";
                        }

                        if (userData.data.is_real_user === false) {
                            userData.data.is_real_user = "False";
                        } else {
                            userData.data.is_real_user = "True";
                        }
                        if(userData.data.is_real_user == "False"){
                            // filter out users if is_real_user = false
                            var i = 0;
                            function _waitForGA() {
                                if (ga != undefined) {
                                    ga('set', 'dimension1', 'true');
                                } else {
                                    setTimeout(function () {
                                        i++;
                                        if(i<25){
                                            _waitForGA();                                        
                                        }
                                        i=0;
                                    }, 5);
                                }
                            };
                            _waitForGA();
                        }

                        userParamsObject = {
                            'Name': userData.data.fullname,
                            'First Name': userData.data.first_name,
                            'Last Name': userData.data.last_name,
                            'Email': userData.data.email,
                            'Created': userData.data.date_joined,
                            'ID': userData.data.id,
                            'Username': userData.data.username,
                            'Sex': userData.data.gender,
                            'Location': userData.data.location,
                            'DOB': userData.data.dob,
                            'Employee': userData.data.is_ch_employee,
                            'Real User': userData.data.is_real_user,
                            'Application Type': "Browser Plugin",
                            'Product': "Chrome Extension",
                        }

                        mixpanel.register(userParamsObject);
                    } else {

                        mixpanel.unregister("ID");
                        mixpanel.unregister("Username");
                        mixpanel.unregister("Name");
                        mixpanel.unregister("First Name");
                        mixpanel.unregister("Last Name");
                        mixpanel.unregister("Email");
                        mixpanel.unregister("Sex");
                        mixpanel.unregister("Location");
                        mixpanel.unregister("Created");
                        mixpanel.unregister("DOB");
                        mixpanel.unregister("Employee");
                        mixpanel.unregister("Real User");

                        // remove $ignore else events will not be tracked
                        mixpanel.unregister("$ignore");

                        var userParamsObject = {
                            'Application Type': "Browser Plugin",
                            'Product': "Chrome Extension",
                        }
                        mixpanel.register(userParamsObject);
                    }
                        trackEvents("Browser Plugin Launch", {
                            "URL": $scope.currentWebsiteSlug
                        });
                    if (userData.token) {
                        csrfToken = userData.token;
                    }
                    if ($scope.currentWebsiteSlug) {

                        chSvc.getCurrentUserReview(currentWebsiteSlug).then(function (response) {
                            $scope.userWebsiteReview = response;
                            $scope.userWebsiteReview.user = {
                                'username': $scope.userDetail.data.username,
                                'fullname': $scope.userDetail.data.fullname
                            }
                        });
                    }
                });


                $scope.loader = true;
                if ($scope.currentWebsiteSlug) {
                    chSvc.getWebsiteBasicDetails(currentWebsiteSlug).then(function (response) {
                        $scope.websiteDetail = response;
                        $scope.loader = '';
                        // $scope.staticUrl = response.site_url;
                        $scope.isLiked = response.is_liked;
                        $scope.isBookmarked = response.is_bookmarked;
                        $scope.isUsed = response.have_used;
                        $scope.likeCount = minifyNumber(response.like_count);
                        $scope.bookmarkCount = minifyNumber(response.bookmark_count);
                        $scope.usedCount = minifyNumber(response.have_used_count);

                        if (response.category && response.category.slug) {
                            chSvc.getBreadcrumb("category", response.category.slug).then(function (response) {
                                if (response.length) {
                                    $scope.websiteDetail.websitePath = response;
                                }
                            });
                        }
                        if(response.is_listed){
                            setTimeout(function () {
                                $scope.trackPageView('overview');
                            }, 15); 
                            chSvc.getWebsiteSimilar(currentWebsiteSlug).then(function(response){
                                if(response.length){
                                    $scope.similarWebsites=response;
                                }else{
                                    chSvc.getRecommendedWebsite().then(function(response){
                                        $scope.recommendedWebsites = response;
                                    });
                                }
                            }, function (status) {
                                if(!$scope.websiteProfileError){
                                    $scope.websiteProfileError = status;                                
                                }
                                // body...
                            });

                        }else{
                            setTimeout(function () {
                                $scope.trackPageView('website-add');
                            }, 15); 
                        }
                    }, function (status) {
                        $rootScope.websiteProfileError = status;
                        $scope.loader = '';
                        // body...
                    });

                    
                }

            });

            $scope.trackPageView = function(page){
                if(ga != undefined){
                        ga('send', 'pageview', '/'+page);
                }else{
                    setTimeout(function () {
                        ga('send', 'pageview', '/'+page);
                    }, 10);                        
                }
            }
            
            $scope.likeWebsite = function () {
                if (chUserStatus) {
                    $scope.isLiked = !$scope.isLiked;
                    if (!isNaN($scope.likeCount)) {
                        if ($scope.isLiked)
                            $scope.likeCount++;
                        else
                            $scope.likeCount--;
                    }
                    chSvc.postLike(currentWebsiteSlug, !$scope.isLiked).then(function (response) {

                        if (response.error) {
                            $scope.isLiked = !$scope.isLiked;
                            if (!isNaN($scope.likeCount)) {
                                if ($scope.isLiked)
                                    $scope.likeCount++;
                                else
                                    $scope.likeCount--;
                            }
                            var message = response.error.message?response.error.message:response.error;                            
                            $.Notify({
                                caption: 'Error',
                                content: message,
                                keepOpen: true,
                                type: 'alert',
                                timeout: '2000',
                                shadow: 'false',
                                icon: "<span class='mif-user fg-yellow'></span>"
                            });
                        } else {

                            if ($scope.isLiked) {
                                var notifyContent = "liked"
                            } else {
                                var notifyContent = "unliked"
                            }
                            $.Notify({
                                caption: currentWebsiteSlug,
                                content: "You " + notifyContent,
                                timeout: '2000',
                                icon: "<span class='mif-heart fg-red'></span>"
                            });
                            var paramsObject = {
                                "Website": currentWebsiteSlug,
                                "Action": notifyContent.capitalize()
                            }
                            trackEvents('Website Like', paramsObject);

                        }
                    });
                } else {
                    showDialog('#dialogLogin');
                }
            }

            $scope.bookmarkWebsite = function () {
                if (chUserStatus) {
                    $scope.isBookmarked = !$scope.isBookmarked;
                    if (!isNaN($scope.bookmarkCount)) {
                        if ($scope.isBookmarked)
                            $scope.bookmarkCount++;
                        else
                            $scope.bookmarkCount--;
                    }
                    chSvc.postBookmark(currentWebsiteSlug, !$scope.isBookmarked).then(function (response) {
                        if (response.error) {
                            $scope.isBookmarked = !$scope.isBookmarked;
                            if (!isNaN($scope.bookmarkCount)) {
                                if ($scope.isBookmarked)
                                    $scope.bookmarkCount++;
                                else
                                    $scope.bookmarkCount--;
                            }
                            var message = response.error.message?response.error.message:response.error;                                                    
                            $.Notify({
                                caption: 'Error',
                                content: message,
                                keepOpen: true,
                                type: 'alert',
                                timeout: '2000',
                                shadow: 'false',
                                icon: "<span class='mif-user fg-yellow'></span>"
                            });
                        } else {
                            var notifyContent = $scope.isBookmarked ? "Bookmark Saved" : "Bookmark Removed";
                            $.Notify({
                                caption: notifyContent,
                                content: currentWebsiteSlug,
                                timeout: '2000',
                                icon: "<span class='mif-bookmark fg-blue'></span>"
                            });
                            var bookmarkStatus = $scope.isBookmarked ? "Bookmarked" : "Unbookmarked";
                            var paramsObject = {
                                "Website": currentWebsiteSlug,
                                "Action": bookmarkStatus
                            }
                            trackEvents('Website Bookmark', paramsObject);

                        }


                    });
                } else {
                    showDialog('#dialogLogin');
                }

            }
            $scope.usedWebsite = function () {
                if (chUserStatus) {
                    $scope.isUsed = !$scope.isUsed;
                    if (!isNaN($scope.usedCount)) {
                        if ($scope.isUsed)
                            $scope.usedCount++;
                        else
                            $scope.usedCount--;
                    }
                    chSvc.postWebsiteUsed(currentWebsiteSlug, !$scope.isUsed).then(function (response) {
                        if (response.error) {
                            $scope.isUsed = !$scope.isUsed;
                            if (!isNaN($scope.usedCount)) {
                                if ($scope.isUsed)
                                    $scope.usedCount++;
                                else
                                    $scope.usedCount--;
                            }
                            var message = response.error.message?response.error.message:response.error;                            
                            $.Notify({
                                caption: 'Error',
                                content: message,
                                keepOpen: true,
                                type: 'alert',
                                timeout: '2000',
                                shadow: 'false',
                                icon: "<span class='mif-user fg-yellow'></span>"
                            });
                        } else {

                            var notifyContent = $scope.isUsed ? "You marked this website as used" : "You removed this from used website";
                            var haveUsedStatus = $scope.isUsed ? "Have Used" : "Not Used";
                            var paramsObject = {
                                "Website": currentWebsiteSlug,
                                "Action": haveUsedStatus
                            }
                            trackEvents('Website Have Used', paramsObject);

                            $.Notify({
                                caption: currentWebsiteSlug,
                                content: notifyContent,
                                timeout: '2000',
                                icon: "<span class='mif-checkmark fg-blue'></span>"
                            });
                        }
                    });
                } else {
                    showDialog('#dialogLogin');
                }

            }


            $scope.openDialog = function (element) {
                showDialog(element);
            }

            $scope.showReviewRatingDilalog = function () {
                if (chUserStatus) {
                    if ($scope.userWebsiteReview) {
                        $('#inputWebsiteRating').data('rating').value($scope.userWebsiteReview.rating);
                    }
                    showDialog('#dialogRatingReview');
                } else {
                    showDialog('#dialogLogin');
                }
            }

            $scope.postReviewRating = function (userWrittenReview) {
                if (chUserStatus) {
                    var rating = $('#inputWebsiteRating').data('rating').value();
                    if (rating) {
                        $scope.reviewLoader = true;
                        chSvc.postWebsiteReview(currentWebsiteSlug, userWrittenReview, rating).then(function (response) {
                            $scope.reviewLoader = false;
                            if (response.error) {
                                var message = response.error.message?response.error.message:response.error;                            
                                $.Notify({
                                    caption: 'Error',
                                    content: message,
                                    keepOpen: true,
                                    type: 'alert',
                                    timeout: '2000',
                                    shadow: 'false',
                                    icon: "<span class='mif-user fg-yellow'></span>"
                                });
                            } else {

                                if (!$scope.websiteDetail.is_reviewed) {
                                    $scope.websiteDetail.is_reviewed = true;
                                    $scope.websiteDetail.rating_count++;
                                }
                                hideDialog('#dialogRatingReview');

                                var reviewStatus = $scope.websiteDetail.is_reviewed ? "Added" : "Edited";
                                var paramsObject = {
                                    "Website": currentWebsiteSlug,
                                    "Action": reviewStatus
                                }
                                trackEvents('Website Review', paramsObject);


                                var $el = $('.user-rating');
                                if ($el.data('rating')) {
                                    $el.data('rating').value(rating);
                                }
                                $.Notify({
                                    caption: currentWebsiteSlug,
                                    content: "Your review has been submitted",
                                    timeout: '2000',
                                    icon: "<span class='mif-checkmark fg-blue'></span>"
                                });
                                $('#inputWebsiteRating').data('rating').value(0);
                                $scope.userWebsiteReview = response;
                                $scope.userWebsiteReview.user = {
                                    'username': $scope.userDetail.data.username,
                                    'fullname': $scope.userDetail.data.fullname
                                }
                                if (response.avg_rating) {
                                    $scope.websiteDetail.avg_rating = response.avg_rating;
                                }
                            }
                        });
                    } else {
                        //
                    }

                } else {
                    showDialog('#dialogLogin');
                }

            }

            $scope.openSendWebsiteDialog = function () {
                if (chUserStatus) {
                    showDialog('#dialogWebsiteSend');

                    $scope.sendWebsite = {
                        'receivers': [],
                        'message': ''
                    };

                    var $friendSelector = $("#friendSelector").select2({
                        minimumInputLength: 2,
                        ajax: {
                            url: function (params) {
                                return chUrl + "/resource/v1/cext/people/instantsearch/" + params.term + "/followers"
                            },
                            dataType: 'json',
                            delay: 50,
                            data: function (params) {
                                return {
                                    // q: params.term, // search term
                                    // page: params.page
                                };
                            },
                            processResults: function (data, page) {
                                var newData = [],
                                    i;
                                for (i = 0; i < data.length; i++) {
                                    if (data[i].username) {
                                        if (!data[i].profile_pic) {
                                            if (!data[i].gender || data[i].gender == "M") {
                                                data[i].profile_pic = $scope.websiteDetail.static_url + "desktop/search/images/placeholders/male.jpg";
                                            } else if (data[i].gender == "F") {
                                                data[i].profile_pic = $scope.websiteDetail.static_url + "desktop/search/images/placeholders/female.png";
                                            }

                                        }

                                        newData[i] = {
                                            "id": data[i].username,
                                            "text": data[i].fullname,
                                            "pic": data[i].profile_pic,
                                            "user": true
                                        }
                                    }
                                }
                                if (!newData.length) {
                                    newData[0] = {
                                        "text": "No results",
                                        "user": true
                                    }
                                }
                                return {
                                    results: newData
                                };
                            },
                            cache: true
                        },
                        placeholder: "CybrHome user",
                        //allowClear: true,
                        multiple: true,
                        tags: true,
                        templateResult: fmtState,
                        // tokenSeparators: [","],
                        maximumSelectionLength: 5,
                        //minimumInputLength: 1,
                        width: '100%',
                    });

                    function fmtState(state) {
                        if (state.user) {
                            if (!state.id) {
                                return state.text;
                            }
                            var $state = $(
                                '<span>' + state.text + ' (@' + state.id + ')' + '</span>'
                            );
                            return $state;
                        }
                    }
                    setTimeout(function () {
                        $friendSelector.val(null).trigger("change");
                    }, 2);
                } else {
                    hideDialog('.dialogs');
                    showDialog('#dialogLogin');
                }

            }

            $scope.shareWebsite = function () {
                showDialog('#dialogWebsiteShare');
                if (!$scope.sharedWebsite) {
                    chSvc.getWebsiteExtraDetails(currentWebsiteSlug).then(function (response) {
                        $scope.sharedWebsite = [];
                        $scope.sharedWebsite['short_description'] = response['short_description'];
                    });
                }
            }

            $scope.submitWebsiteSend = function (sendWebsite) {
                if (chUserStatus) {
                    var receivers = sendWebsite['receivers'];
                    if (receivers) {
                        var msg = sendWebsite['message'];
                        var website = currentWebsiteSlug;
                        var data = 'receivers=' + receivers + '&website=' + website + '&message=' + msg;

                        chSvc.recommendWebsite(data).then(function (response) {

                            if (response.message) {
                                $.Notify({
                                    caption: 'Website Sent',
                                    content: ' ',
                                    type: 'info',
                                    timeout: '3000',
                                    icon: "<span class='mif-star-full fg-yellow'></span>"
                                });

                                var paramsObject = {
                                    "Website": website,
                                    "To": receivers,
                                }
                                trackEvents('Website Send', paramsObject);

                                $('#friendSelector').val('');
                                $scope.sendWebsite = null;
                                hideDialog('#dialogWebsiteSend');
                            } else if (response.error) {
                                var message = response.error.message?response.error.message:response.error;
                                $.Notify({
                                    caption: 'Error',
                                    content: message,
                                    type: 'alert',
                                    timeout: '3000',
                                    icon: "<span class='mif-star-full fg-yellow'></span>"
                                });
                            }

                        });
                    }
                } else {
                    showDialog('#dialogLogin');
                }
            }

            $scope.trackSuggestions = function (type, value, queryterm) {
                var paramsObject = {
                    'Type': type,
                    'Value': value,
                    'Search String': queryterm
                };
                trackEvents('Search Suggestion', paramsObject);
            }

            $scope.trackOutboundLink = function (link, linkSource, trackType, trackValue) {
                var paramsObject = {
                    'URL': link,
                    'Found on': linkSource
                };
                paramsObject[trackType] = trackValue;

                var data = {
                    event_type: "External Visit",
                    custom_properties:{
                        content_type: "Website",
                        slug: $scope.websiteDetail.slug,
                        object_id: $scope.websiteDetail.a_id,
                        external_link: link
                    }
                }

                if (trackType == "Website Visit") {
                    trackEvents('Website Visit', paramsObject);
                    data['event_name'] = 'Website Visit';
                } else if (trackType == "Website Platform") {
                    trackEvents('Website Platform Visit', paramsObject);
                    data['event_name'] = 'Website Platform Visit';
                    data['custom_properties']['platform_type'] = trackValue;
                } else if (trackType == "Website Social Media") {
                    trackEvents('Website Social Visit', paramsObject);
                    data['event_name'] = 'Website Social Visit';
                    data['custom_properties']['op_type'] = trackValue;
                }

                logChData(data, chUrl);                


            }


            $scope.instantSearch = function (searchQuery, keyCode) {
                $('#searchSuggestionsSection').show();
                if (keyCode === 13) {
                    $scope.searchAll(searchQuery);

                }
                if (searchQuery && searchQuery != '') {
                    chSvc.getSearchBarSuggestions(searchQuery.replace(" ", '-')).then(function (response) {
                        $scope.searchBarSuggestions = response;
                    });
                } else {
                    $scope.searchBarSuggestions = null;
                }
            }
            $scope.toLowerCase = function (string) {
                return string.toLowerCase();
            }
            $scope.toggleSearch = function () {
                $scope.searchActive = !$scope.searchActive;
                $('html').css('height', '0px');
                $('body').css('height', '0px');
            }
            $scope.deleteReview = function () {
                chSvc.putDeleteUserReview(currentWebsiteSlug).then(function (response) {
                    if (response.message) {
                        if (response.avg_rating) {
                            $scope.websiteDetail.avg_rating = response.avg_rating;
                        }
                        $scope.websiteDetail.is_reviewed = false;
                        $scope.websiteDetail.rating_count--;

                        var paramsObject = {
                            "Website": currentWebsiteSlug,
                            "Action": "Deleted"
                        }
                        trackEvents('Website Review', paramsObject);


                        $.Notify({
                            caption: 'Review Deleted!',
                            content: ' ',
                            type: 'info',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                        $scope.userWebsiteReview = null;
                    } else if (response.error) {
                        var message = response.error.message?response.error.message:response.error;                            
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                });
            }
            $scope.getUserReview = function () {
                chSvc.getCurrentUserReview(currentWebsiteSlug).then(function (response) {
                    $scope.userWebsiteReview = response;
                });
            }
            $scope.searchAll = function (searchQuery) {
                if (searchQuery)
                    trackEvents('Search', {
                        "Search String": searchQuery
                    });
                window.open(chUrl + '/search?q=' + searchQuery.replace(" ", "-"), '_blank')
            }
        }
    }
})();