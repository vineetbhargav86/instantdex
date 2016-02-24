'use strict';

Instantdex.service('GlobalServices', function($http, $q){
    this.getCoinTypes = function(){
        var cointypes = [
            {"key":"CoinA", "value":"CoinA"},
            {"key":"CoinB", "value":"CoinB"},
            {"key":"CoinC", "value":"CoinC"},
        ];
        return cointypes;
    }
});