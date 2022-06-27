(function() {
    'use strict';

    angular
        .module('chExtension')
        .service('chSvc', chSvc);

    chSvc.$inject = ['$http', '$log', '$q'];

    /* @ngInject */
    function chSvc($http, $log, $q) {
        return {
            getUserDetails: function() {
                //Create a promise using promise library
                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: chUrl + '/resource/v1/cext/user/me',
                    //headers : { 'Cookie' : cookieData }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getSuperCats: function() {

                //Create a promise using promise library
                var deferred = $q.defer();

                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/supercats' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });

                return deferred.promise;
            },
            getWebsiteBasicDetails: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/website/' + websiteSlug + '/basic' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getWebsiteExtraDetails: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/website/' + websiteSlug + '/extra' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getWebsiteRank: function(websiteSlug, countryCode) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/website/' + websiteSlug + '/rank?country_user=' + countryCode }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getWebsiteReviews: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/website/' + websiteSlug + '/reviews' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getWebsiteSimilar: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/website/' + websiteSlug + '/similar' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getRecommendedWebsite: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/websites/recommended?page_size=3' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getSearchBarSuggestions: function(queryTerm) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = queryTerm;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/instantsearch/' + queryTerm }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getCurrentUserReview: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/user/review/' + websiteSlug + '/get' }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getBreadcrumb: function(type, slug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/breadcrumb?type=' + type + '&slug=' + slug }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getSubCategoriesById: function(categoryId) {
                //Create a promise using promise library
                var deferred = $q.defer();
                $http({ method: 'GET', url: chUrl + '/resource/v1/cext/getsubcategoriesbyid/' + categoryId }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            postLike: function(websiteName, likeStatus) {
                // function is used to post rating of user for a particular website
                var postData;
                if (likeStatus) {
                    postData = 'like_website=False';
                } else {
                    postData = 'like_website=True';
                }
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: chUrl + '/resource/v1/cext/user/like/' + websiteName,
                    data: postData, // pass in data as strings
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrfToken }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            postBookmark: function(websiteName, bookmarkStatus) {
                // function is used to post rating of user for a particular website
                var postData;
                if (bookmarkStatus) {
                    postData = 'bookmark_website=False';
                } else {
                    postData = 'bookmark_website=True';
                }
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: chUrl + '/resource/v1/cext/user/bookmark/' + websiteName,
                    data: postData, // pass in data as strings
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrfToken }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            postWebsiteUsed: function(websiteName, isUsedStatus) {
                // function is used to post rating of user for a particular website
                var postData;
                if (isUsedStatus) {
                    postData = 'have_used_website=False';
                } else {
                    postData = 'have_used_website=True';
                }
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: chUrl + '/resource/v1/cext/user/have-used/' + websiteName,
                    data: postData, // pass in data as strings
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken
                    }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            postWebsiteAdd: function(data) {
                // function is used to post rating of user for a particular website
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    dataType: 'json',
                    url: chUrl + '/resource/v1/cext/submissions/website/quick_add',
                    data: data, // pass in data as strings
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            postWebsiteReview: function(websiteSlug, userReview, userRating) {
                // function is used to post rating of user for a particular website
                // var postData= 'rating=' + userRating + '&reviews='+userReview;
                var postData = 'rating=' + userRating;
                if (userReview) {
                    postData += '&reviews=' + userReview;
                }
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: chUrl + '/resource/v1/cext/user/review/' + websiteSlug,
                    data: postData, // pass in data as strings
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrfToken }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            recommendWebsite: function(data) {

                // function is used to post rating of user for a particular website
                var deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: chUrl + '/resource/v1/cext/send-website',
                    data: data, // pass in data as strings
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken
                    }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }

                    deferred.reject(status);
                });

                return deferred.promise;
            },
            putDeleteUserReview: function(websiteSlug) {
                //Create a promise using promise library
                var deferred = $q.defer();
                var query = websiteSlug;
                $http({
                    method: 'PUT',
                    url: chUrl + '/resource/v1/cext/user/review/' + websiteSlug,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken
                    }
                }).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    if (data.error) {
                        var message = data.error.message ? data.error.message : data.error;
                        $.Notify({
                            caption: 'Error',
                            content: message,
                            type: 'alert',
                            timeout: '3000',
                            icon: "<span class='mif-star-full fg-yellow'></span>"
                        });
                    }

                    deferred.reject(status);
                });
                return deferred.promise;
            }

        }
    }
})();
