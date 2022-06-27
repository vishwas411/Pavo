//formatPara Filter to remove extra string content
(function() {
    'use strict';
    angular
        .module('chExtension')
        .filter('formatPara', formatPara);
    function formatPara() {
        return function(str,maxLength) {
          if (!str || !str.length || !maxLength) { return; }
          if(str.length > maxLength){
          //trim the string to the maximum length
            var trimmedString = str.substr(0, maxLength);
            //re-trim if we are in the middle of a word
            return trimmedString.substr(0,
              Math.min(trimmedString.length,
                trimmedString.lastIndexOf(" "))
              ).concat("...");        
          }
          else
            return str
        };
    }
})();