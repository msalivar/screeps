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
        creep.run();
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
