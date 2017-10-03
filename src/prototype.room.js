'use strict';

Room.prototype.run = function()
{
    this.init();
    this.doUpkeep();
    this.runEnergyCon();
    this.runDefCon();
    //this.reportControllerUpgrade();
    this.tryConstruct();
    this.cacheRoom();
};

Room.prototype.runDefCon = function()
{
    let enemies = this.find(FIND_HOSTILE_CREEPS);
    if(!enemies.length)
    {
        this.memory.defConMode = 'inactive';
    }
    else if(enemies.length > 0)
    {
        this.memory.defConMode = 'active';
    }
};

Room.prototype.runEnergyCon = function()
{
    let storage = this.find(FIND_MY_STRUCTURES,
    {
        filter: (structure) => { return (structure.structureType == STRUCTURE_STORAGE) } 
    });
    if(storage[0])
    {
        let energyAmount = storage[0].store[RESOURCE_ENERGY];
        if(energyAmount >= 100000)
        {
            this.memory.energyConMode = 5;
        }
        else if(energyAmount >= 70000)
        {
            this.memory.energyConMode = 4;
        }
        else if(energyAmount >= 50000)
        {
            this.memory.energyConMode = 3;
        }
        else if(energyAmount >= 30000)
        {
            this.memory.energyConMode = 2;
        }
        else if(energyAmount >= 15000)
        {
            this.memory.energyConMode = 1;
        }
        else
        {
            this.memory.energyConMode = 0;
        }
    }
    if(!this.memory.energyConMode) { this.memory.energyConMode = 0; }
};

Room.prototype.init = function()
{
    if (!this.memory.spawn)
    {
        var spawns = this.find(FIND_MY_SPAWNS);
        if (spawns.length) { this.memory.spawn = spawns[0].id; }
    }
    
    if (!this.memory.sources)
    {
        this.memory.sources = [];
        var sources = this.find(FIND_SOURCES);
        for (let source of sources)
        {
            this.memory.sources.push(source.id);
            source.memory.harvester = 'none';
            source.memory.harvestPos = findConstructionSite(source, this.name);
        }
        //console.log('Room ' + room.name + ' has sources: ' + room.memory.sources + '.');
    }
}

Room.prototype.doUpkeep = function()
{
    var spawns = this.find(FIND_MY_SPAWNS);
    if (!spawns.length)
    {
        delete this.memory.spawn;
        return;
    }
    
    if(this.memory.hostile)           { delete this.memory.hostile; }
    if(this.memory.hostileControlled) { delete this.memory.hostileControlled; }
    if(this.memory.hostileStructures) { delete this.memory.hostileStructures; }
        
    this.findExitPositions();
    this.findExitRooms();
    
    if(!this.memory.avgSourceRange || this.memory.avgSourceRange == null)
    {
        let range = 0;
        let spawn = Game.getObjectById(this.memory.spawn);
        var sources = this.find(FIND_SOURCES);
        let sourceCount = sources.length;
        
        for(let i = 0; i < sourceCount; i++)
        {
            range += spawn.pos.getRangeTo(sources[i].pos);
        }
        
        this.memory.avgSourceRange = range / sourceCount;
    }
    
    // Spawn creeps
    var spawns = this.find(FIND_MY_SPAWNS);
    for (let spawn of spawns)
    {
        spawn.spawnCreep(this);
    }
    
    // Operate towers
    let towers = this.find(FIND_MY_STRUCTURES, 
    {
        filter: (structure) => (structure.structureType == STRUCTURE_TOWER)
    });
    for (let tower of towers)
    {
        if(tower)
        {
            tower.activate();
        }
    }
    
    // Operate links
    let spawnLink = Game.getObjectById(this.memory.spawnLink);
    if (spawnLink)
    {
        let controllerLink = Game.getObjectById(this.memory.controllerLink);
        if (controllerLink && (controllerLink.energy < controllerLink.energyCapacity * 0.3))
        {
            spawnLink.transferEnergy(controllerLink);
        }
    }
    
    // Check for missing harvesters
    var sources = this.find(FIND_SOURCES);
    for (var source of sources)
    {
        if (source.memory.harvester == "active")
        {
            if (source.memory.checkTick && source.memory.checkTick <= 0)
            {
                source.memory.harvester = "none";
            }
            else { source.memory.checkTick--; }
        }
    }
}

Room.prototype.reportControllerUpgrade = function()
{
    if(!this.memory.controlTick) { this.memory.controlTick = 0; }
    if(this.memory.controlTick < 500) { this.memory.controlTick++; }
    else
    {
        this.memory.controlTick = 0;
        let progress = this.controller.progress;
        if (!this.memory.controlProg) { this.memory.controlProg = progress; }
        else
        {
            let newDiff = progress - this.memory.controlProg;
            let rate = newDiff / 500;
            let progLeft = this.controller.progressTotal - this.controller.progress;
            console.log('Controller Upgrade - Rate: ' + rate + ' ETA: ' + progLeft / rate + ' ticks.');
        }
        this.memory.controlProg = progress;
    }
}

Room.prototype.findExitRooms = function()
{
    if(!this.memory.exitRooms)
    {
        this.memory.exitRooms = [];
        let rooms = Game.map.describeExits(this.name);
        for(var key in rooms)
        {
            this.memory.exitRooms.push(rooms[key]);
        }
    }
}





