'use strict';

Creep.prototype.doLongDistanceMine = function()
{
    if(!this.memory.homeRoom) { this.memory.homeRoom = this.room.name; }
    if(!this.memory.transferred) { this.memory.transferred = 0; }
    
    if(this.room.name == this.memory.destination)
    {
        if(this.carry[RESOURCE_ENERGY] == this.carryCapacity)
        {
            this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom));
        }
        else
        {
            let source = Game.getObjectById(this.memory.target);
            if(this.harvest(source) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(source, {ignoreRoads: true});
            }
        }
    }
    else
    {
        if(this.carry[RESOURCE_ENERGY] > 0)
        {
            let storage = Game.getObjectById(this.room.memory.storage);
            if(storage)
            {
                // use harvest pos
                this.travelTo(storage);
                if(this.transfer(storage, RESOURCE_ENERGY) == OK)
                {
                    this.memory.transferred = this.memory.transferred + this.carryCapacity;
                }
            }
        }
        else
        {
            this.travelTo(new RoomPosition(25, 25, this.memory.destination), {ignoreRoads: true});
        }
    }
};

Creep.prototype.doLongDistanceHarvest = function()
{
    
};

Creep.prototype.doLongDistanceHaul = function()
{
    
};



