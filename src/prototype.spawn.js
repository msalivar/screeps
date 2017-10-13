StructureSpawn.prototype.doSpawn = function(room)
{
    if (this.spawning) { return; }
    
    // Make basic miners if needed
    if (this.room.memory.creeps.harvesters < 1 && this.room.memory.creeps.miners < 2 && room.energyAvailable < 650)
    {
        let ret = this.createGeneric(250, 'miner');
        if(ret == OK)
        {
            //console.log('making miner, harv: ' + harvesters.length + ' miner: ' + miners.length + ' hauler: ' + haulers.length);
            this.room.memory.creeps.miners++;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY)  { console.log('Error spawning miner: ' + ret); }
        return;
    }
    
    // Make small hauler if needed
    if (this.room.memory.creeps.harvesters > 0 && this.room.memory.creeps.haulers < 1 && room.energyAvailable <= 300)
    {
        let ret = this.createHauler(300);
        if(ret == OK)
        {
            this.room.memory.creeps.haulers++;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning hauler: ' + ret); }
        return;
    }
    
    // Check for need of harvesters
    for(let id of this.room.memory.sources)
    {
        let source = Game.getObjectById(id);
        if(source.memory.harvester != 'active')
        {
            let ret = this.createHarvester(room.energyCapacityAvailable, source.id, source.memory.harvestPos);
            if(ret == OK)
            {
                this.room.memory.creeps.harvesters++;
                source.memory.harvester = 'active';
                source.memory.checkTick = 1700;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning harvester: ' + ret); }
            return;
        }
    }
    
    // Check haulers
    let haulersNeeded = getMaximum(1, Math.floor((room.memory.avgSourceRange + room.memory.avgSourceSeparation) / 9.5));
    if(room.memory.energyConMode < 2 && haulersNeeded > 1 && room.memory.sites && room.memory.sites.length >= 1)
    {
        haulersNeeded -= 1;
    }
    if(!room.storage && getContainerEnergy(room) >= 1800 * room.memory.sources.length) { haulersNeeded++; }
    if(room.memory.defConMode == 'active') { haulersNeeded++; }
    if(room.memory.creeps.haulers < haulersNeeded)
    {
        let ret = this.createHauler(getMaximum(getMinimum(room.energyCapacityAvailable * 0.5, 900), 150));
        if(ret == OK)
        {
            room.memory.creeps.haulers++;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning hauler: ' + ret); }
        return;
    }
    
    // Make supplier
    if(room.memory.storage && room.memory.energyConMode >= 1 && room.memory.creeps.suppliers < 1)
    {
        let storageStructure = Game.getObjectById(room.memory.storage);
        if(storageStructure)
        {
            let name = 'supplier-' + generateRandomId();
            let ret = this.createSupplier(getMaximum(room.energyCapacityAvailable * 0.4, 150));
            if(ret == OK)
            {
                room.memory.creeps.suppliers++;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning supplier: ' + ret); }
            return;
        }
    }
    
    // Check repairers
    let repairerRatio = 0.8;
    let repairerMax = 1;
    if(room.memory.energyConMode < 2 && getContainerEnergy(room) >= 2000 * room.memory.sources.length) { repairerMax += 2; }
    if(room.memory.energyConMode >= 3) { repairerMax += (room.memory.energyConMode - 2); }
    if(room.getNumDamagedWalls() < 2) { repairerMax = 1; repairerRatio = 0.3; }
    if (room.memory.creeps.repairers < repairerMax && room.getNumRepairTargets() >= 3)
    {
        let ret = this.createGeneric(getMaximum(200, getMinimum(room.energyCapacityAvailable * repairerRatio, 1800)), 'repairer');
        if(ret == OK)
        {
            room.memory.creeps.repairers++;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning repairer: ' + ret); }
        return;
    }
    
    if(room.memory.defConMode == 'active' && room.memory.creeps.bouncers < 1)
    {
        let ret = this.createBouncer(room.energyCapacityAvailable * 0.6, room.name);
        if(ret == OK)
        {
            room.memory.creeps.bouncers++;
            return;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning bouncer: ' + ret); }
    }
            
    //// If defcon is active, stop here ////
    if(room.memory.defConMode == 'active') { return; }
    
    // Check builders
    let sites = room.find(FIND_CONSTRUCTION_SITES);
    let maxBuilders = 1;
    if(room.controller.level < 4 && getContainerEnergy(room) >= 1800 * room.memory.sources.length) { maxBuilders += 2; }
    if(room.controller.level >= 2 && sites.length >= 5) { maxBuilders++; }
    if(sites.length >= 10 && room.memory.energyConMode >= 2) { maxBuilders++; }
    
    if(sites.length > 0 && room.memory.creeps.builders < maxBuilders)
    {
        let ret = this.createGeneric(getMinimum(room.energyCapacityAvailable * 0.75, 2000), 'builder');
        if(ret == OK)
        {
            room.memory.creeps.builders++;
        }
        else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning builder: ' + ret); }
        return;
    }
    
    // Check upgraders
    if(room.controller.level >= 5 && Game.getObjectById(room.memory.controllerLink) && Game.getObjectById(room.memory.spawnLink))
    {
        if(room.memory.creeps.upgraders < 1 || 
          (room.controller.level < 8 && room.memory.energyConMode >= 5 && room.memory.creeps.upgraders < 2))
        {
            let ret = this.createLinkUpgrader(room.energyCapacityAvailable);
            if(ret == OK)
            {
                room.memory.creeps.upgraders++;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning upgrader: ' + ret); }
            return;
        }
    }
    else 
    {
        let maxUpgraders;
        if (room.controller.level > 3)
        {
            maxUpgraders = 2;
            if(room.memory.energyConMode >= 1) { maxUpgraders++; }
            if(room.memory.energyConMode >= 2) { maxUpgraders++; }
        }
        else
        {
            maxUpgraders = 3 - this.room.memory.creeps.builders;
            if(getContainerEnergy(room) >= 2000 * room.memory.sources.length) { maxUpgraders += 5; }
        }
        
        if (this.room.memory.creeps.upgraders < maxUpgraders)
        {
            let ret = this.createGeneric(room.energyCapacityAvailable, 'upgrader');
            if(ret == OK)
            {
                this.room.memory.creeps.upgraders++;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning upgrader: ' + ret); }
            return;
        }
    }
    
    // Make scout
    if(room.controller.level >= 3)
    {
        if(room.memory.scoutTick >= global.config.options.scoutTimer)
        {
            let name = 'scout-' + generateRandomId();
            let ret = this.spawnCreep( [MOVE], name, { memory: {role: 'scout'} });
            if(ret == OK)
            {
                room.memory.scoutTick = 0;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning scout: ' + ret); }
            return;
        }
    }
    
    //Check neighbor rooms
    if(room.memory.storage && Game.getObjectById(room.memory.storage))
    {
        for(let name of this.room.memory.exitRooms)
        {
            if(!Memory.rooms[name].neighborData.hostile && (!Game.rooms[name] || !Game.rooms[name].controller || !Game.rooms[name].controller.my))
            {
                if(room.memory.energyConMode >= 2)
                {
                    // Spawn claimers
                    if(Memory.rooms[name].neighborData.claimer == 'none')
                    {
                        let needClaimer = true;
                        if(Game.rooms[name] && Game.rooms[name].controller && Game.rooms[name].controller.reservation && Game.rooms[name].controller.reservation.ticksToEnd > 3500) { needClaimer = false; }
                        if(needClaimer)
                        {
                            let ret = this.createClaimer(getMaximum(room.energyCapacityAvailable * 0.5, 1300), name, false);
                            if(ret == OK)
                            {
                                Memory.rooms[name].neighborData.claimer = 'active';
                            }
                            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning claimer: ' + ret); }
                            return;
                        }
                    }
                }
                // Spawn long distance crew
                if(this.tryCreateLongDistance(name)) { return; }
            }
            
            // Spawn bouncer
            if(Memory.rooms[name].neighborData.hostile && Memory.rooms[name].creeps.bouncers < 1)
            {
                let ret = this.createBouncer(room.energyCapacityAvailable * 0.4, name);
                if(ret == OK)
                {
                    Memory.rooms[name].creeps.bouncers++;
                    if(global.config.options.reportHostileNeighbors) { console.log('Spawned bouncer for room ' + name); }
                }
                else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning bouncer: ' + ret); }
                return;
            }
        }
    }
    
    if (room.tryColonize(this)) { return; }
};

StructureSpawn.prototype.tryCreateLongDistance = function(roomName)
{
    for(let source of Memory.rooms[roomName].sources)
    {
        if(!Memory.sources[source].longHarvester || Memory.sources[source].longHarvester == 'none')
        {
            let ret = this.createLongDistanceHarvester(getMaximum(getMinimum(this.room.energyCapacityAvailable, 1000), 400), source, Memory.sources[source].harvestPos);
            if(ret == OK)
            {
                Memory.sources[source].longHarvester = 'active';
                return true;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning longHarvester: ' + ret); }
        }
        if(!Memory.sources[source].longHauler || Memory.sources[source].longHauler == 'none')
        {
            let ret = this.createLongDistanceHauler(getMinimum(this.room.energyCapacityAvailable, 3000), source, Memory.sources[source].harvestPos);
            if(ret == OK)
            {
                Memory.sources[source].longHauler = 'active';
                return true;
            }
            else if(ret != ERR_NOT_ENOUGH_ENERGY) { console.log('Error spawning longHauler: ' + ret); }
        }
    }
    return false;
}

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
    
    let name = 'harvester-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'harvester' , target: targetSource, targetPos: harvestPos} });
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
    
    let name = 'hauler-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'hauler', hauling: false} });
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
    
    let name = roleName + '-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: roleName} });
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
    //if(this.room.memory.energyConMode >= 5) { workMax += 10; }
    if(this.room.controller.level >= 8 && workMax > 15) { workMax = 15; }
    while(totalEnergy <= energy - 300 && workCount < workMax)
    {
        mods.push(WORK);
        totalEnergy += 100;
        workCount++;
    }
    
    mods.push(CARRY);
    totalEnergy += 50;
    
    mods.push(MOVE);
    totalEnergy += 50;
    mods.push(MOVE);
    totalEnergy += 50;
    mods.push(MOVE);
    totalEnergy += 50;
    
    for (let i = 0; i < workCount / 2 - 3; i++)
    {
        if (totalEnergy < energy - 50)
        {
            mods.push(MOVE);
            totalEnergy += 50;
        }
    }
    
    let name = 'upgrader-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'upgrader', upgrading: false} });
};

StructureSpawn.prototype.createSupplier = function(energy)
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
    
    let name = 'supplier-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'supplier', hauling: false} });
};

StructureSpawn.prototype.createLongDistanceHarvester = function(energy, targetSource, harvestPos)
{
    let numberOfParts = getMinimum(Math.floor((energy - 250) / 150), 5);
    let mods = [];
    
    mods.push(MOVE);
    mods.push(MOVE);
    mods.push(CARRY);
    mods.push(WORK);
        
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(MOVE);
        mods.push(WORK);
    }
    
    let name = 'longHarvester-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'longDistanceHarvester' , target: targetSource, targetPos: harvestPos} });
};

StructureSpawn.prototype.createLongDistanceHauler = function(energy, targetSource, harvestPos)
{
    let numberOfParts = getMinimum(Math.floor(energy / 100), 25);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(CARRY);
        mods.push(MOVE);
    }
    
    // mods.push(WORK);
    // mods.push(MOVE);
    
    let name = 'longHauler-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'longDistanceHauler', hauling: false, target: targetSource, targetPos: harvestPos} });
};

StructureSpawn.prototype.createLongDistanceBuilder = function(energy, targetRoom)
{
    let numberOfParts = getMinimum(Math.floor(energy / 450), 8);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(WORK);
        mods.push(MOVE);
        mods.push(CARRY);
        mods.push(MOVE);
        mods.push(CARRY);
        mods.push(MOVE);
        mods.push(CARRY);
        mods.push(MOVE);
    }
    
    let name = 'longBuilder-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'longDistanceBuilder', target: targetRoom} });
};

StructureSpawn.prototype.createClaimer = function(energy, targetRoom, doColonize)
{
    let numberOfParts = getMinimum(Math.floor((energy - 1300) / 650), 5);
    let mods = [];
    
    mods.push(MOVE);
    mods.push(CLAIM);
    mods.push(MOVE);
    mods.push(CLAIM);
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(MOVE);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(CLAIM);
    }
    
    let name = 'claimer-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'claimer', target: targetRoom, colonize: doColonize} });
};

StructureSpawn.prototype.createBouncer = function(energy, targetRoom)
{
    let numberOfParts = getMinimum(Math.floor(energy / 250), 8);
    let mods = [];
    
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(TOUGH);
        mods.push(MOVE);
        mods.push(TOUGH);
        mods.push(MOVE);
    }
    for(let i = 0; i < numberOfParts; i++)
    {
        mods.push(ATTACK);
        mods.push(MOVE);
    }
    
    let name = 'bouncer-' + generateRandomId();
    return this.spawnCreep(mods, name, { memory: {role: 'bouncer', target: targetRoom} });
};



