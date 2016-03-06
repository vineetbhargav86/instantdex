'use strict';


Instantdex.service('BalanceServices', function($http, $q, GlobalServices) {
    var balService = this;
    this.credsAvailableExchanges = [];
    this.exchangeNames = [];
    this.exchangeWiseList = [];
    this.validExchangeList = [];
    this.totalsTable = [];

    function initialize() {
        balService.exchangeWiseList = GlobalServices.exchange_coins;
        balService.validExchangeList = GlobalServices.exchangeWithApiCreds;
        var exchangeNames = [];
        for (var i in balService.validExchangeList) {
            balService.exchangeNames.push({
                'name': balService.validExchangeList[i],
                'id': parseInt(i),
                'isChecked': false,
                'coinDetails': []
            });
        }
    }
    this.getCoinsOfExchangesWithApiCreds = function() {
        var tempCoins = [];
        for (var i in balService.validExchangeList) {
            for (var j in balService.exchangeWiseList) {
                if (balService.exchangeWiseList[j].exchange == balService.validExchangeList[i]) {
                    tempCoins = [];
                    GlobalServices.buildUniqueCoinsList(balService.exchangeWiseList[j].coins, tempCoins);
                    balService.credsAvailableExchanges.push({
                        'exchange': balService.exchangeWiseList[j].exchange,
                        'coins': tempCoins
                    });
                }
            }
        }
    console.log('BalanceService credsAvailableExchanges',
            balService.credsAvailableExchanges);
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
                    balService.exchangeNames[i].coinDetails.push({
                        "balance": data.balance,
                        "coin": req.base
                    });
                }
            }
            if (!data.hasOwnProperty('error')) {
                balService.getTotalOfCoins(req.base, data.balance);
            }
        }
        GlobalServices.makeRequest(request, callback);
    }
    this.initBalanceCall = function() {
        console.log('Initializing Balance Service......')
        initialize();
        this.getCoinsOfExchangesWithApiCreds();
        for (var i in this.credsAvailableExchanges) {
            for (var j in this.credsAvailableExchanges[i].coins) {
                this.getBalanceOfCoinForExchange(this.credsAvailableExchanges[i].exchange, this.credsAvailableExchanges[i].coins[j]);
            }
        }
    }
});