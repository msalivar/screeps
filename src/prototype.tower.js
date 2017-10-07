'use strict';

StructureTower.prototype.activate = function()
{
    let closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile)
    {
        this.attack(closestHostile);
        return;
    }
    
    let lowCreeps = this.room.find(FIND_MY_CREEPS,
    {
       filter: (creep) => (creep.hits < creep.hitsMax) 
    });
    if(lowCreeps.length > 0)
    {
        this.heal(lowCreeps[0]);
        return;
    }
        
    if (this.energy > this.energyCapacity * 0.6)
    {
        let lowStructures = this.room.find(FIND_STRUCTURES,
        {
            filter: (structure) => (structure.hits < structure.hitsMax && structure.hits <= 1000)
        });
        if (lowStructures.length > 0)
        {
            let lowStructure = _.min(lowStructures, _.property('hits'));
            this.repair(lowStructure);
            return;
        }
        
        // lowStructures = this.room.find(FIND_MY_STRUCTURES,
        // {
        //     filter: (structure) => (structure.hits < structure.hitsMax 
        //                             && structure.structureType != STRUCTURE_RAMPART
        //                             && structure.structureType != STRUCTURE_CONTAINER)
        // });
        // if (lowStructures.length > 0)
        // {
        //     let lowStructure = _.min(lowStructures, _.property('hits'));
        //     this.repair(lowStructure);
        //     return;
        // }
    }
};