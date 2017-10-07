'use strict';

global.config = 
{
    options:
    {
        reportControllerUpgrade: false,
        scoutTimer: 300,
        minWallHits: 1000000
    },
    
    creeps:
    {
        max: 0,
        roles:
        [
            'miner',
            'harvester',
            'hauler',
            'repairer',
            'builder',
            'upgrader',
            'scout',
            'supplier',
            'longDistanceHarvester',
            'longDistanceHauler'
        ]
    }
};