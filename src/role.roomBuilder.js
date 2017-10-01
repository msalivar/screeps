'use strict';

Room.prototype.tryConstruct = function()
{
    if(!this.memory.constructTick) { this.memory.constructTick = 0; }
    if(!this.memory.extensionTick) { this.memory.extensionTick = 0; }
    if(!this.memory.wallTick) { this.memory.wallTick = 0; }
    
    if(this.memory.constructTick < 50) { this.memory.constructTick++; }
    else
    {
        this.memory.constructTick = 0;
        this.createStructures();
    }
    
    if(this.memory.wallTick < 150) { this.memory.wallTick++; }
    else
    {
        if (this.controller.level >= 3)
        {
            this.memory.wallTick = 0;
            this.createWalls();
        }
    }
    
    if(this.memory.extensionTick < 150) { this.memory.extensionTick++; }
    else
    {
        this.memory.extensionTick = 0;
        this.initRoads();
        this.createExtensions();
    }
    
    // Adjust wall hit limit
    if(!this.memory.wallHitMax)
    {
        this.memory.wallHitMax = 15000;
        this.memory.wallHitTick = 0;
    }
    if(this.memory.wallHitTick < 50) { this.memory.wallHitTick++; }
    else
    {
        if(this.memory.energyConMode >= 2)
        {
            this.memory.wallHitMax = getMinimum(this.memory.wallHitMax + 300, 300000)
        }
        else
        {
            this.memory.wallHitMax = getMaximum(this.memory.wallHitMax - 500, 15000);
        }
        this.memory.wallHitTick = 0;
    }
}

Room.prototype.createHarvestContainers = function()
{
    var sources = this.find(FIND_SOURCES);
    for (let source of sources)
    {
        if (source.memory.harvestPos)
        {
            this.createConstructionSite(source.memory.harvestPos.x, source.memory.harvestPos.y, STRUCTURE_CONTAINER);
        }
    }
}

Room.prototype.initRoads = function()
{
    let spawn = Game.getObjectById(this.memory.spawn);
    if(spawn)
    {
        this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y - 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y + 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y - 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y + 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x,     spawn.pos.y - 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x,     spawn.pos.y - 3, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x,     spawn.pos.y + 1, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y,     STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y,     STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x,     spawn.pos.y + 2, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y + 2, STRUCTURE_ROAD);
        this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y + 2, STRUCTURE_ROAD);
        
        let sources = _.map(this.find(FIND_SOURCES), function(source)
        {
            return { pos: source.memory.harvestPos, range: 0 };
        });
        
        let controllerObj = { pos: this.controller.pos, range: 1 };
        
        for(let i in sources)
        {
            // Sources to spawn
            let results = PathFinder.search(spawn.pos, sources[i], { swampCost: 2});
            if(!results.incomplete)
            {
                for(let i in results.path)
                {
                    this.createConstructionSite(results.path[i], STRUCTURE_ROAD);
                }
            }
            
            // Sources to controller
            results = PathFinder.search(sources[i].pos, controllerObj, { swampCost: 2});
            if(!results.incomplete)
            {
                for(let i in results.path)
                {
                    this.createConstructionSite(results.path[i], STRUCTURE_ROAD);
                }
            }
        }
        
        // Spawn to controller
        let results = PathFinder.search(spawn.pos, controllerObj, { swampCost: 2});
        if(!results.incomplete)
        {
            for(let i in results.path)
            {
                this.createConstructionSite(results.path[i], STRUCTURE_ROAD);
            }
        }
    }
};

Room.prototype.createStructures = function()
{
        
    let spawn = Game.getObjectById(this.memory.spawn);
    if (!spawn) { return; }
    if (this.controller.level >= 2)
    {
        //this.createHarvestContainers();
    }
    if (this.controller.level >= 3)
    {
        this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y - 1, STRUCTURE_TOWER);
    }
    if (this.controller.level >= 4)
    {
        this.createConstructionSite(spawn.pos.x, spawn.pos.y - 2, STRUCTURE_STORAGE);
    }
    if (this.controller.level >= 5)
    {
        this.createConstructionSite(spawn.pos.x, spawn.pos.y + 3, STRUCTURE_TOWER);
        this.createLinks();
    }
    if (this.controller.level >= 6)
    {
        
    }
    if (this.controller.level >= 7)
    {
        this.createConstructionSite(spawn.pos.x, spawn.pos.y - 4, STRUCTURE_TOWER);
    }
    if (this.controller.level >= 8)
    {
        // this.createConstructionSite(spawn.pos.x - 2, spawn.pos.y + 2, STRUCTURE_TOWER);
        // this.createConstructionSite(spawn.pos.x + 3, spawn.pos.y - 2, STRUCTURE_TOWER);
        // this.createConstructionSite(spawn.pos.x - 3, spawn.pos.y + 2, STRUCTURE_TOWER);
    }
};

Room.prototype.createLinks = function()
{
    let spawn = Game.getObjectById(this.memory.spawn);
    if (!this.memory.spawnLink || !Game.getObjectById(this.memory.spawnLink))
    {
        if(!this.memory.sLinkPos && this.createConstructionSite(spawn.pos.x, spawn.pos.y + 1, STRUCTURE_LINK) == OK)
        {
            this.memory.sLinkPos = { x: spawn.pos.x, y: spawn.pos.y + 1, roomName: this.name };
            console.log('new site id: ' + this.memory.sLinkPos.x + ', ' + this.memory.sLinkPos.y);
        }
        if(this.memory.sLinkPos)
        {
            let structures = this.lookForAt(LOOK_STRUCTURES, 
                new RoomPosition(this.memory.sLinkPos.x, this.memory.sLinkPos.y, this.memory.sLinkPos.roomName));
            for(let link of structures)
            {
                if (link.structureType == STRUCTURE_LINK)
                {
                    this.memory.spawnLink = link.id;
                    console.log('new link id: ' + link.id);
                }
            }
        }
    }
    
    if (!this.memory.controllerLink || !Game.getObjectById(this.memory.controllerLink))
    {
        let constructPos = findConstructionSite(this.controller, this.name);
        if (!this.memory.cLinkPos && this.createConstructionSite(constructPos, STRUCTURE_LINK) == OK)
        {
            this.memory.cLinkPos = { x: constructPos.x, y: constructPos.y, roomName: this.name };
            console.log('new site id: ' + this.memory.cLinkPos.x + ', ' + this.memory.cLinkPos.y);
        }
        if(this.memory.cLinkPos)
        {
            let structures = this.lookForAt(LOOK_STRUCTURES, 
                new RoomPosition(this.memory.cLinkPos.x, this.memory.cLinkPos.y, this.memory.cLinkPos.roomName));
            for(let link of structures)
            {
                if (link.structureType == STRUCTURE_LINK)
                {
                    this.memory.controllerLink = link.id;
                    console.log('new link id: ' + link.id);
                }
            }
        }
    }
}

Room.prototype.createExtensions = function()
{
    let rowLength = 6;
    let countMax = 4;
    
    // Defines where the rows start - measured for row length 6
    let array = [
        { x:  2,  y:  0 },
        { x: -7,  y:  0 },
        { x:  2,  y: -2 },
        { x: -7,  y: -2 },
        { x:  2,  y:  2 },
        { x: -7,  y:  2 },
        { x:  2,  y: -4 },
        { x: -7,  y: -4 },
        { x:  2,  y:  4 },
        { x: -7,  y:  4 },
        { x:  2,  y: -6 },
        { x: -7,  y: -6 },
        { x:  2,  y:  6 },
        { x: -7,  y:  6 }
        ];
    
    let spawn = Game.getObjectById(this.memory.spawn);
    if (!spawn) { return; }
    
    let spawnPos = new RoomPosition(spawn.pos.x, spawn.pos.y, spawn.room.name);
    let count = 0;
    
    // Loops through rows of extensions
    for(let i = 0; i < array.length; i++)
    {
        for(let j = 0; j < rowLength; j++)
        {
            let position = new RoomPosition(spawnPos.x + array[i].x + j, spawnPos.y + array[i].y, spawn.room.name);
            if(checkIfBuildable(position))
            {
                //console.log('[i]: ' + i + ' [j]: ' + j + ' [building ext]: ' + position);
                if (this.createConstructionSite(position, STRUCTURE_EXTENSION) == OK)
                {
                    this.createConstructionSite(new RoomPosition(position.x, position.y - 1, spawn.room.name), STRUCTURE_ROAD);
                    this.createConstructionSite(new RoomPosition(position.x, position.y + 1, spawn.room.name), STRUCTURE_ROAD);
                    if (j == rowLength - 1) { this.createConstructionSite(new RoomPosition(position.x + 1, position.y, spawn.room.name), STRUCTURE_ROAD); }
                    else if (j == 0) { this.createConstructionSite(new RoomPosition(position.x - 1, position.y, spawn.room.name), STRUCTURE_ROAD); }
                }
                if (++count >= countMax) { return; }
            }
        }
    }
}

Room.prototype.createWalls = function()
{
    let maxCount = 40;
    
    let count = 0;
    let nearEnd = true;
    let leftExits = this.memory.leftExits;
    for(let i = 0; i < leftExits.length; i++)
    {
        let buildRampart = false;
        if(i % 2 == 0) { buildRampart = true; }
        let newPos = leftExits[i];
        if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 0, buildRampart)) { count++; }
        if(nearEnd)
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 1, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, -1, false)) { count++; }
            nearEnd = false;
        }
        if (!nearEnd && 
            ((i != leftExits.length - 1 && (leftExits[i+1].y - leftExits[i].y != 1 || leftExits[i+1].y - leftExits[i].y != -1)) || i == leftExits.length - 1)
            )
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 1, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 1, false)) { count++; }
            nearEnd = true;
        }
        if (count >= maxCount) { return; }
    }
    
    nearEnd = true;
    let rightExits = this.memory.rightExits;
    for(let i = 0; i < rightExits.length; i++)
    {
        let buildRampart = false;
        if(i % 2 == 0) { buildRampart = true; }
        let newPos = rightExits[i];
        if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 0, buildRampart)) { count++; }
        if(nearEnd)
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -1, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, -1, false)) { count++; }
            nearEnd = false;
        }
        if (!nearEnd && 
            ((i != rightExits.length - 1 && (rightExits[i+1].y - rightExits[i].y != 1 || rightExits[i+1].y - rightExits[i].y != -1)) || i == rightExits.length - 1)
            )
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -1, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 1, false)) { count++; }
            nearEnd = true;
        }
        if (count >= maxCount) { return; }
    }
    
    nearEnd = true;
    let topExits = this.memory.topExits;
    for(let i = 0; i < topExits.length; i++)
    {
        let buildRampart = false;
        if(i % 2 == 0) { buildRampart = true; }
        let newPos = topExits[i];
        if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, 2, buildRampart)) { count++; }
        if(nearEnd)
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 0, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 1, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -1, 2, false)) { count++; }
            nearEnd = false;
        }
        if (!nearEnd && 
            ((i != topExits.length - 1 && (topExits[i+1].x - topExits[i].x != 1 || topExits[i+1].x - topExits[i].x != -1)) || i == topExits.length - 1)
            )
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 0, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 1, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 1, 2, false)) { count++; }
            nearEnd = true;
        }
        if (count >= maxCount) { return; }
    }
    
    nearEnd = true;
    let botExits = this.memory.botExits;
    for(let i = 0; i < botExits.length; i++)
    {
        let buildRampart = false;
        if(i % 2 == 0) { buildRampart = true; }
        let newPos = botExits[i];
        if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 0, -2, buildRampart)) { count++; }
        if(nearEnd)
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, 0, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, -1, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -2, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), -1, -2, false)) { count++; }
            nearEnd = false;
        }
        if (!nearEnd && 
            ((i != botExits.length - 1 && (botExits[i+1].x - botExits[i].x != 1 || botExits[i+1].x - botExits[i].x != -1)) || i == botExits.length - 1)
            )
        {
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, 0, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, -1, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 2, -2, false)) { count++; }
            if(this.buildWall(new RoomPosition(newPos.x, newPos.y, this.name), 1, -2, false)) { count++; }
            nearEnd = true;
        }
        if (count >= maxCount) { return; }
    }
}

// RoomPosition, x offset, y offset
Room.prototype.buildWall = function(pos, x, y, rampart)
{
    let newPos = pos;
    newPos.x += x;
    newPos.y += y;
    if (checkIfBuildable(newPos))
    {
        if(rampart)
        {
            if (this.createConstructionSite(newPos, STRUCTURE_RAMPART) == OK)
            {
                console.log('rampart: ' + pos + x + y);
                return true;
            }
        }
        else
        {
            if (this.createConstructionSite(newPos, STRUCTURE_WALL) == OK)
            {
                console.log('wall: ' + pos + x + y);
                return true;
            }
        }
    }
    return false;
}






