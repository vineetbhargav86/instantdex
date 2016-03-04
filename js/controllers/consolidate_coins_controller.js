'use strict';

Instantdex.controller('ConsolidateCoinsController', function($scope, $state, GlobalServices, ngDialog){
	$scope.allCoins = angular.copy(GlobalServices.coinsValidExchanges);
	$scope.exchangeWiseList = angular.copy(GlobalServices.exchange_coins);
	$scope.selectedCoin = "-1";
	$scope.destaddr = "";
	$scope.exchangeBalanceData = [];
	$scope.credsAvailableExchanges = angular.copy(GlobalServices.exchangeWithApiCreds);
	$scope.showNoCoinMsg = false;
	$scope.showExchangeCoinFetchingLoader = false;
	$scope.totalCoins = 0;
	// $scope.getCoinsOfExchangesWithApiCreds = function(){
	// 	var tempCoins = [];
	// 	for(var i in GlobalServices.exchangesStatus){
	// 		if(GlobalServices.exchangesStatus[i].areCredsSet){
	// 			for(var j in $scope.exchangeWiseList){
	// 				if($scope.exchangeWiseList[j].exchange == GlobalServices.exchangesStatus[i].name){
	// 					tempCoins = [];
	// 					GlobalServices.buildUniqueCoinsList($scope.exchangeWiseList[j].coins, tempCoins);
	// 					$scope.allCoins = angular.extend($scope.allCoins, tempCoins);
	// 					$scope.credsAvailableExchanges.push($scope.exchangeWiseList[j].exchange);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	// $scope.getCoinsOfExchangesWithApiCreds();

	//with withdraw api send some amount to a address

	//get all exchanges which deals with selected coin
	$scope.coinChanged = function(){
		$scope.showExchangeCoinFetchingLoader = true;
		$scope.showNoCoinMsg = false;
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
			// $scope.exchangeBalanceData = [];
			if(!data.hasOwnProperty('error')){
				$scope.showNoCoinMsg = false;
				$scope.showExchangeCoinFetchingLoader = false;
				var exchangeExists = false;
				for(var j in $scope.exchangeBalanceData){
					if($scope.exchangeBalanceData[j].exchange == req.exchange){
						$scope.exchangeBalanceData[j].balance = data.balance;
						exchangeExists = true;
					}
				}
				if(!exchangeExists){
					$scope.exchangeBalanceData.push({"balance": data.balance, "exchange": req.exchange, "transferfee":"", "tamount": ""});
				}
			}
			else{
				$scope.showExchangeCoinFetchingLoader = false;
				if($scope.exchangeBalanceData.length == 0){
					$scope.showNoCoinMsg = true;
				}
			}
		}
		GlobalServices.makeRequest(request, callback);
	}

	$scope.withdrawFromAvailableBalance = function(){
		console.log(JSON.stringify($scope.exchangeBalanceData));
		var errorWithdrawal = [];
		for(var i in $scope.exchangeBalanceData){
			if($scope.exchangeBalanceData[i].tamount != "" || $scope.exchangeBalanceData[i].tamount != undefined){
				if($scope.exchangeBalanceData[i].tamount <= $scope.exchangeBalanceData[i].balance){
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
				else{
					errorWithdrawal.push($scope.exchangeBalanceData[i].exchange);
				}
			}
		}
		if(errorWithdrawal.length > 0){
			//show error message
			$scope.showMsgDialog("Exchange(s)- "+errorWithdrawal.join()+" donot have sufficient balance to withdraw.");
		}
	}

	$scope.getTotalOfCoinsToWithdraw = function(){
		$scope.totalCoins = 0;
		for(var i in $scope.exchangeBalanceData){
			$scope.totalCoins = $scope.totalCoins + $scope.exchangeBalanceData[i].tamount;
		}
	}

	$scope.setMaxToAll = function(){
		for(var i in $scope.exchangeBalanceData){
			$scope.exchangeBalanceData[i].tamount = $scope.exchangeBalanceData[i].balance;
		}
	}

	$scope.showMsgDialog = function(msg) {
        var dialogInstance = ngDialog.open({
            template: "<p>"+msg+"</p>",
            // controller: function($scope) {
            //     $scope.ok = function() {
            //         $scope.closeThisDialog();
            //     }                
            // }
            plain: true
        });
    };
});