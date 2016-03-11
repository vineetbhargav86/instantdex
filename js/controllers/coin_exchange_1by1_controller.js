'use strict';

Instantdex.controller('CoinExchange1By1Controller', function($scope, $state, GlobalServices, $stateParams, BalanceServices){
    $scope.combinedor1by1 = true;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.exchangeWithApiCreds = GlobalServices.exchangeWithApiCreds;
    $scope.credsAvailableExchanges = GlobalServices.credsAvailableExchanges;
    $scope.exchange_coins = GlobalServices.exchange_coins;

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
    console.log('balance', BalanceServices.exchangeNames);
    var showCoinExchangeDetails = function() {
        console.log('showCoinExchangeDetails start',$scope.exchangeWithApiCreds);
        angular.forEach($scope.exchangeWithApiCreds, function(exch) {
            angular.forEach($scope.exchange_coins, function(exCoins) {
                if(exCoins.exchange === exch) {
                    var coins = exCoins.coins || [];
                    console.log('coins', coins);
                    for(var i=0; i<coins.length; i++) {
                        console.log('coins and coinType', coins, $scope.coinType1);
                        if( (coins[i][0] === $scope.coinType1 && 
                            coins[i][1] === $scope.coinType2) || 
                            (coins[i][0] === $scope.coinType2 && 
                            coins[i][1] === $scope.coinType1) ) {

                            $scope.exchangeCoinTabs.push(exch);
                        };
                    }
                }
            });
        });
    };

    // check if coin type 1 not equal to coin type 2
    $scope.$watch("coinType1", function(newVal, oldVal) {
        if(newVal && newVal === $scope.coinType2) {
            $scope.coinType1 = oldVal;
        };
        showCoinExchangeDetails();
    });

    // check if coin type 2 not equal to  coin type 1
    $scope.$watch("coinType2", function(newVal, oldVal) {
        if(newVal && newVal === $scope.coinType1) {
            $scope.coinType2 = oldVal;
        };
        showCoinExchangeDetails();
    });
    

    $scope.exchangeCoinsTypes = function(event){
        event.preventDefault();
        var temp = $scope.coinType1;
        $scope.coinType1 = $scope.coinType2;
        $scope.coinType2 = temp;
    }

    $scope.preventDefault = function(event){
        event.preventDefault();
    }

});