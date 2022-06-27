(function() {
    'use strict';

    angular
        .module('chExtension')
        .controller('similarCtrl', similarCtrl);

    similarCtrl.$inject = ['$scope', '$rootScope','chSvc'];

    /* @ngInject */
    function similarCtrl($scope, $rootScope,chSvc) {
        var vm = this;
        vm.title = 'similarCtrl';

        activate();

        ////////////////

        function activate() {
            if(!$rootScope.similarWebsitesLoaded){
                chSvc.getWebsiteSimilar(currentWebsiteSlug).then(function(response){
                    $rootScope.similarWebsites=response;
                    $rootScope.similarWebsitesLoaded = true;
                }, function (status) {
                    $rootScope.websiteProfileError = status;
                    // body...
                });
            }
        }
    }
})();