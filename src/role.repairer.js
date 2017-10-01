'using strict';

Creep.prototype.doRepair = function()
{
    if(!this.memory.repairing) { this.memory.repairing = false; }
    
    let oldTarget = Game.getObjectById(this.memory.target);
    if (!oldTarget || oldTarget.hits == oldTarget.hitsMax)
    { 
        let damagedStructures = this.room.find(FIND_STRUCTURES,
        {
            filter: (structure) => (structure.hits < structure.hitsMax)
        });
        
        let lowestHitStructure = _.min(damagedStructures, _.property('hits'));
        this.memory.target = lowestHitStructure.id;
    }
    
    if(this.memory.repairing && this.carry.energy == 0) {
        this.memory.repairing = false;
        this.say('🔄 harvest');
    }
    if(!this.memory.repairing && this.carry.energy == this.carryCapacity) {
        this.memory.repairing = true;
        this.say('⚡ repair');
        
        let damagedStructures = this.room.find(FIND_STRUCTURES,
        {
            filter: (structure) => (structure.hits < structure.hitsMax)
        });
        
        let lowestHitStructure = _.min(damagedStructures, _.property('hits'));
        this.memory.target = lowestHitStructure.id;
    }
    
    if(this.memory.repairing)
    {
        let target = Game.getObjectById(this.memory.target);
        
        if(target)
        {
            if(this.repair(target) == ERR_NOT_IN_RANGE)
            {
                this.travelTo(target);
            }
        }
    }
    else if (this.carry.energy < this.carryCapacity)
    {
        this.getEnergy();
    }
    else
    {
        let spawns = this.room.find(FIND_MY_SPAWNS);
        if(!this.pos.isNearTo(spawns[0]))
        {
            this.travelTo(spawns[0]);
        }
    }
};