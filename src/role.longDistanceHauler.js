Creep.prototype.doLongDistanceHaul = function()
{
    if(!this.memory.transferred) { this.memory.transferred = 0; }
    if(this.checkRecycle()) { return; }
    
    let harvestPos = new RoomPosition(this.memory.targetPos.x, this.memory.targetPos.y, this.memory.targetPos.roomName);
    if(this.room.name == this.memory.targetPos.roomName)
    {
        if(this.carry[RESOURCE_ENERGY] >= this.carryCapacity)
        {
            this.moveHome();
        }
        else
        {
            if(this.pos.isNearTo(harvestPos))
            {
                let resource;
                let results = this.room.lookForAt(LOOK_ENERGY, harvestPos);
                if(results.length)
                {
                    resource = _.filter(results, function(r) { return r.resourceType == RESOURCE_ENERGY });
                    if(resource[0].amount > 50)
                    {
                        this.pickup(resource[0]);
                        return;
                    }
                }
                
                let container;
                results = this.room.lookForAt(LOOK_STRUCTURES, harvestPos);
                if(results.length)
                {
                    container = _.filter(results, function(c) { return c.structureType == STRUCTURE_CONTAINER });
                    if(container[0].store[RESOURCE_ENERGY] > 0)
                    {
                        this.withdraw(container[0], RESOURCE_ENERGY);
                        return;
                    }
                }
                
            }
            else { this.travelTo(harvestPos); }
        }
    }
    else
    {
        if(this.carry[RESOURCE_ENERGY] > 0)
        {
            if(this.room.storage)
            {
                this.travelTo(this.room.storage);
                if(this.transfer(this.room.storage, RESOURCE_ENERGY) == OK)
                {
                    this.memory.transferred = this.memory.transferred + this.carry[RESOURCE_ENERGY];
                }
            }
        }
        else
        {
            this.travelTo(harvestPos);
        }
    }
};

// Creep.prototype.doLongDistanceMine = function()
// {
//     if(!this.memory.transferred) { this.memory.transferred = 0; }
    
//     if(this.room.name == this.memory.destination)
//     {
//         if(this.carry[RESOURCE_ENERGY] == this.carryCapacity)
//         {
//             this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom));
//         }
//         else
//         {
//             let source = Game.getObjectById(this.memory.target);
//             if(this.harvest(source) == ERR_NOT_IN_RANGE)
//             {
//                 this.travelTo(source, {ignoreRoads: true});
//             }
//         }
//     }
//     else
//     {
//         if(this.carry[RESOURCE_ENERGY] > 0)
//         {
//             let storage = Game.getObjectById(this.room.memory.storage);
//             if(storage)
//             {
//                 // use harvest pos
//                 this.travelTo(storage);
//                 if(this.transfer(storage, RESOURCE_ENERGY) == OK)
//                 {
//                     this.memory.transferred = this.memory.transferred + this.carryCapacity;
//                 }
//             }
//         }
//         else
//         {
//             this.travelTo(new RoomPosition(25, 25, this.memory.destination), {ignoreRoads: true});
//         }
//     }
// };