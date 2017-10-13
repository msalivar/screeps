Creep.prototype.doLongDistanceBuild = function()
{
    if(this.checkRecycle()) { return; }
    
    if(this.room.name == this.memory.homeRoom)
    {
        if(this.carry[RESOURCE_ENERGY] >= this.carryCapacity)
        {
            this.travelTo(new RoomPosition(25, 25, this.memory.target));
            return;
        }
        else
        {
            this.getEnergy();
            return;
        }
    }
    else if(this.room.name == this.memory.target)
    {
        if(this.carry[RESOURCE_ENERGY] > 0)
        {
            let roomName = this.pos.roomName;
            let target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if(target)
            {
                if(this.build(target) == ERR_NOT_IN_RANGE)
                {
                    this.travelTo(target);
                    return;
                }
            }
            else
            {
                this.findSpawnOrExtension();
            }
        }
        else
        {
            this.moveHome();
            return;
        }
    }
    else
    {
        if(this.carry[RESOURCE_ENERGY] > 0)
        {
            this.travelTo(new RoomPosition(25, 25, this.memory.target));
            return;
        }
        else
        {
            this.moveHome();
            return;
        }
    }
};