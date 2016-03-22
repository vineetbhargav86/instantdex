'use strict';

Instantdex.controller('CoinExchange1By1Controller', function($scope, $state, $stateParams, GlobalServices, BalanceServices, CoinExchangeService, InstantdexServices, $interval){
    $scope.combinedor1by1 = true;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.exchangeWithApiCreds = GlobalServices.exchangeWithApiCreds;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;
    console.log("coinsValidExchanges: "+GlobalServices.coinsValidExchanges);
    $scope.selectedCoinsBalance = {};

    $scope.orderbook = angular.copy(CoinExchangeService.orderbook);

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";

    $scope.sellDet = [];
    $scope.buyDet = [];
    $scope.minTotalError = false;
    $scope.orderHistory = [];
    $scope.openOrders = {};
    // GlobalServices.getOrderHistory($scope.exchangeWithApiCreds)
    //     .then(function(orderHistory) {
    //         $scope.orderHistory = orderHistory;
    //     });

    $scope.$on("openOrdersFetched", function(event, data){
        $scope.openOrders = angular.copy(CoinExchangeService.openOrders);
    });

    $scope.initBuySellObjectsPerExchange = function(){
        $scope.openOrders = angular.copy(CoinExchangeService.openOrders);
        for(var i in $scope.exchangeWithApiCreds){
            $scope.sellDet[$scope.exchangeWithApiCreds[i]] = {"price": 0, "quantity": 0};
            $scope.buyDet[$scope.exchangeWithApiCreds[i]] = {"price": 0, "quantity": 0};
            // $scope.openOrders[$scope.exchangeWithApiCreds[i]] = [];
        }
    }

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

    $scope.validate = function(exchange){
        if($scope.selectedCoinsBalance[$scope.coinType1] && $scope.selectedCoinsBalance[$scope.coinType1].balance){
            if($scope.selectedCoinsBalance[$scope.coinType1].balance < $scope.sellDet[exchange].quantity ){
                GlobalServices.showMessageDialog("Balance is not sufficient to go ahead with the trade.");
                return false;
            }
        }
        else{
            GlobalServices.showMessageDialog("No balance available to go ahead with the trade.");
            return false;
        }
        if($scope.sellDet[exchange].price * $scope.sellDet[exchange].quantity < 0.0001){
            GlobalServices.showMessageDialog("Total should be minimum 0.0001.");
            return false;
        }
        return true;
    }

    $scope.verifyCoinPairForExchange = function(exchange){
        for(var i in GlobalServices.exchange_coins){
            if(GlobalServices.exchange_coins[i].exchange == exchange){
                for(var j in GlobalServices.exchange_coins[i].coins){
                    if((GlobalServices.exchange_coins[i].coins[j][0] == $scope.coinType1 && GlobalServices.exchange_coins[i].coins[j][1] == $scope.coinType2) ||
                        (GlobalServices.exchange_coins[i].coins[j][1] == $scope.coinType1 && GlobalServices.exchange_coins[i].coins[j][0] == $scope.coinType2)){
                        return true;
                    }
                }
            }
        }
        GlobalServices.showMessageDialog("Selected coin pairs for exchange are not valid.");
        return false;
    }

    $scope.buyApiCallback = function(req, res){
        // Call openorders api and
        if(res.data.hasOwnProperty("error")){
            GlobalServices.showMessageDialog(res.data.error);
        }
        else{
            $scope.callOpenOrdersApi(req.exchange);
        }
    }

    $scope.callBuyApi = function(event, exchange){
        event.preventDefault();
        if($scope.verifyCoinPairForExchange(exchange)){
            CoinExchangeService.buyApiWrapper($scope.buyApiCallback, exchange, $scope.coinType1, $scope.coinType2, $scope.buyDet[exchange]['price'], $scope.buyDet[exchange]['quantity'], 1);
        }
    }

    $scope.sellApiCallback = function(req, res){
        // Call openorders api and
        if(res.data.hasOwnProperty("error")){
            GlobalServices.showMessageDialog(res.data.error);
        }
        else{
            $scope.callOpenOrdersApi(req.exchange);
        }
    }

    $scope.callSellApi = function(event, exchange){
        event.preventDefault();
        if($scope.verifyCoinPairForExchange(exchange) && $scope.validate(exchange)){
            CoinExchangeService.sellApiWrapper($scope.sellApiCallback, exchange, $scope.coinType1, $scope.coinType2, $scope.sellDet[exchange]['price'], $scope.sellDet[exchange]['quantity'], 1);
        }
    }

    $scope.openOrderApiCallback = function(req, res){
        // populate orderhistory table
        $scope.openOrders[req.exchange] = [];
        CoinExchangeService.openOrders[req.exchange] = [];
        var keys = Object.keys(res.data);
        for(var i in keys){
            if(keys[i] != "tag" && res.data[keys[i]].length > 0){
                for(var j in res.data[keys[i]]){
                    $scope.openOrders[req.exchange].push(res.data[keys[i]][j]);
                    CoinExchangeService.openOrders[req.exchange].push(res.data[keys[i]][j]);
                }
            }
        }
        // if(res.data[$scope.coinType1+"_"+$scope.coinType2] && res.data[$scope.coinType1+"_"+$scope.coinType2].length > 0){
        //     for(var i in res.data[$scope.coinType1+"_"+$scope.coinType2]){
        //         $scope.openOrders[req.exchange].push(res.data[$scope.coinType1+"_"+$scope.coinType2][i]);
        //         CoinExchangeService.openOrders[req.exchange].push(res.data[$scope.coinType1+"_"+$scope.coinType2][i]);
        //     }
        // }
        // else if(res.data[$scope.coinType2+"_"+$scope.coinType1] && res.data[$scope.coinType2+"_"+$scope.coinType1].length > 0){
        //     for(var i in res.data[$scope.coinType2+"_"+$scope.coinType1]){
        //         $scope.openOrders[req.exchange].push(res.data[$scope.coinType2+"_"+$scope.coinType1][i]);
        //         CoinExchangeService.openOrders[req.exchange].push(res.data[$scope.coinType2+"_"+$scope.coinType1][i]);
        //     }
        // }
    }

    $scope.callOpenOrdersApi = function(exchange){
        CoinExchangeService.openOrdersApiWrapper($scope.openOrderApiCallback, exchange);
    }

    $scope.initBuySellObjectsPerExchange(); // Init called here..

    var deleteNonSelectedCoins = function() {
        for(var prop in $scope.selectedCoinsBalance) {

            if(prop !== $scope.coinType1 && prop !== $scope.coinType2){
                delete $scope.selectedCoinsBalance[prop];
            }
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
