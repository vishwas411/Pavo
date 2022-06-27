(function() {

    //autocomplete directive to navigate suggestion list
    angular
    .module('chExtension')
    .directive('catDropdownDirective', function() {
            return {
                scope: {
                    catList: '=catList',
                    listNum: '=listNum',
                },
                template: '<div></div>',
                link: function(scope, elem, attrs){

                            var data = [];
                            for (i in scope.catList){
                                data.push({'id':scope.catList[i].id, 'text': scope.catList[i].name});
                            }
                            setTimeout(function() {
                                $("#sub-category-"+scope.listNum).select2({
                                width:'100%',
                                data:data,
                                });
                            }, 2);                    
                    ;
                }
            };
        
    });

})();