'using strict';

Creep.prototype.doSupply = function()
{
    if(this.memory.hauling && this.carry.energy == 0)
    {
        this.memory.hauling = false;
    }
    if(!this.memory.hauling && this.carry[RESOURCE_ENERGY] >= getMaximum(50, this.carryCapacity * 0.8))
    {
        this.memory.hauling = true;
    }
    
    if(this.memory.hauling)
    {
        if(this.room.memory.defConMode == 'active')
        {
            if (this.findTower(700)) { return; }
            if (this.findSpawnOrExtension()) { return; }
            return;
        }
        
        if (this.findTower(400)) { return; }
        if (this.findSpawnOrExtension()) { return; }
        if (this.room.memory.energyConMode >= 1)
        {
            if (this.findLink()) { return; }
        }
        if (this.findTower(850)) { return; }
        
        // Go home
        let spawns = this.room.find(FIND_MY_SPAWNS);
        if(!this.pos.isNearTo(spawns[0]))
        {
            this.travelTo(spawns[0]);
        }
    }
    else
    {
        this.withdrawFromStorage();
    }
};

Creep.prototype.withdrawFromStorage = function()
{
    if(this.room.memory.storage)
    {
        let storageStructure = Game.getObjectById(this.room.memory.storage);
        if(storageStructure)
        {
            if(storageStructure.store[RESOURCE_ENERGY] <= 500) { return false; }
            if(this.withdraw(storageStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(storageStructure);
            }
            return true;
        }
    }
    return false;
}

Creep.prototype.findSpawnOrExtension = function()
{
    let target = this.pos.findClosestByRange(FIND_MY_STRUCTURES,
    {
        filter: (structure) =>
        {
            return (structure.structureType == STRUCTURE_SPAWN || 
                    structure.structureType == STRUCTURE_EXTENSION) &&
                    structure.energy < structure.energyCapacity;
        }
    });
    if(target)
    {
        if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(target);
        }
        return true;
    }
    return false;
}

Creep.prototype.findTower = function(threshold)
{
    let tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES,
    {
        filter: (structure) =>
        {
            return (structure.structureType == STRUCTURE_TOWER) && 
                    structure.energy < threshold;
        }
    });
    if(tower)
    {
        if(this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(tower);
        }
        return true;
    }
    return false;
}

Creep.prototype.findLink = function(threshold)
{
    if (!this.room.memory.spawnLink) { return false; }
    let spawnLink = Game.getObjectById(this.room.memory.spawnLink);
    if (!spawnLink) { return false; }
    
    if (spawnLink.energy < spawnLink.energyCapacity)
    {
        if(this.transfer(spawnLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(spawnLink);
        }
        return true;
    }
    return false;
}



