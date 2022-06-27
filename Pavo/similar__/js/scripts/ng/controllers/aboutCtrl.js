(function() {
    'use strict';

    angular
        .module('chExtension')
        .controller('aboutCtrl', aboutCtrl);

    aboutCtrl.$inject = ['$scope','chSvc', '$rootScope', '$sce'];

    /* @ngInject */
    function aboutCtrl($scope,chSvc, $rootScope, $sce) {
        var vm = this;
        vm.title = 'aboutCtrl';

        activate();

        ////////////////

        function activate() {
            if(!$rootScope.ExtraDetailLoaded){
                chSvc.getWebsiteExtraDetails(currentWebsiteSlug).then(function(response){
                    if(response.video_url){
                          response.video_url = $sce.trustAsResourceUrl(response.video_url.replace("/watch?v=","/embed/").concat("?modestbranding=1&autoplay=0&showinfo=0&"));
                    }

                    $rootScope.websiteExtraDetail=response;
                    $rootScope.ExtraDetailLoaded = true;
                }, function (status) {
                    $rootScope.websiteProfileError = status;
                    // body...
                });
            }
        }
    }
})();