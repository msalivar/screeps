'use strict';

global.config = 
{
    options:
    {
        reportControllerUpgrade: false,
        scoutTimer: 300
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