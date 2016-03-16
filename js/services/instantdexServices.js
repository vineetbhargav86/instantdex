'use strict';

Instantdex.service('InstantdexServices', function($http, $q, $filter){
    this.getAllExchanges = function(){
        var deferred = $q.defer();
		// var url = "http://127.0.0.1:7778/api/InstantDEX/allexchanges";
		$http.get(url).then(function(exchanges){
			deferred.resolve(exchanges);
		});
		return deferred.promise;
    };

});