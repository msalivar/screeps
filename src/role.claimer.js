'use strict';

Creep.prototype.doClaim = function()
{
    if(this.room.name == this.memory.target)
    {
        if(this.room.memory.spawn)
        {
            let spawn = Game.getObjectById(this.room.memory.spawn);
            if (spawn)
            {
                if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE)
                {
                    this.travelTo(spawn.pos);
                }
            }
            return;
        }
        
        if(this.room.controller.my)
        {
            this.memory.target = this.memory.homeRoom;
            return;
        }
        
        let ret = this.claimController(this.room.controller);
        if(ret == ERR_NOT_IN_RANGE)
        {
            this.travelTo(this.room.controller.pos);
        }
        else if(ret == ERR_INVALID_TARGET || ret == ERR_GCL_NOT_ENOUGH)
        {
            this.reserveController(this.room.controller);
        }
    }
    else
    {
        this.travelTo(new RoomPosition(25, 25, this.memory.target), {ignoreRoads: true});
    }
};