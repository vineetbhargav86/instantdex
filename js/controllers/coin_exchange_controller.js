'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, GlobalServices, naclAPI, naclCommon, $stateParams, BalanceServices, $interval){
    $scope.combinedor1by1 = false;
    $scope.credsAvailableExchanges = GlobalServices.credsAvailableExchanges;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";
    
    $scope.selectedCoinsBalance = {};

    $scope.avePriceResponse = {};
    $scope.exchCoinsTable = [];

    $scope.buildExchCoinsTable = function(){
        for(var i in GlobalServices.exchangeWithApiCreds){
            // $scope.callAvePriceApi(GlobalServices.exchangeWithApiCreds[i], $scope.relcoin, basevolume);
            $scope.getBalanceOfCoinForExchange(GlobalServices.exchangeWithApiCreds[i], $scope.coinType2);
            $scope.exchCoinsTable.push({"exchange": GlobalServices.exchangeWithApiCreds[i], "price": $scope.avePriceResponse.aveprice, "amount":0, "balanceB":"", "totalA":"", "apicredsset": ""})
            //call some api and get price for coinA
        }
    }
    $scope.buildExchCoinsTable();

    $scope.getBalanceOfCoinForExchange = function(exchange, coin){
        for(var i in $scope.exchCoinsTable){
            var balFetched = BalanceServices.isBalanceFetchedRecently($scope.exchCoinsTable[i].exchange, coin);
            if(!balFetched["recent"]){
                $scope.callBalanceAPi(exchange, coin);
                BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]] = (new Date()).getTime();
            }
            else{
                $scope.exchCoinsTable[i].balanceB = BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].balance;
            }
        }
    }

    //get balance for each exchange for selected coin with balance api
    $scope.callBalanceAPi = function(exchange, coin){
        var request = '{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"'+exchange+'\",\"base\":\"'+coin+'\"}';
        var callback = function(req, res){
            var data = res.data;
            // $scope.exchangeBalanceData = [];
            for(var j in $scope.exchCoinsTable){
                if($scope.exchCoinsTable[j].exchange == req.exchange){
                    $scope.exchCoinsTable[j].balanceB = data.balance;
                    break;
                }
            }
        }
        GlobalServices.makeRequest(request, callback);
    }

    $scope.callAvePriceApi = function(basevolume){
        var request = '{\\\"agent\\\":\\\"tradebot\\\",\\\"method\\\":\\\"aveprice\\\",\\\"comment\\\":\\\"\\\",\\\"base\\\":\\\"'+$scope.coinType1+'\\\",\\\"rel\\\":\\\"'+$scope.coinType2+'\\\",\\\"basevolume\\\":\\\"'+basevolume+'\\\""}';
        var callback = function(req, res){
            $scope.avePriceResponse = res;
        }
        GlobalServices.makeRequest(request, callback);
    }

    $interval(function(){//Call average api every 1 minute as it keeps changing
        $scope.callAvePriceApi(1);
    }, 60000);

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

    $scope.exchangeCoinsTypes = function(event){
        event.preventDefault();
        var temp = $scope.coinType1;
        $scope.coinType1 = $scope.coinType2;
        $scope.coinType2 = temp;
    }

    $scope.preventDefault = function(event){
        event.preventDefault();
    }

    $scope.toggleAmoutInput = function(){
        $scope.showAmountInput = !$scope.showAmountInput;
    }

});