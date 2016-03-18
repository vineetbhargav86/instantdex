'use strict';

Instantdex.service('GlobalServices', function($http, $q, naclAPI, $timeout, ngDialog){
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
					gservices.coinsValidExchanges = gservices.keepUniqueCoins(gservices.coinsValidExchanges, tempCoins);
				}
			}
			// }
		}
	};

	this.keepUniqueCoins = function(uniqueCoins, coinslist){
		for(var i in coinslist){
			if(uniqueCoins.indexOf(coinslist[i]) == -1){
				uniqueCoins.push(coinslist[i]);
			}
		}
		return uniqueCoins;
	};
	this.getOrderHistory = function(exchanges) {
    	var defer = $q.defer(),
    		orderHistory = {},
    		count = 0;

    	angular.forEach(exchanges, function(exch) {
    		var request = '{"agent":"InstantDEX", "method":"tradehistory","exchange":"' + exch + '"}';

    		gservices.makeRequest(request, function(req, res) {
    			//console.log('res for exch', exch, result);
    			orderHistory[exch] = {};

    			angular.forEach(res.data, function(history, pair) {
    				console.log(pair,history);

    				if(angular.isArray(history) ) {
    					// group data for orderNumber
    					var tempGrouped = {},
    						coinPair = pair.split("_");

    					for(var i=0; i<history.length;i++) {
    						var orderNum = history[i].orderNumber;

    						if(!tempGrouped[orderNum]) {
    							tempGrouped[orderNum] = {
    								fee: 0,
    								amount: 0,
    								total: 0,
    								rate: 0,
    								rateCount: 0
    							};
    						};

    						//console.log('history i', i, history[i]);
    						tempGrouped[orderNum].type = history[i].type;
    						tempGrouped[orderNum].fee += Number(history[i].fee);
    						tempGrouped[orderNum].amount += Number(history[i].amount);
    						tempGrouped[orderNum].total += Number(history[i].total);
    						tempGrouped[orderNum].rate += Number(history[i].rate);
    						tempGrouped[orderNum].rateCount++;
    						tempGrouped[orderNum].pair = coinPair;
    						//console.log('in iteration', i, tempGrouped, typeof history[i].amount);

    					};
    					// update rate
    					angular.forEach(tempGrouped, function(val, prop) {
    						tempGrouped[prop].rate = tempGrouped[prop].rate / tempGrouped[prop].rateCount;
    						delete tempGrouped.rateCount;
    					});
    					//orderHistory[exch] = tempGrouped;
    					angular.extend(orderHistory[exch], tempGrouped);
    				};
    			});

    			count++;
    			// if resolved all http requests, resolve orderHistory
    			if(count === exchanges.length)
    				defer.resolve(orderHistory);
    		});
    	});

    	return defer.promise;
    };

    this.showMessageDialog = function(msg){
    	var dialogInstance = ngDialog.open({
            template: "<p>"+msg+"</p>",
            plain: true
        });
    };

});
