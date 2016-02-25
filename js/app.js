'use strict';

var Instantdex = angular.module('InstandexApp', [
    'ui.router', 'ngAnimate', 'ngDialog'])
    .config(['$stateProvider', '$urlRouterProvider', '$provide', function($stateProvider, $urlRouterProvider, $provide){
        $provide.decorator('$window', function($delegate) {
            Object.defineProperty($delegate, 'history', {get: () => null});
            return $delegate;
        });

        $urlRouterProvider.otherwise('/coin_exchange');
        $stateProvider.state('consolidate_coins', {
            url: '/consolidate_coins',
            templateUrl: 'views/consolidate_coins.html'
        })
        .state('coin_exchange', {
            url: '/coin_exchange',
            templateUrl: 'views/coin_exchange.html'
        })
        .state('coin_exchange1by1', {
            url: '/coin_exchange1by1',
            templateUrl: 'views/coin_exchange1by1.html'
        })
        .state('exchange_overview', {
            url: '/exchange_overview',
            templateUrl: 'views/exchange_overview.html'
        })
        .state('options', {
            url: '/options',
            templateUrl: 'views/option.html'
        })
    }]);