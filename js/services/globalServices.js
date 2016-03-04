'use strict';

Instantdex.service('GlobalServices', function($http, $q, naclAPI){
	var gservices = this;

	this.makeRequest = function(request, callback){
		naclAPI.makeRequest(request, callback);
	}

	this.all_coins = [];// List of all supported coins

	this.exchangeDetails = [];// Contains all exchange details listed in options view

	this.exchangeWithApiCreds = [];

	this.exchangesStatus = [];

	this.exchange_coins = [

	];// List of coins supprted by each exchange

	this.coinsValidExchanges = [];

	this.credsAvailableExchanges = [];

	this.putExchangeWiseCoins = function(exchange, coins){
		var exch_coins = {"exchange":exchange, "coins": coins};
		gservices.exchange_coins.push(exch_coins);
	};

	this.buildUniqueCoinsList = function(coins, coinlist){
		for(var i in coins){
			for(var j in coins[i]){
				if(coinlist.indexOf(coins[i][j]) == -1){
					coinlist.push(coins[i][j]);
				}
			}
		}
	};

	this.initExchangeCoinsData = function(){
		for(var i in gservices.exchangeDetails){
			var request = '{\"agent\":\"InstantDEX\",\"method\":\"allpairs\",\"exchange\":\"'+gservices.exchangeDetails[i]+'\"}';
			var callback = function(req, res){
				gservices.putExchangeWiseCoins(req['exchange'], res.data.result);
				gservices.buildUniqueCoinsList(res.data.result, gservices.all_coins);
			}
			gservices.makeRequest(request, callback);
		}
	};

	this.getCoinTypes = function(){
		var cointypes = [
			{"key":"CoinA", "value":"CoinA"},
			{"key":"CoinB", "value":"CoinB"},
			{"key":"CoinC", "value":"CoinC"},
		];
		return cointypes;
	};

	this.buildSupportedCoinsListForApiCredsAvailableExchanges = function(){
		var tempCoins = [];
		for(var i in gservices.exchangeWithApiCreds){
			// if(gservices.exchangeWithApiCreds[i].areCredsSet){
			for(var j in gservices.exchange_coins){
				if(gservices.exchange_coins[j].exchange == gservices.exchangeWithApiCreds[i]){
					tempCoins = [];
					gservices.buildUniqueCoinsList(gservices.exchange_coins[j].coins, tempCoins);
					gservices.coinsValidExchanges = gservices.removeDuplicatesCoins(angular.extend(gservices.coinsValidExchanges, tempCoins));
				}
			}
			// }
		}
	};

	this.removeDuplicatesCoins = function(coinslist){
		var uniqueCoins = [];
		for(var i in coinslist){
			if(uniqueCoins.indexOf(coinslist[i]) == -1){
				uniqueCoins.push(coinslist[i]);
			}
		}
		return uniqueCoins;
	}
});