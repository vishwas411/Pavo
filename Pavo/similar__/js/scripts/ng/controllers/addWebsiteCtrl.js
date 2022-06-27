(function () {
    'use strict';

    angular
        .module('chExtension')
        .controller('addWebsiteCtrl', addWebsiteCtrl);

    addWebsiteCtrl.$inject = ['$scope', 'chSvc'];

    /* @ngInject */
    function addWebsiteCtrl($scope, chSvc) {
        var vm = this;
        vm.title = 'addWebsiteCtrl';

        activate();

        ////////////////

        function activate() {

            $scope.quickSubmitWebsite = {};
            $('#submitWebsiteCategorySelector').val('');
            ajaxCategorySelector('#submitWebsiteCategorySelector',
                chUrl + "/resource/v1/cext/categories/treesearch/",
                "");

            $scope.getChildren = function (categoryId, level) {
                if (!$scope.subCatList) {
                    $scope.subCatList = [];
                }
                $scope.quickSubmitWebsite["category"] = categoryId;
                chSvc.getSubCategoriesById(categoryId).then(function (Cats) {
                    if (level == "root") {
                        level = 0
                    } else {
                        level = Number(level.replace("sub-category-", ""))
                        level++;
                    }
                    $scope.subCatList.splice(level, $scope.subCatList.length - level);
                    if (Cats.children.length) {
                        $scope.subCatList[level] = Cats.children
                    }
                });
            }

            $scope.subCatSelectorDropdown = function (catList, listNum) {
                var data = [];
                for (i in catList) {
                    data.push({
                        'id': catList[i].id,
                        'text': catList[i].name
                    });
                }

                setTimeout(function () {
                    $("#sub-category-" + listNum).select2({
                        width: '100%',
                        data: data,
                    });
                }, 2);
            }

            $(".quick-topic-select").select2({
                multiple: true,
                tags: true,
                placeholder: "",
                tokenSeparators: [","],
                maximumSelectionLength: 5,
                minimumInputLength: 1,
                width: '100%',
            });
            setTimeout(function () {
                $("#countryServed").select2({
                    placeholder: "This website is useful in",
                    width: '100%',
                    data: isoCountriesList,
                });
                $("#websiteLanguage").select2({
                    placeholder: "This website supports",
                    data: languagesList,
                    width: '100%',
                });

            }, 3)


            $("#submitWebsiteTopicSelector").select2({
                minimumInputLength: 2,
                ajax: {
                    url: function (params) {
                        return chUrl + "/resource/v1/cext/topics/instantsearch/" + params.term
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
                            if (data[i].slug) {
                                newData[i] = {
                                    "id": data[i].id,
                                    "text": data[i].name,
                                    "user": true
                                }
                            }
                        }
                        if (!newData.length) {
                            newData[0] = {
                                "text": "No results",
                                // "user":true
                            }
                        }
                        return {
                            results: newData
                        };
                    },
                    cache: true
                },
                placeholder: "Select topic",
                //allowClear: true,
                multiple: true,
                tags: true,
                templateResult: fmtState,
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
                        '<span>' + state.text + '</span>'
                    );
                    return $state;
                }
            }



            $scope.submitWebsite = function () {
                if ($scope.chUserStatus) {
                    $scope.quickSubmitWebsite['site_url'] = currentWebsiteUrl?currentWebsiteUrl:$scope.currentWebsiteSlug;
                    if ($('#submitWebsiteTopicSelector').val()) {
                        $scope.quickSubmitWebsite['topics'] = $('#submitWebsiteTopicSelector').val();
                    } else {
                        delete $scope.quickSubmitWebsite['topics'];
                    }
                    $scope.submitWebsiteLoader = true;
                    chSvc.postWebsiteAdd($scope.quickSubmitWebsite).then(function (response) {
                        $scope.submitWebsiteLoader = false;
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
                            $scope.addWebsiteFormSubmitted = true;
                            var paramsObject = {
                                'URL': $scope.quickSubmitWebsite['site_url'],
                                'Type': 'Quick'
                            }
                            trackEvents('Website Submit', paramsObject);

                            $.Notify({
                                caption: $scope.currentWebsiteSlug,
                                content: 'Website added!',
                                timeout: '2000',
                                icon: "<span class='mif-checkmark fg-blue'></span>"
                            });
                        }
                    });
                } else {
                    showDialog('#dialogLogin');
                }
            }


        }
    }
})();