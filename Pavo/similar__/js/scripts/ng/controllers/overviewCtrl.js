(function() {
    'use strict';

    angular
        .module('chExtension')
        .controller('overviewCtrl', overviewCtrl);

    overviewCtrl.$inject = ['$scope','chSvc'];

    /* @ngInject */
    function overviewCtrl($scope,chSvc) {
        var vm = this;
        vm.title = 'overviewCtrl';

        activate();

        ////////////////

        function activate() {
            setTimeout(function(){
                $scope.chUrl = chUrl;
            },5);
        }
    }
})();