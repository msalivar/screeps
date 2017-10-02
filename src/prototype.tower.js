'use strict';

StructureTower.prototype.activate = function()
{
    let closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile)
    {
        this.attack(closestHostile);
        return;
    }
    if (this.energy > this.energyCapacity * 0.4)
    {
        let lowStructures = this.room.find(FIND_STRUCTURES,
        {
            filter: (structure) => (structure.hits < structure.hitsMax && structure.hits <= 500)
        });
        if (lowStructures.length > 0)
        {
            let lowStructure = _.min(lowStructures, _.property('hits'));
            this.repair(lowStructure);
            return;
        }
    }
    // if (this.energy > this.energyCapacity * 0.6)
    // {
    //     if(this.room.memory.energyConMode >= 1)
    //     {
    //         let damagedStructures = this.room.find(FIND_STRUCTURES,
    //         {
    //             filter: (structure) => (structure.hits < this.room.memory.wallHitMax) && 
    //                 (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART)
    //         });
    //         if (damagedStructures.length > 0)
    //         {
    //             let lowestHitStructure = _.min(damagedStructures, _.property('hits'));
    //             this.repair(lowestHitStructure);
    //             return;
    //         }
    //     }
        
    //     let targets = this.room.find(FIND_STRUCTURES,
    //     {
    //         filter: (structure) => (structure.hits < structure.hitsMax - 1000) && 
    //             structure.structureType != STRUCTURE_WALL && 
    //             structure.structureType != STRUCTURE_RAMPART
    //     });
    //     if (targets.length > 0)
    //     {
    //         let lowestHitStructure = _.min(targets, _.property('hits'));
    //         this.repair(lowestHitStructure);
    //         return;
    //     }
    // }
};