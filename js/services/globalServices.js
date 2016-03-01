'use strict';

Instantdex.service('GlobalServices', function($http, $q, naclAPI){
	var gservices = this;

	this.makeRequest = function(request, callback){
		naclAPI.makeRequest(request, callback);
	}

	this.all_coins = [];// List of all supported coins

	this.exchangeDetails = [];// Contains all exchange details listed in options view

	this.exchangeApiCredsStatus = [];

	this.exchange_coins = [

	];// List of coins supprted by each exchange

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
				// if(i <= 17){
				// 	console.log("All Coins: "+ JSON.stringify(gservices.all_coins));
				// 	console.log("Exchange wise Coins: "+ JSON.stringify(gservices.exchange_coins));
				// }
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

});