'use strict';

Instantdex.service('CoinExchangeService', function($http, $q, $timeout, GlobalServices, $rootScope){
	var coinExchService = this;
	this.orderbook = [];
	this.openOrders = {};

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

	this.buyApiWrapper = function(scopeCallback, exchange, base, rel, price, volume, dotrade){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"buy\",\"exchange\":\"'+exchange+'\",\"base\":\"'+base+'\",\"rel\":\"'+rel+'\",\"price\":\"'+price+'\",\"volume\":\"'+volume+'\",\"dotrade\":\"'+dotrade+'\"}';
		var callback = function(req, res){
			scopeCallback(req, res);
		}
		GlobalServices.makeRequest(request, callback);
	}

	this.sellApiWrapper = function(scopeCallback, exchange, base, rel, price, volume, dotrade){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"sell\",\"exchange\":\"'+exchange+'\",\"base\":\"'+base+'\",\"rel\":\"'+rel+'\",\"price\":\"'+price+'\",\"volume\":\"'+volume+'\",\"dotrade\":\"'+dotrade+'\"}';
		var callback = function(req, res){
			scopeCallback(req, res);
		}
		GlobalServices.makeRequest(request, callback);
	}

	this.openOrdersApiWrapper = function(scopeCallback, exchange){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"openorders\",\"exchange\":\"'+exchange+'\"}';
		var callback = function(req, res){
			console.log('open orders', res);
			scopeCallback(req, res);
		}
		GlobalServices.makeRequest(request, callback);
	}

	this.cancelOrdersApiWrapper = function(scopeCallback, exchange, orderid) {
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"cancelorder\",\"exchange\":\"'+exchange+'\",\"orderid\":\"'+orderid+'\"}';
		var callback = function(req, res){
			scopeCallback(req, res);
		}
		GlobalServices.makeRequest(request, callback);	
	}

	this.openOrderApiCallback = function(req, res){
	    // populate orderhistory table
		if(res.data.hasOwnProperty("message") || res.data.hasOwnProperty("error")){
			return false;// Error
		}
		var keys = Object.keys(res.data);
		for(var i in keys){
			if(keys[i] != "tag" && res.data[keys[i]].length > 0){
				for(var j in res.data[keys[i]]){
					coinExchService.openOrders[req.exchange].push(res.data[keys[i]][j]);
		        }
			}
		}
		$rootScope.$broadcast("openOrdersFetched", "");
	}

	this.getOpenOrders = function(){
		for(var i in GlobalServices.exchangeWithApiCreds){
			coinExchService.openOrders[GlobalServices.exchangeWithApiCreds[i]] = [];
			coinExchService.openOrdersApiWrapper(coinExchService.openOrderApiCallback, GlobalServices.exchangeWithApiCreds[i]);
		}
	}

});
