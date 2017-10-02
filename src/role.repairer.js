'use strict';

Creep.prototype.doRepair = function()
{
    if(!this.memory.repairing) { this.memory.repairing = false; }
    
    if(this.memory.repairing && this.carry[RESOURCE_ENERGY] == 0)
    {
        this.memory.repairing = false;
        this.say('🔄 harvest');
    }
    if(!this.memory.repairing && this.carry[RESOURCE_ENERGY] == this.carryCapacity)
    {
        this.memory.repairing = true;
        this.say('⚡ repair');
        
        this.memory.target = this.getRepairTargetId();
    }
    
    if(this.memory.repairing)
    {
        let target = Game.getObjectById(this.memory.target);
        if (!target || target.hits == target.hitsMax)
        { 
            this.memory.target = this.getRepairTargetId();
        }
    
        if(this.repair(target) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(target);
        }
    }
    else if (this.carry[RESOURCE_ENERGY] < this.carryCapacity)
    {
        this.getEnergy();
    }
};

Creep.prototype.getRepairTargetId = function()
{
    let damagedStructures = this.room.find(FIND_STRUCTURES,
    {
        filter: (structure) => (structure.hits < structure.hitsMax) && (structure.hitsMax - structure.hits > 2000)
    });
    
    let lowestHitStructure = _.min(damagedStructures, _.property('hits'));
    return lowestHitStructure.id;
}


