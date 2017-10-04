'use strict';

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
        if (this.room.controller.level >= 3 && checkIfBuildable(position))
        {
            this.room.createConstructionSite(position, STRUCTURE_CONTAINER);
        }
    }
};