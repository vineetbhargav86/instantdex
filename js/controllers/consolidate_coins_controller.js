'use strict';

Instantdex.controller('ConsolidateCoinsController', function($scope, $state, GlobalServices, ngDialog, BalanceServices){
	$scope.allCoins = angular.copy(GlobalServices.coinsValidExchanges);
	$scope.exchangeWiseList = angular.copy(GlobalServices.exchange_coins);
	$scope.selectedCoin = "-1";
	$scope.destaddr = "";
	$scope.exchangeBalanceData = [];
	$scope.credsAvailableExchanges = angular.copy(GlobalServices.exchangeWithApiCreds);
	$scope.showNoCoinMsg = false;
	$scope.showExchangeCoinFetchingLoader = false;
	$scope.totalCoins = 0;
	$scope.isNewCoinBalanceFetched = false;
	$scope.newCoinBalanceFetchedInd1= -1;
	// $scope.newCoinBalanceFetchedInd2= -1;
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

	$scope.getIndexOfExchangeNamesFromBalanceServiceVar = function(exchange){
		for(var i in BalanceServices.exchangeNames){
			if(BalanceServices.exchangeNames[i].name == exchange){
				return i;
			}
			return -1;
		}
	};

	$scope.exchangeExistsInExchangeBalanceData = function(exchange){
		for(var j in $scope.exchangeBalanceData){
			if($scope.exchangeBalanceData[j].exchange == exchange){
				return j;
			}
		}
		return -1;
	}

	$scope.coinChanged = function(){
		$scope.showExchangeCoinFetchingLoader = true;
		$scope.showNoCoinMsg = false;
		var coinExchanges = [];
		$scope.exchangeBalanceData = [];
		var exchInd = 0;
		for(var i in $scope.credsAvailableExchanges){
			// exists = false;
			var balFetched = BalanceServices.isBalanceFetchedRecently($scope.credsAvailableExchanges[i], $scope.selectedCoin);
			if(typeof(balFetched) == "undefined" || !balFetched["recent"]){
				if(typeof(balFetched) == "undefined"){
				// 	$scope.isNewCoinBalanceFetched = true;
				// 	$scope.newCoinBalanceFetchedInd1 = $scope.getIndexOfExchangeNamesFromBalanceServiceVar($scope.credsAvailableExchanges[i]);
					$scope.exchangeBalanceData.push({"balance": "", "exchange": $scope.credsAvailableExchanges[i], "transferfee":"", "tamount": ""});
				}
				$scope.getBalanceOfCoinForExchange($scope.credsAvailableExchanges[i], $scope.selectedCoin);
				if(typeof(balFetched) != "undefined"){
					BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].loadtime = (new Date()).getTime();
				}
			}
			else{
				exchInd = $scope.exchangeExistsInExchangeBalanceData($scope.credsAvailableExchanges[i]);
				if(exchInd != -1){
					$scope.exchangeBalanceData[exchInd].balance = BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]];
					$scope.showExchangeCoinFetchingLoader = false;
				}
				else{
					$scope.exchangeBalanceData.push({"balance": BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].balance, "exchange": $scope.credsAvailableExchanges[i], "transferfee":"", "tamount": ""});
					$scope.showExchangeCoinFetchingLoader = false;
				}
			}
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
				var exchangeExists = false;
				// if($scope.isNewCoinBalanceFetched){
				// 	BalanceServices.exchangeNames[$scope.newCoinBalanceFetchedInd1].coinDetails.push({
				// 		"balance": data.balance,
				// 		"coin": req.base,
				// 		"loadtime": (new Date()).getTime()
				// 	});
				// 	$scope.isNewCoinBalanceFetched = false;
				// 	$scope.newCoinBalanceFetchedInd1 = -1;
				// }
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
				if($scope.exchangeBalanceData.length == 0){
					$scope.showNoCoinMsg = true;
				}
			}
			$scope.showExchangeCoinFetchingLoader = false;
			$scope.getTotalOfCoinsToWithdraw();
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
		$scope.getTotalOfCoinsToWithdraw();
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