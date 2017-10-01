'use strict';

require('require');

module.exports.loop = function ()
{
    // Init stuff
    if(!Memory.myRooms)
    {
        Memory.myRooms = [];
    }
    
    // Cleanup memory
    for (let name in Memory.creeps)
    {
        if (!Game.creeps[name])
        {
            // If harvester died, mark its target source as unoccupied
            if(Memory.creeps[name].role == 'harvester')
            {
                Memory.sources[Memory.creeps[name].target].harvester = 'none';
            }
            else if(Memory.creeps[name].role == 'longDistance')
            {
                Memory.sources[Memory.creeps[name].target].harvester = 'none';
                console.log('Long distance miner expired - Transferred: ' + Memory.creeps[name].transferred + ' Target: ' + Memory.creeps[name].target);
            }
            delete Memory.creeps[name];
        }
    }
    
    // Process creeps
    for(let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        if (creep.memory.role == 'harvester')           { creep.doHarvest();        }
        else if (creep.memory.role == 'upgrader')       { creep.doUpgrade();        }
        else if (creep.memory.role == 'builder')        { creep.doBuild();          }
        else if (creep.memory.role == 'repairer')       { creep.doRepair();         }
        else if (creep.memory.role == 'hauler')         { creep.doHaul();           }
        else if (creep.memory.role == 'miner')          { creep.doMine();           }
        else if (creep.memory.role == 'supplier')       { creep.doSupply();         }
        else if (creep.memory.role == 'scout')          { creep.doScout();          }
        else if (creep.memory.role == 'longDistance')   { creep.doLongDistance();   }
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

