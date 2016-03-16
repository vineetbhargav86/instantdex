'use strict';
Instantdex.service('BalanceServices', function($http, $q, $rootScope, GlobalServices) {
	var balService = this;
	this.credsAvailableExchanges = [];
	this.exchangeNames = [];
	this.exchangeWiseList = [];
	this.validExchangeList = [];
	this.totalsTable = [];
	this.masterExchangeCoins = [
		{"exchange": "poloniex", "coins":["BTC", "NXT", "XMR", "LTC" ]},
		{"exchange": "bittrex", "coins":["BTC", "JBS", "LTC", "DASH"]},
		{"exchange": "truefx", "coins":["EUR", "USD", "GBP", "AUD"]},
		{"exchange": "btce", "coins":["BTC", "LTC", "NMC", "USD"]},
		{"exchange": "fxcm", "coins":["USD", "EUR", "GBP", "JPY"]},
	];

	function initialize() {
		balService.exchangeWiseList = GlobalServices.exchange_coins;
		console.log("All exchages coins :"+ JSON.stringify(GlobalServices.exchange_coins));
		balService.validExchangeList = GlobalServices.exchangeWithApiCreds;
		var exchangeNames = [];
		var exists = false;
		for (var i in balService.validExchangeList) {
			exists = false;
			for(var j in balService.exchangeNames){
				if(balService.validExchangeList[i] == balService.exchangeNames[j].name){
					exists = true;
					break;
				}
			}
			if(!exists){
				balService.exchangeNames.push({
					'name': balService.validExchangeList[i],
					'id': parseInt(i),
					'isChecked': false,
					'coinDetails': []
				});
			}
		}
	}

	this.getCoinsOfExchangesWithApiCreds = function() {
		var tempCoins = [];
		var exists = false;
		for (var i in balService.validExchangeList) {
			for (var j in balService.exchangeWiseList) {
				exists = false;
				for(var k in balService.credsAvailableExchanges){
					if(balService.credsAvailableExchanges[k].exchange == balService.validExchangeList[i]){
						exists = true;
						break;
					}
				}
				if (balService.exchangeWiseList[j].exchange == balService.validExchangeList[i] && !exists) {
					tempCoins = [];
					GlobalServices.buildUniqueCoinsList(balService.exchangeWiseList[j].coins, tempCoins);
					balService.credsAvailableExchanges.push({
						'exchange': balService.exchangeWiseList[j].exchange,
						'coins': tempCoins
					});
				}
			}
		}
		console.log('BalanceService credsAvailableExchanges', balService.credsAvailableExchanges);
	}

	this.getTotalOfCoins = function(selectedCoin, balance) {
		for (var j in balService.totalsTable) {
			if (balService.totalsTable[j].coin === selectedCoin) {
				balService.totalsTable[j].balance += balance;
			}
		}
		balService.totalsTable.push({
			"coin": selectedCoin,
			"balance": balance
		})
	}
	this.getBalanceOfCoinForExchange = function(exchange, coin) {
		console.log("calling Balance API");
		var request =
			'{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"' +
			exchange + '\",\"base\":\"' + coin + '\"}';
		var callback = function(req, res) {
			var data = res.data;
			for (var i in balService.exchangeNames) {
				if (!data.hasOwnProperty('error') && balService.exchangeNames[i].name === req.exchange) {
					if(data.balance > 0){
						balService.exchangeNames[i].coinDetails.push({
							"balance": data.balance,
							"coin": req.base,
							"loadtime": (new Date()).getTime()
						});
						$rootScope.$broadcast("newCoinBalanceAdded", req.exchange);
					}
				}
			}
			if (!data.hasOwnProperty('error')) {
				if(data.balance > 0){
					balService.getTotalOfCoins(req.base, data.balance);
					$rootScope.$broadcast("totalCoinBalanceUpdated", req.base);
				}
			}
		}
		for(var x in balService.masterExchangeCoins){
			if(balService.masterExchangeCoins[x].exchange == exchange && balService.masterExchangeCoins[x].coins.indexOf(coin) != -1){
				GlobalServices.makeRequest(request, callback);
			}
		}
	}

	this.initBalanceCall = function() {
		console.log('Initializing Balance Service......');
		initialize();
		balService.getCoinsOfExchangesWithApiCreds();
		for (var i in balService.credsAvailableExchanges) {
			for (var j in balService.credsAvailableExchanges[i].coins) {
				balService.getBalanceOfCoinForExchange(balService.credsAvailableExchanges[i].exchange, balService.credsAvailableExchanges[i].coins[j]);
			}
		}
	}

	this.getCoinBalanceForAnExchange = function(exchange){
		initialize();
		balService.getCoinsOfExchangesWithApiCreds();
		for (var i in balService.credsAvailableExchanges) {
			if(balService.credsAvailableExchanges[i].exchange == exchange){
				for (var j in balService.credsAvailableExchanges[i].coins) {
						balService.getBalanceOfCoinForExchange(balService.credsAvailableExchanges[i].exchange, balService.credsAvailableExchanges[i].coins[j]);
				}
				break;
			}
		}
	}

	this.isBalanceFetchedRecently = function(exchange, coin){
		var currTime = 0;
		for(var i in balService.exchangeNames){
			if(balService.exchangeNames[i].name == exchange){
				for(var j in balService.exchangeNames[i].coinDetails){
					if(balService.exchangeNames[i].coinDetails[j].coin == coin){
						currTime = (new Date()).getTime();
						if((currTime - balService.exchangeNames[i].coinDetails[j].loadtime)/60000 >= 1){// Check if the time elaspsed for the balance call on this coin is more than 1 minute.
							return {"recent":false, "ind1":i, "ind2":j};
						}
						else{
							return {"recent":true, "ind1":i, "ind2":j};
						}
					}
				}
			}
		}
	}
});