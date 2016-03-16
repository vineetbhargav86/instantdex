'use strict';

Instantdex.controller('CoinExchange1By1Controller', function($scope, $state, $stateParams, GlobalServices, BalanceServices, CoinExchangeService, $interval){
    $scope.combinedor1by1 = true;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.exchangeWithApiCreds = GlobalServices.exchangeWithApiCreds;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;
    console.log("coinsValidExchanges: "+GlobalServices.coinsValidExchanges);
    $scope.selectedCoinsBalance = {};

    $scope.orderbook = angular.copy(CoinExchangeService.orderbook);

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";

    $scope.switchToCombinedOr1By1 = function(){
        if($scope.combinedor1by1){
            $state.go('coin_exchange1by1', {
                coinType1: $scope.coinType1,
                coinType2: $scope.coinType2
            });
        }
        else{
            $state.go('coin_exchange', {
                coinType1: $scope.coinType1,
                coinType2: $scope.coinType2
            });
        }
    }
    $scope.exchangeCoinTabs = [];

    // returns true if non zero balance for coin or when coinName is empty
    // update selectedCoinsBalance
    var checkBalanceForCoin = function(coinName) {
        if( !coinName) return true;

        var exchangeNames = angular.copy(BalanceServices.exchangeNames);
        var hasBalance = false;

        for(var i=0;i<exchangeNames.length;i++) {
            var coinDetails = exchangeNames[i].coinDetails || [];
            if(coinDetails.length) {
                for(var j=0; j<coinDetails.length; j++) {
                    if(coinDetails[j].coin === coinName) {
                        hasBalance = true;
                        $scope.selectedCoinsBalance[coinName] = { 
                            balance: coinDetails[j].balance,
                            exchange: exchangeNames[i].name
                        };
                    };
                };
            }
        };

        return hasBalance;
    };

    checkBalanceForCoin($scope.coinType1);
    checkBalanceForCoin($scope.coinType2);

    $scope.checkExchAvailabilityInOrderBook = function(exchange){
        if(Object.keys($scope.orderbook).indexOf(exchange) != -1){
            return i;
        }
        return -1;
    }

    $scope.orderBookApiCallback = function(req, res){
        var obDets = res.data;
        $scope.orderbook[obDets.exchange] = {"sellorders": [], "buyorders": [], "loadtime": (new Date()).getTime()};
        $scope.orderbook[obDets.exchange]["sellorders"] = obDets.asks;
        $scope.orderbook[obDets.exchange]["buyorders"] = obDets.bids;
   
        CoinExchangeService.orderbook[obDets.exchange] = {"sellorders": [], "buyorders": [], "loadtime": (new Date()).getTime()};
        CoinExchangeService.orderbook[obDets.exchange]["sellorders"] = obDets.asks;
        CoinExchangeService.orderbook[obDets.exchange]["buyorders"] = obDets.bids;
    }

    $scope.fetchOrderTables = function(){
        for(var i in $scope.exchangeWithApiCreds){
            if(!CoinExchangeService.isOrderbookFetchedRecently($scope.exchangeWithApiCreds[i]) && $scope.coinType1 != "" && $scope.coinType2 != ""){
                CoinExchangeService.callOrderBookApi($scope.orderBookApiCallback, $scope.exchangeWithApiCreds[i], $scope.coinType1, $scope.coinType2, 10);
            }
        }
    }
    
    $scope.fetchOrderTables();

    $interval(function(){//Call OrderBookApi every 2 minute as it keeps changing
        $scope.fetchOrderTables();
    }, 120000);

    var deleteNonSelectedCoins = function() {
        for(var prop in $scope.selectedCoinsBalance) {

            if(prop !== $scope.coinType1 && prop !== $scope.coinType2)
                delete $scope.selectedCoinsBalance[prop];
        };
    };


    // check if coin type 1 not equal to coin type 2
    $scope.$watch("coinType1", function(newVal, oldVal) {
        if(newVal === oldVal) return;

        if(newVal && newVal === $scope.coinType2) {
            $scope.coinType1 = oldVal;
        };
        deleteNonSelectedCoins();

        if(!checkBalanceForCoin(newVal) && !Object.keys($scope.selectedCoinsBalance).length) {
            $scope.coinType1 = '';  
        };
        
    });

    // check if coin type 2 not equal to  coin type 1
    $scope.$watch("coinType2", function(newVal, oldVal) {
        if(newVal === oldVal) return;
        
        if(newVal && newVal === $scope.coinType1) {
            $scope.coinType2 = oldVal;
        };

        deleteNonSelectedCoins();
        
        if( !checkBalanceForCoin(newVal) && !Object.keys($scope.selectedCoinsBalance).length) {
            $scope.coinType2 = '';  
        };
        
    });
    
    $scope.getBalance = function(exchangeName, coinName) {
        if($scope.selectedCoinsBalance[coinName] && 
            $scope.selectedCoinsBalance[coinName].exchange === exchangeName) {

            return $scope.selectedCoinsBalance[coinName].balance;
        } else 
            return 0;
    };

    $scope.exchangeCoinsTypes = function(event){
        event.preventDefault();
        var temp = $scope.coinType1;
        $scope.coinType1 = $scope.coinType2;
        $scope.coinType2 = temp;
        $scope.fetchOrderTables();
    }

    $scope.coinsChanged = function(){
        $scope.fetchOrderTables();
    }

    $scope.preventDefault = function(event){
        event.preventDefault();
    }

});

Instantdex.filter('toFixed', function(){
    return function(input, dpoints){
        return parseFloat(input).toFixed(dpoints);
    }
});

