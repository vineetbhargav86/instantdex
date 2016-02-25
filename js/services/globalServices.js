'use strict';

Instantdex.service('GlobalServices', function($http, $q, naclAPI){
	this.makeRequest = function(request, callback){
		naclAPI.makeRequest(request, callback);
	}

    this.getCoinTypes = function(){
        var cointypes = [
            {"key":"CoinA", "value":"CoinA"},
            {"key":"CoinB", "value":"CoinB"},
            {"key":"CoinC", "value":"CoinC"},
        ];
        return cointypes;
    };

    this.exchangeDetails = [];// Contains all exchange  details listed in options view.
});