'use strict';

Instantdex.controller('ExchangeOverviewController', function($scope,$state, $http, ngDialog, InstantdexServices, GlobalServices){
	$scope.balance = [];
	$scope.totalBTC = 0;
    $scope.totalNXT = 0;
    $scope.totalSomeCoin = 0;
    $scope.tempStore = []
	
	for(var i in GlobalServices.exchange_coins){
		if(GlobalServices.exchange_coins[i].exchange == "poloniex"){
			GlobalServices.buildUniqueCoinsList(GlobalServices.exchange_coins[i].coins,$scope.tempStore)
		}
	}

	console.log('all coins', $scope.tempStore);
	$scope.exchangeNames = [
        { name: "biter", id: 0, isChecked: false, coinDetails: []}, 
        { name: "bittrex", id: 1, isChecked: false,coinDetails: []}, 
        { name: "btc38", id: 2, isChecked: false,coinDetails: []},
        { name: "poloniex", id: 3, isChecked: false,coinDetails: []}, 
        { name: "supernet/mgw", id: 4, isChecked: false,coinDetails: []}
    ];

    // $scope.checkAll = function () {
    //     if ($scope.selectedAll) {
    //         $scope.selectedAll = true;
    //     } else {
    //         $scope.selectedAll = false;
    //     }
    //     angular.forEach($scope.exchangeNames, function () {
    //         $scope.temp = $scope.selectedAll;
    // });
    // }

    //$scope.allBases = ['BTC', 'NXT', 'BCY', 'SJCX'];

  //   $scope.availableBases = function(exchange){
  //   	console.log("calling apipairs api");
  //   	var request = '{\"agent\":\"InstantDEX\",\"method\":\"allpairs\",\"exchange\":\"'+exchange+'\"}';
  //   	var callback = function(req, res){
  //   		var a = res['data']['result']
  //   		var b = a[0];
  //   		var c = [];
  //   		for(var i = 1; i <  a.length; i++){
  //   			b = b.concat(a[i]);
  //   		}
  //   		for(var i = 0; i<b.length;i++){
  //   			if(c.indexOf(b[i])<0){
  //   				c.push(b[i]);
  //   				$scope.allBases.push(b[i]);
  //   			}
  //   		}
  //   		console.log($scop.allBases.length);
		// 	angular.forEach($scope.allBases, function(base){
		// 		$scope.getBalance($scope.exchange, base);
		// 	})

		// 	console.log($scope.balance);
    		
    		
  //   	};
		// GlobalServices.makeRequest(request, callback);
  //   }



    $scope.checkboxChanged = function(id){
		$scope.exchangeNames[id].coinDetails.length = 0;
		$scope.exchange = $scope.exchangeNames[id].name;
		//$scope.exchangeNames[id].isChecked = !$scope.exchangeNames[id].isChecked;
		console.log($scope.exchangeNames[id]);
		console.log($scope.exchangeNames[id].isChecked);
		//$scope.availableBases($scope.exchange);
		if($scope.exchangeNames[id].isChecked){
			$scope.tempStore.forEach(function(base){
					$scope.getBalance($scope.exchange, base);
			})
		}
	}

    
	$scope.getBalance = function(exchange,eBase){
		
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"'+exchange+'\",\"base\":\"'+eBase+'\"}';
    	var callback = function(req, res){
    		var coin = res['data'].base;
    		var balance = res['data'].balance;
    		$scope.balance.push({'coin': coin, 'bal':balance});

    		$scope.exchangeNames.forEach(function(ex){
    			if(ex.name === exchange){
    				ex.coinDetails.push({'coin': coin, 'bal':balance});
    				//console.log(JSON.stringify(ex.coinDetails));
    			}

    		})
    		if(coin == "BTC"){
    				$scope.totalBTC += balance;
    		}else if(coin == "NXT"){
    				$scope.totalNXT += balance;
    		}else{
    				$scope.totalSomeCoin += balance; 
    		}
    	};
		GlobalServices.makeRequest(request, callback);
			
	}


}).filter('firstUpper', function() {
    return function(input, scope) {
        return input ? input.substring(0,1).toUpperCase()+input.substring(1).toLowerCase() : "";
    }
});
