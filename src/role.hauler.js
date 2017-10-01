'using strict';

Creep.prototype.doHaul = function()
{
    if (this.checkRecycle()) { return; }
    
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
            if (this.findTower(850)) { return; }
            if (this.findSpawnOrExtension()) { return; }
            if (this.findStorage()) { return; }
            return;
        }
        
        
        let suppliers = this.room.find(FIND_MY_CREEPS,
        {
            filter: (creep) => creep.memory.role == 'supplier'
        });
        if(!suppliers.length || !this.room.memory.storage || !Game.getObjectById(this.room.memory.storage))
        {
            if (this.findTower(400)) { return; }
            if (this.findSpawnOrExtension()) { return; }
            if (this.findLink()) { return; }
            if (this.findTower(850)) { return; }
        }
        
        if (this.findStorage()) { return; }
        
        // Go home
        let spawns = this.room.find(FIND_MY_SPAWNS);
        if(!this.pos.isNearTo(spawns[0]))
        {
            this.travelTo(spawns[0]);
        }
    }
    else
    {
        this.getEnergy();
    }
};

Creep.prototype.findStorage = function(threshold)
{
    let storage = this.pos.findClosestByRange(FIND_MY_STRUCTURES,
    {
      filter: (structure) =>
      {
          return (structure.structureType == STRUCTURE_STORAGE) && 
                  structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
      }
    });
    if(storage)
    {
        if(this.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(storage);
        }
        return true;
    }
    return false;
}

