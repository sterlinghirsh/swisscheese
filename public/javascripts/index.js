var swisscheese = angular.module('swisscheese', []);

swisscheese.controller('swisscheeseController', function($scope) {
   $scope.players = [];
   $scope.maxTables = 8;
   $scope.minPerTable = 3;
   $scope.maxPerTable = 5;
   $scope.targetPerTable = 4;

   $scope.curRound = {
      tables: []
   }
   
   $scope.rounds = [$scope.curRound];

   $scope.addPlayer = function() {
      $scope.players.push({
         name: $scope.newPlayerName,
         score: 0,
         active: true,
         dateAdded: new Date()
      });
      $scope.newPlayerName = '';
   };

   $scope.editPlayer = function(player) {
      $scope.curEditPlayer = player;
   };

   $scope.generateCurRound = function() {
      $scope.curRound = {
        tables: []
      };
      var activePlayers = [];
      $scope.players.each(function(player) {
        if (player.active) {
          activePlayers.push(player);
        }
      });

      // Find table count.
      var minTableCount = Math.ceil(activePlayers.length / $scope.maxPerTable);
      if (minTableCount > $scope.maxTables) {
        alert(activePlayers.length + " players require " + minTableCount + " tables.");
        return;
      }
      
      var tableCount = Math.floor(activePlayers.length / $scope.targetPerTable);
      var unseatedPlayers = activePlayers.length % tableCount;

      if (tableCount > $scope.maxTables) {
        unseatedPlayers += (tableCount - $scope.maxTables) * $scope.targetPerTable;
        tableCount = $scope.maxTables;
      }

      var extraSpacePerTable = $scope.maxPerTable - $scope.targetPerTable;
      var extraPlayersPerTable = $scope.targetPerTable - $scope.minPerTable;
      var totalExtraSpace = tableCount * extraSpacePerTable;
      var totalExtraPlayers = tableCount * extraPlayersPerTable;
      // Small tables are always smaller than normalTableSize, down to smallTableSize.
      var smallTables = 0;
      // Big tables are always 1 larget than smallest.
      var bigTables = 0;
      var smallTableSize = $scope.targetPerTable;
      var normalTableSize = $scope.targetPerTable;
      var bigTableSize = $scope.targetPerTable + 1;
      // If we have 3 sizes of table, normal, small, smallest, we need this.

      if (unseatedPlayers != 0) {
        if (tableCount < $scope.maxTables) {
          if (unseatedPlayers >= $scope.minPerTable
           && unseatedPlayers <= $scope.maxPerTable) {
            // 19 players with 3-5 target 4 should give 4 tables of 4 and 1 of 3.
            // 23 players with 3-6 target 5 should give 4 tables of 5 and 1 of 3.
            // 22 players with 3-7 target 6 should give 3 tables of 6, 1 of 4.
            ++tableCount;
            smallTables = 1;
            smallTableSize = unseatedPlayers;
          } else if (unseatedPlayers < $scope.minPerTable
           && totalExtraPlayers + unseatedPlayers >= $scope.minPerTable) {
            // 18 players with 3-5 target 4 should give 3 tables of 4 and 2 of 3.
            // 17 players with 3-5 target 5 should give 2 tables of 4 and 3 of 3.
            // 22 players with 3-6 target 5 should give 3 tables of 5, 1 of 4, 1 of 3.
            // 21 players with 3-6 target 5 should give 3 tables of 5, 2 of 3.
            // 22 players with 4-6 target 5 should give 2 tables of 5 and 3 of 4.
            // 12 players with 4-6 target 5 should give 3 tables of 4.
            // 23 players with 4-6 target 5 should give 3 tables of 5 and 2 of 4.
            ++tableCount;
            // Find how many players the last game is missing.
            var missingPlayers = $scope.minPerTable - unseatedPlayers;
            // smallTables will be at least 2: 1 at the end and 1 we pulled players from.
            smallTables = 1 + Math.ceil(missingPlayers / extraPlayersPerTable);
            var smallTablePlayers = unseatedPlayers + (smallTables - 1) * normalTableSize;
            smallTableSize =
             Math.ceil((smallTablePlayers - $scope.minPerTable) / (smallTables - 1));
          } else if (unseatedPlayers < $scope.minPerTable
           && unseatedPlayers <= totalExtraSpace) {
            // 5 players with 3-5 target 4 should give 1 table of 5.
            // 11 players with 4-6 target 5 should give 1 table of 5 and 1 of 6. * TODO
            bigTables = unseatedPlayers % tableCount;
            normalTableSize = $scope.targetPerTable
             + Math.floor(unseatedPlayers / tableCount);
            bigTableSize = normalTableSize + 1;
          } else {
            alert("Can't find a way to split up players into more or bigger tables.");
            return;
          }
        } else {
          // No more tables, gotta just make big tables.
          if (unseatedPlayers <= totalExtraSpace) {
            // 10 players with 3-5 target 4 max 2 should give 2 tables of 5.
            // 12 players with 3-6 target 4 max 2 should give 2 tables of 6.
            bigTables = unseatedPlayers % tableCount;
            normalTableSize = $scope.targetPerTable
             + Math.floor(unseatedPlayers / tableCount);
            bigTableSize = normalTableSize + 1;
          } else {
            alert("Can't find a way to split up players into bigger tables.");
          }
        }
      }

      // Do the splits.
      // Sort players by score descending.
      // Players with low score will get odd-sized tables.
      // Handle weird-sized tables last.
      var curTable;
      var tablesLeft = tableCount;
      var startNextTable = true;
      var tableIsBig = false;
      var tableIsSmall = false;
      for (var i = 0; i < activePlayers.length; ++i) {
        if (startNextTable) {
          curTable = {
            num: 1 + tableCount - tablesLeft,
            players: [],
            big: tablesLeft <= bigTables,
            small: tablesLeft < smallTables
          };
          $scope.curRound.tables.push(curTable);
          startNextTable = false;
          --tablesLeft;
        }
        
        curTable.players.push(activePlayers[i]);
        
        if ((curTable.big && curTable.players.length === bigTableSize)
         || (curTable.small && curTable.players.length === smallTableSize)
         || (!curTable.big && !curTable.small && curTable.players.length === normalTableSize) {
          startNextTable = true;
        }
      }
   };
});
