'use strict';

Room.prototype.run = function()
{
    this.init();
    this.doUpkeep();
    this.runEnergyCon();
    this.runDefCon();
    this.tryConstruct();
    this.cacheRoom();
    
    if (global.config.options.reportControllerUpgrade) { this.reportControllerUpgrade(); }
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
    else { this.memory.energyConMode = 0; }
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
    }
    
    // Check creep count memory
    if(!this.memory.creeps) { this.memory.creeps = {}; }
    if(!this.memory.creeps.miners) { this.memory.creeps.miners = 0; }
    if(!this.memory.creeps.harvesters) { this.memory.creeps.harvesters = 0; }
    if(!this.memory.creeps.haulers) { this.memory.creeps.haulers = 0; }
    if(!this.memory.creeps.builders) { this.memory.creeps.builders = 0; }
    if(!this.memory.creeps.repairers) { this.memory.creeps.repairers = 0; }
    if(!this.memory.creeps.upgraders) { this.memory.creeps.upgraders = 0; }
    if(!this.memory.creeps.suppliers) { this.memory.creeps.suppliers = 0; }
    if(!this.memory.creeps.bouncers) { this.memory.creeps.bouncers = 0; }
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
    this.getSourceRangeInfo();
    
    // Increment scout spawn timer
    if(this.controller.level >= 3)
    {
        if(!this.memory.scoutTick) { this.memory.scoutTick = 0; }
        if(this.memory.scoutTick < global.config.options.scoutTimer) { this.memory.scoutTick++; }
    }
    
    // Spawn creeps
    var spawns = this.find(FIND_MY_SPAWNS);
    for (let spawn of spawns)
    {
        spawn.doSpawn(this);
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
            console.log('Room ' + this.name + ' controller Upgrade - Rate: ' + rate + ' ETA: ' + progLeft / rate + ' ticks.');
        }
        this.memory.controlProg = progress;
    }
}

Room.prototype.getSourceRangeInfo = function()
{
    if(!this.memory.avgSourceRange || this.memory.avgSourceRange == null)
    {
        let range = 0;
        let spawn = Game.getObjectById(this.memory.spawn);
        var sources = this.find(FIND_SOURCES);
        
        for(let i = 0; i < sources.length; i++)
        {
            let sourcePos = { pos: sources[i].pos, range: 1 };
            let results = PathFinder.search(spawn.pos, sourcePos, { swampCost: 2});
            if(results.incomplete)
            {
                console.log('source range pathing error');
            }
            else
            {
                range += results.path.length;
            }
        }
        this.memory.avgSourceRange = range / sources.length;
    }
    
    if(!this.memory.avgSourceSeparation || this.memory.avgSourceSeparation == null)
    {
        let distance = 0;
        var sources = this.find(FIND_SOURCES);
        
        for(let i = 0; i < sources.length; i++)
        {
            let iPosition = new RoomPosition(sources[i].memory.harvestPos.x, sources[i].memory.harvestPos.y, this.name);
            let sourceDistance = 0;
            for(let j = 0; j < sources.length; j++)
            {
                if(j != i)
                {
                    let jPosition = new RoomPosition(sources[j].memory.harvestPos.x, sources[j].memory.harvestPos.y, this.name);
                    let sourcePos = { pos: jPosition, range: 1 };
                    let results = PathFinder.search(iPosition, sourcePos, { swampCost: 2});
                    if(results.incomplete)
                    {
                        console.log('source range pathing error');
                    }
                    else
                    {
                        sourceDistance += results.path.length;
                    }
                }
            }
            distance += sourceDistance / (sources.length - 1);
        }
        this.memory.avgSourceSeparation = distance / sources.length;
    }
}

Room.prototype.findRepairTarget = function()
{
    let damagedStructures = this.find(FIND_STRUCTURES,
    {
        filter: (structure) => (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD)
                            || (structure.hits < global.config.options.minWallHits && (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART))
                            || (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax * 0.6)
    });
    if(damagedStructures.length)
    {
        let lowestHitStructure = _.min(damagedStructures, _.property('hits'));
        return lowestHitStructure.id;
    }
    else
    {
        return undefined;
    }
};

Room.prototype.getNumDamagedWalls = function()
{
    let hitLimit = global.config.options.minWallHits;
    if(this.controller.level >= 8) { hitLimit = 300000000; }
    
    let damagedStructures = this.find(FIND_STRUCTURES,
    {
        filter: (structure) => (structure.hits < hitLimit && (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART))
    });
    return damagedStructures.length ? damagedStructures.length : 0;
}

Room.prototype.getNumRepairTargets = function()
{
    let damagedStructures = this.find(FIND_STRUCTURES,
    {
        filter: (structure) => (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD)
                            || (structure.hits < global.config.options.minWallHits && (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART))
                            || (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax * 0.6)
    });
    return damagedStructures.length ? damagedStructures.length : 0;
};



