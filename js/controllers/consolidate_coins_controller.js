'use strict';

Instantdex.controller('ConsolidateCoinsController', function($scope, $state, GlobalServices){
	$scope.allCoins = [];
	$scope.exchangeWiseList = angular.copy(GlobalServices.exchange_coins);
	$scope.selectedCoin = "-1";
	$scope.destaddr = "";
	$scope.exchangeBalanceData = [];
	$scope.credsAvailableExchanges = [];
	$scope.getCoinsOfExchangesWithApiCreds = function(){
		var tempCoins = [];
		for(var i in GlobalServices.exchangeApiCredsStatus){
			if(GlobalServices.exchangeApiCredsStatus[i].areCredsSet){
				for(var j in $scope.exchangeWiseList){
					if($scope.exchangeWiseList[j].exchange == GlobalServices.exchangeApiCredsStatus[i].name){
						tempCoins = [];
						GlobalServices.buildUniqueCoinsList($scope.exchangeWiseList[j].coins, tempCoins);
						$scope.allCoins = angular.extend($scope.allCoins, tempCoins);
						$scope.credsAvailableExchanges.push($scope.exchangeWiseList[j].exchange);
					}
				}
			}
		}
	}
	$scope.getCoinsOfExchangesWithApiCreds();

	//with withdraw api send some amount to a address

	//get all exchanges which deals with selected coin
	$scope.coinChanged = function(){
		var coinExchanges = [];
		// for(var i in $scope.exchangeWiseList){
		// 	for(var j  in $scope.exchangeWiseList[i].coins){
		// 		if($scope.exchangeWiseList[i].coins[j].indexOf($scope.selectedCoin) > -1){
		// 			if(coinExchanges.indexOf($scope.exchangeWiseList[i].exchange) == -1){
		// 				coinExchanges.push($scope.exchangeWiseList[i].exchange);
		// 			}
		// 		}
		// 	}
		// }
		$scope.exchangeBalanceData = [];
		for(var i in $scope.credsAvailableExchanges){
			$scope.getBalanceOfCoinForExchange($scope.credsAvailableExchanges[i], $scope.selectedCoin);
		}
		console.log("Exchanges for selected coin: "+JSON.stringify($scope.credsAvailableExchanges));
	}

	//get balance for each exchange for selected coin with balance api
	$scope.getBalanceOfCoinForExchange = function(exchange, coin){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"'+exchange+'\",\"base\":\"'+coin+'\"}';
		var callback = function(req, res){
			var data = res.data;
			$scope.exchangeBalanceData = [];
			if(!data.hasOwnProperty('error')){
				$scope.exchangeBalanceData.push({"balance": data.balance, "exchange": req.exchange, "transferfee":"", "tamount": ""});
			}
		}
		GlobalServices.makeRequest(request, callback);
	}

	$scope.withdrawFromAvailableBAlance = function(){
		console.log(JSON.stringify($scope.exchangeBalanceData));
		for(var i in $scope.exchangeBalanceData){
			if($scope.exchangeBalanceData[i].tamount != "" || $scope.exchangeBalanceData[i].tamount != undefined){
				var request = '{\"agent\":\"InstantDEX\",\"method\":\"withdraw\",\"exchange\":\"'+
					$scope.exchangeBalanceData[i].exchange+'\",\"base\":\"'+$scope.selectedCoin+'\",\"destaddr\":\"'+$scope.destaddr+'\",\"amount\":\"'+$scope.exchangeBalanceData[i].tamount+'\"}';
				var callback = function(req, res){
					var data = res.data;
					// if(!data.hasOwnProperty('error')){
					$scope.getBalanceOfCoinForExchange(req.exchange, $scope.selectedCoin);
					// }
				}
				GlobalServices.makeRequest(request, callback);
			}
		}
	}

	$scope.setMaxToAll = function(){
		for(var i in $scope.exchangeBalanceData){
			$scope.exchangeBalanceData[i].tamount = $scope.exchangeBalanceData[i].balance;
		}
	}
});