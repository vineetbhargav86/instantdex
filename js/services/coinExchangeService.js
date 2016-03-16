'use strict';

Instantdex.service('CoinExchangeService', function($http, $q, $timeout, GlobalServices){
	var coinExchService = this;
	this.orderbook = [];

	this.callOrderBookApi = function(scopeCallback, exchange, base, rel, dept){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"orderbook\",\"exchange\":\"'+exchange+'\",\"base\":\"'+base+'\",\"rel\":\"'+rel+'\",\"depth\":\"'+dept+'\",\"allfields\":\"1\",\"ignore\":\"0\"}';
		var callback = function(req, res){
			scopeCallback(req, res);
		}
		GlobalServices.makeRequest(request, callback);
	}

	this.isOrderbookFetchedRecently = function(exchange){
		var currTime = 0;
		currTime = (new Date()).getTime();
		if(coinExchService.orderbook.length > 0 && typeof(coinExchService.orderbook[exchange]) != "undefined"  && (currTime - coinExchService.orderbook[exchange].loadtime)/60000 > 2){
			return true;
		}
		return false;
	}
});