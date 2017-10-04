'use strict';

require('require');

module.exports.loop = function ()
{
    cleanCreepMemory();
    
    // Process creeps
    for(let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        
        if(!creep.memory.homeRoom) { creep.memory.homeRoom = creep.pos.roomName; }
        
        if (creep.memory.role == 'harvester')                   { creep.doHarvest(); }
        else if (creep.memory.role == 'upgrader')               { creep.doUpgrade(); }
        else if (creep.memory.role == 'builder')                { creep.doBuild(); }
        else if (creep.memory.role == 'repairer')               { creep.doRepair(); }
        else if (creep.memory.role == 'hauler')                 { creep.doHaul(); }
        else if (creep.memory.role == 'miner')                  { creep.doMine(); }
        else if (creep.memory.role == 'supplier')               { creep.doSupply(); }
        else if (creep.memory.role == 'scout')                  { creep.doScout(); }
        else if (creep.memory.role == 'longDistanceMiner')      { creep.doLongDistanceMine(); }
        else if (creep.memory.role == 'longDistanceHarvester')  { creep.doLongDistanceHarvest(); }
        else if (creep.memory.role == 'longDistanceHauler')     { creep.doLongDistanceHaul(); }
        else if (creep.memory.role == 'claimer')                { creep.doClaim(); }
    }
    
    // Process rooms and their structures
    for(let name in Game.rooms)
    {
        var room = Game.rooms[name];
        var spawns = room.find(FIND_MY_SPAWNS);
        if(spawns.length)
        {
            room.run();
        }
        else
        {
            room.checkRoom();
        }
    }
};
