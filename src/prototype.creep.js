'use strict';

Creep.prototype.getEnergy = function()
{
    if (this.memory.role == 'hauler' || this.room.memory.energyConMode < 2)
    {
        let source = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES,
        {
            filter: (resource) => { return resource.resourceType == RESOURCE_ENERGY && (resource.amount >= getMinimum(this.carryCapacity / 2, 100)) && resource.room.name == this.room.name }
        });
        if (this.room.controller.level < 4)
        {
            if (source)
            {
                if(this.pickup(source) == ERR_NOT_IN_RANGE)
                {
                    this.travelTo(source, { ignoreCreeps: false });
                }
                return true;
            }
        }
        else
        {
            if (source && this.pos.getRangeTo(source.pos) <= 3)
            {
                if(this.pickup(source) == ERR_NOT_IN_RANGE)
                {
                    this.travelTo(source, { ignoreCreeps: false });
                }
                return true;
            }
        }
        
        let limit = getMinimum(this.carryCapacity, 100);
        if (this.memory.role == 'hauler')
        {
            //if (this.room.memory.extraEnergy) { limit = this.carryCapacity * 0.85; }
            limit = this.carryCapacity * 0.75;
        }
        let container = this.pos.findClosestByRange(FIND_STRUCTURES,
        {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER) && 
            (structure.store[RESOURCE_ENERGY] >= limit) && structure.room.name == this.room.name } 
        });
        if (container)
        {
            if(this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(container, { ignoreCreeps: false });
            }
            return true;
        }
    }
    
    return this.withdrawFromStorage();
};

Creep.prototype.findSource = function()
{
    let sources = this.room.find(FIND_SOURCES);
    for (let i in sources)
    {
        let source = sources[i];
        if(checkSpaceToHarvest(source))
        {
            return source.id;
        }
    }
    return 'error';
};

Creep.prototype.checkRecycle = function()
{
    if (this.ticksToLive <= 60)
    {
        let spawn = Game.getObjectById(this.room.memory.spawn);
        if (spawn)
        {
            if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(spawn.pos, { ignoreCreeps: false });
            }
            return true;
        }
    }
    return false;
}

Creep.prototype.moveRandom = function()
{
    let num = Math.floor(Math.random() * 8);
    this.move(num);
}



