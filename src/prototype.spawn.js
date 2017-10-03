'use strict';

StructureSpawn.prototype.spawnCreep = function(room)
{
    if (this.spawning) { return; }
    
    let harvesters = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'harvester'
    });
    let haulers = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'hauler'
    });
    let miners = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'miner'
    });
    
    // Make basic miners if needed
    if (harvesters.length < 1 && miners.length < 2 && room.energyAvailable < 650)
    {
        this.createGeneric(250, 'miner');
        //console.log('making miner, harv: ' + harvesters.length + ' miner: ' + miners.length + ' hauler: ' + haulers.length);
        return;
    }
    
    // Make small hauler if needed
    if (harvesters.length > 0 && haulers.length < 1 && room.energyAvailable <= 300)
    {
        this.createHauler(300);
        return;
    }
    
    // Check for need of harvesters
    var sources = room.find(FIND_SOURCES);
    for (var i in sources)
    {
        let source = sources[i];
        if (source.memory.harvester != 'active')
        {
            if (!(this.createHarvester(room.energyCapacityAvailable, source.id, source.memory.harvestPos) < 0))
            {
                source.memory.harvester = 'active';
                source.memory.checkTick = 1700;
            }
            return; 
        }
    }
    
    // Check haulers
    let haulersNeeded = room.memory.sources.length; // + Math.floor(room.memory.avgSourceRange / 12);
    if(room.memory.energyConMode < 2 && haulersNeeded > 1 && room.memory.sites && room.memory.sites.length >= 1)
    {
        haulersNeeded -= 1;
    }
    if(getContainerEnergy(room) >= 1400 * room.memory.sources.length) { haulersNeeded++; }
    if (haulers.length < haulersNeeded)
    {
        this.createHauler(getMaximum(getMinimum(room.energyCapacityAvailable * 0.6, 750), 250));
        return;
    }
    
    // Make supplier
    let suppliers = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'supplier'
    });
    if(room.memory.storage && suppliers.length < 1)
    {
        let storageStructure = Game.getObjectById(room.memory.storage);
        if(storageStructure)
        {
            this.createCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'supplier' , hauling: false});
        }
    }
    
    // If defcon is active, stop here
    if(room.memory.defConMode == 'active') { return; }
    
    // Check builders
    let builders = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'builder'
    });
    let sites = room.find(FIND_CONSTRUCTION_SITES);
    if ((builders.length < 1 && sites.length > 0)
            || (builders.length < 2 && sites.length >= 5)
            || (builders.length < 3 && sites.length >= 10 && room.memory.energyConMode >= 2))
    {
        this.createGeneric(getMaximum(room.energyCapacityAvailable * 0.3, 200), 'builder');
        return;
    }
    
    // Make repairers
    let repairers = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'repairer'
    });
    let damagedStructures = room.find(FIND_STRUCTURES,
    {
        filter: (structure) => (structure.structureType == STRUCTURE_RAMPART || 
            structure.structureType == STRUCTURE_WALL) && 
            (structure.hits < structure.hitsMax)
    });
    let repairerMax = 2;
    if(this.room.memory.energyConMode >= 3) { repairerMax += 1; }
    if (repairers.length < repairerMax && damagedStructures.length > 0)
    {
        console.log('repairer: ' + repairers.length);
        this.createGeneric(getMaximum(200, getMinimum(room.energyCapacityAvailable * 0.2, 1000)), 'repairer');
        return;
    }
    
    // Check upgraders
    let upgraders = room.find(FIND_MY_CREEPS,
    {
        filter: (creep) => creep.memory.role == 'upgrader'
    });
    if (room.controller.level >= 5 && Game.getObjectById(room.memory.controllerLink) && Game.getObjectById(room.memory.spawnLink))
    {
        if (upgraders.length < 1)// || (upgraders.length < 2 && room.memory.extraEnergy))
        {
            this.createLinkUpgrader(room.energyCapacityAvailable * 0.7);
            return;
        }
    }
    else if (room.controller.level >= 3)
    {
        if (upgraders.length < 4 || (upgraders.length < 5 && room.memory.energyConMode >= 2)) 
        {
            this.createGeneric(getMaximum(room.energyCapacityAvailable * 0.8, 200), 'upgrader');
            return;
        }
    }
    else
    {
        if (upgraders.length < 4 - builders.length) 
        {
            this.createGeneric(getMaximum(room.energyCapacityAvailable * 0.8, 200), 'upgrader');
            return;
        }
    }
    
    // Make scout
    if(room.controller.level >= 3)
    {
        if(!room.memory.scoutTick) { room.memory.scoutTick = 0; }
        if(room.memory.scoutTick < 300) { room.memory.scoutTick++; }
        else
        {
            room.memory.scoutTick = 0;
            let id = Math.floor(Math.random() * 1000);
            let name = 'scout-' + id.toString();
            if(!Game.creeps[name])
            {
                this.createCreep( [ MOVE ], name, { role: 'scout' });
                return;
            }
        }
    }
    
    //Make long distance miners
    if(room.memory.storage && Game.getObjectById(room.memory.storage))
    {
        for(let name of this.room.memory.exitRooms)
        {
            if(!Memory.rooms[name].hostile)
            {
                for(let source of Memory.rooms[name].sources)
                {
                    if(Memory.sources[source].harvester == 'none')
                    {
                        if(!(this.createLongDistanceMiner(getMaximum(room.energyCapacityAvailable * 0.4, 600), source, name) < 0))
                        {
                            Memory.sources[source].harvester = 'long';
                            return;
                        }
                    }
                }
            }
        }
    }
};

StructureSpawn.prototype.createHarvester = function(energy, targetSource, harvestPos)
{
    let totalEnergy = 0;
    let mods = [];
    
    while(totalEnergy < energy - 100 && totalEnergy < 500)
    {
        mods.push(WORK);
        totalEnergy += 100;
    }
    mods.push(MOVE);
    totalEnergy += 50;
    
    for (let i = 0; i < 2; i++)
    {
        if (totalEnergy < energy - 50)
        {
            mods.push(MOVE);
            totalEnergy += 50;
        }
    }
    
    return this.createCreep(mods, undefined, { role: 'harvester' , target: targetSource, targetPos: harvestPos});
};

StructureSpawn.prototype.createHauler = function(energy)
{
    let numberOfParts = getMinimum(Math.floor(energy / 150), 16);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(CARRY);
        mods.push(CARRY);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(MOVE);
    }
    
    return this.createCreep(mods, undefined, {role: 'hauler', hauling: false});
};

StructureSpawn.prototype.createGeneric = function(energy, roleName)
{
    let numberOfParts = getMinimum(Math.floor(energy / 200), 16);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(WORK);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(CARRY);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(MOVE);
    }
    
    return this.createCreep(mods, undefined, { role: roleName });
};

StructureSpawn.prototype.createLinkUpgrader = function(energy)
{
    let totalEnergy = 0;
    let mods = [];
    let workCount = 0;
    let workMax = 7;
    
    if(this.room.memory.energyConMode >= 2) { workMax += 3; }
    if(this.room.memory.energyConMode >= 3) { workMax += 5; }
    if(this.room.memory.energyConMode >= 4) { workMax += 5; }
    if(this.room.controller.level >= 8 && workMax > 15) { workMax = 15; }
    while(totalEnergy <= energy - 200 && workCount < workMax)
    {
        mods.push(WORK);
        totalEnergy += 100;
        workCount++;
    }
    
    mods.push(CARRY);
    totalEnergy += 50;
    
    mods.push(MOVE);
    totalEnergy += 50;
    
    for (let i = 0; i < workCount / 2 - 1; i++)
    {
        if (totalEnergy < energy - 50)
        {
            mods.push(MOVE);
            totalEnergy += 50;
        }
    }
    
    return this.createCreep(mods, undefined, { role: 'upgrader', upgrading: false });
};

StructureSpawn.prototype.createLongDistanceMiner = function(energy, targetSource, targetRoom)
{
    let numberOfParts = getMinimum(Math.floor(energy / 600), 16);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(WORK);
        mods.push(WORK);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(CARRY);
        mods.push(CARRY);
        mods.push(CARRY);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(MOVE);
        mods.push(MOVE);
        mods.push(MOVE);
        mods.push(MOVE);
        mods.push(MOVE);
    }
    
    return this.createCreep(mods, undefined, { role: 'longDistanceMiner', target: targetSource, destination: targetRoom });
};





