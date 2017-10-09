'use strict';

Creep.prototype.run = function()
{
    try
    {
        switch(this.memory.role)
        {
            case 'harvester':
                this.doHarvest();
                break;
            case 'upgrader':
                this.doUpgrade();
                break;
            case 'builder':
                this.doBuild();
                break;
            case 'repairer':
                this.doRepair();
                break;
            case 'hauler':
                this.doHaul();
                break;
            case 'miner':
                this.doMine();
                break;
            case 'supplier':
                this.doSupply();
                break;
            case 'scout':
                this.doScout();
                break;
            case 'longDistanceHarvester':
                this.doLongDistanceHarvest();
                break;
            case 'longDistanceHauler':
                this.doLongDistanceHaul();
                break;
            case 'claimer':
                this.doClaim();
                break;
            case 'bouncer':
                this.doBounce();
                break;
            default:
                console.log('ERROR: Creep ' + this.name + ' does not have a role.');
                break;
        }
    }
    catch(ex)
    {
        console.log('Creep action error - Role: ' + this.memory.role + ' Exception: ' + ex.toString());
    }
};

Creep.prototype.getEnergy = function()
{
    if (this.memory.role == 'hauler' || this.memory.role == 'supplier' ||this.room.memory.energyConMode < 2)
    {
        let source = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES,
        {
            filter: (resource) => { return resource.resourceType == RESOURCE_ENERGY && (resource.amount >= getMinimum(this.carryCapacity / 2, 50)) && resource.room.name == this.room.name }
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
            if (source && this.pos.getRangeTo(source.pos) <= 15)
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
            limit = this.carryCapacity * 0.3;
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

Creep.prototype.moveHome = function()
{
    if(this.memory.homeRoom)
    {
        let pos = new RoomPosition(25, 25, this.memory.homeRoom);
        this.travelTo(pos);
        return true;
    }
    return false;
}

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

Creep.prototype.withdrawFromStorage = function()
{
    if(this.room.memory.storage)
    {
        let storageStructure = Game.getObjectById(this.room.memory.storage);
        if(storageStructure)
        {
            if(storageStructure.store[RESOURCE_ENERGY] <= 500) { return false; }
            this.travelTo(storageStructure);
            this.withdraw(storageStructure, RESOURCE_ENERGY);
            return true;
        }
    }
    return false;
}

Creep.prototype.checkRecycle = function()
{
    if (this.ticksToLive <= 80)
    {
        if(this.room.name != this.memory.homeRoom) { this.moveHome(); return true; }
    
        let spawn = Game.getObjectById(this.room.memory.spawn);
        if (spawn)
        {
            if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(spawn.pos, { ignoreCreeps: false });
            }
        }
        return true;
    }
    return false;
}

Creep.prototype.moveRandom = function()
{
    let num = Math.floor(Math.random() * 8);
    this.move(num);
}



