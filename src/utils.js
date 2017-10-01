'using strict';

getContainerEnergy = function(room)
{
    if(!room.memory.sources) { return; }
    let energyTotal = 0;
    for(let id of room.memory.sources)
    {
        let source = Game.getObjectById(id);
        let position = new RoomPosition(source.memory.harvestPos.x, source.memory.harvestPos.y, source.memory.harvestPos.roomName);
        let structures = room.lookForAt(LOOK_STRUCTURES, position);
        for(let i in structures)
        {
            if(structures[i].structureType == STRUCTURE_CONTAINER) { energyTotal += structures[i].store[RESOURCE_ENERGY]; }
        }
    }
    return energyTotal;
}

checkSpaceToHarvest = function(source)
{
    let array = [
    { x: -1,  y: -1 },
    { x: -1,  y:  1 },
    { x:  1,  y: -1 },
    { x:  1,  y:  1 },
    { x:  1,  y:  0 },
    { x: -1,  y:  0 },
    { x:  0,  y:  1 },
    { x:  0,  y: -1 }
    ];
    
    for(let i = 0; i < array.length; i++)
    {
        let position = new RoomPosition(source.pos.x + array[i].x, 
                                        source.pos.y + array[i].y, 
                                        source.room.name);
                                        
        let terrain = position.lookFor(LOOK_TERRAIN);
        let creeps = position.lookFor(LOOK_CREEPS);
        
        if ((terrain[0] == 'plain' || terrain[0] == 'swamp') && creeps.length <= 0)
        {
            return true;
        }
    }
};

// creep = creep object, target = RoomPosition
onPosition = function(creep, target)
{
    return (creep.pos.x == target.x &&
            creep.pos.y == target.y &&
            creep.pos.roomName == target.roomName);
};

findConstructionSite = function(source, roomName)
{
    let array = [
        { x: -1,  y: -1 },
        { x: -1,  y:  1 },
        { x:  1,  y: -1 },
        { x:  1,  y:  1 },
        { x:  1,  y:  0 },
        { x: -1,  y:  0 },
        { x:  0,  y:  1 },
        { x:  0,  y: -1 }
        ];
        
    for(let i = 0; i < array.length; i++)
    {
        let position = new RoomPosition(source.pos.x + array[i].x,
                                        source.pos.y + array[i].y,
                                        roomName);
                                        
        let terrain = position.lookFor(LOOK_TERRAIN);
        let structures = position.lookFor(LOOK_STRUCTURES);
        if ((terrain[0] != 'wall') && (structures.length <= 0 || structures[0].structureType == 'road'))
        {
            //console.log('found ' + position + ' for building');
            return new RoomPosition(source.pos.x + array[i].x, source.pos.y + array[i].y, roomName);
        }
    }
    
    return undefined;
};

findBuildableSpace = function(source, roomName)
{
    let array = [
        { x: -1,  y: -1 },
        { x: -1,  y:  1 },
        { x:  1,  y: -1 },
        { x:  1,  y:  1 },
        { x:  1,  y:  0 },
        { x: -1,  y:  0 },
        { x:  0,  y:  1 },
        { x:  0,  y: -1 }
        ];
        
    for(let i = 0; i < array.length; i++)
    {
        let position = new RoomPosition(source.pos.x + array[i].x,
                                        source.pos.y + array[i].y,
                                        roomName);
                                        
        let terrain = position.lookFor(LOOK_TERRAIN);
        if (terrain[0] != 'wall')
        {
            return new RoomPosition(source.pos.x + array[i].x, source.pos.y + array[i].y, roomName);
        }
    }
    
    return undefined;
}

getMinimum = function(x, y)
{
    if (x < y) { return x; }
    else { return y; }
};

getMaximum = function(x, y)
{
    if (x > y) { return x; }
    else { return y; }
};

checkIfBuildable = function(roomPos)
{                           
    let terrain = roomPos.lookFor(LOOK_TERRAIN);
    let structures = roomPos.lookFor(LOOK_STRUCTURES);
    //console.log('terrain: ' + terrain[0] + 'structures: ' + structures.length);
    return (terrain[0] != 'wall') && (structures.length <= 0 || (structures.length == 1 && structures[0].structureType == 'road'));
}










