'using strict';

Creep.prototype.doHarvest = function()
{
    let target = Game.getObjectById(this.memory.target);
    let position = new RoomPosition(target.memory.harvestPos.x, target.memory.harvestPos.y, target.memory.harvestPos.roomName);
    if (!onPosition(this, position))
    {
        this.moveTo(position);
    }
    else
    {
        this.harvest(target);
        if (checkIfBuildable(position))
        {
            this.room.createConstructionSite(position, STRUCTURE_CONTAINER);
        }
        // else
        // {
        //     let sites = position.lookFor(LOOK_CONSTRUCTION_SITES);
        //     for(let site in sites)
        //     {
        //         let ret = this.build(site);
        //         //console.log(ret);
        //     }
        //     let structures = position.lookFor(LOOK_STRUCTURES);
        //     for(let structure in structures)
        //     {
        //         let ret = this.repair(structure);
        //         //console.log(ret);
        //     }
        // }
    }
    
    // if (this.ticksToLive == 10)
    // {
    //     let source = Game.getObjectById(this.memory.target);
    //     source.memory.harvester = 'none';
    // }
};