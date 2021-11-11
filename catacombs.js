(function() {

    const DEBUG = true
    const MAPSIZE = 15
    const BIFUCATION_CHANCES = 6
    const GLASS_CHANCES = 25
    const RATS_CHANCES = 30
    const WET_FLOOR_CHANCES = 3
    let INPUT = ""
    let OUTPUT = ""
    let map
    let tileBuffer = undefined

    const tilesTypes = {
        PLAYER: "X",
        WALL: "-",
        FLOOR: " ",
        WET_FLOOR: "W",
        GLASS: "G",
        RATS: "R",
        EXIT: "E",
        FAKE_EXIT: "F"
    }

    const directions = {
        UP: {x:0, y:-1},
        DOWN: {x:0, y:+1},
        LEFT: {x:-1, y:0},
        RIGHT: {x:+1, y:0}
    }

    const events = {
        LAMP_BROKE: "Shit! My lamp broke... I have to find a way to get out of here.",
        CANNOT_MOVE_WALL : "I just bumped into a wall.",
        GLASS: "SHIT! I walked on glass, it hurts!",
        RAT_NOISE: "I heard some rats... Better be careful.",
        RAT_BITE: "One of the rats bit me!",
        STEP: "*step*",
        WET_STEP: "*Wet step*",
        DEATH: "You died a miserable death alone in a dark cave. (Press space to restart)",
        EXIT: "I found the exit! I'm out!",
        FAKE_EXIT: "There's a door! But it's locked..."
    }

    function drawMap(map) {
        // console.clear()
        for (line of map.t) {
            let printedLine = ""
            for (tile of line) {
                printedLine = printedLine.concat(tile ? ` ${tile} ` : ` ${tilesTypes.WALL} `)
            }
            console.log(printedLine);
        }
    }

    function randomlyOpenPath(map, startpoint, nextTile=Math.floor(Math.random() * 3), bifurcation=false) {
        let nextStartPoint
        if (map.exits >= 2) {
            return map
        }
        switch (nextTile) {
            case 0:
                nextStartPoint = {y: startpoint.y + directions.UP.y, x: startpoint.x + directions.UP.x}
                break
            case 1:
                nextStartPoint = {y: startpoint.y + directions.RIGHT.y, x: startpoint.x + directions.RIGHT.x}
                break
            case 2:
                nextStartPoint = {y: startpoint.y + directions.LEFT.y, x: startpoint.x + directions.LEFT.x}
                break
            case 3:
                nextStartPoint = bifurcation ? {y: startpoint.y + directions.DOWN.y, x: startpoint.x + directions.DOWN.x} : startpoint
                break
        }
        if (map.t[nextStartPoint.y] && map.t[nextStartPoint.y][nextStartPoint.x] == tilesTypes.PLAYER) {
            return map
        }
        if (nextStartPoint.y < MAPSIZE - 1 && nextStartPoint.y > 0 && nextStartPoint.x > 0 && nextStartPoint.x < (MAPSIZE - 1)) {

            if (Math.floor(Math.random() * GLASS_CHANCES) == 1) {
                map.t[nextStartPoint.y][nextStartPoint.x] = tilesTypes.GLASS
            } else if (Math.floor(Math.random() * RATS_CHANCES) == 1) {
                map.t[nextStartPoint.y][nextStartPoint.x] = tilesTypes.RATS
            } else if (Math.floor(Math.random() * WET_FLOOR_CHANCES) == 1) {
                map.t[nextStartPoint.y][nextStartPoint.x] = tilesTypes.WET_FLOOR
            } else {
                map.t[nextStartPoint.y][nextStartPoint.x] = tilesTypes.FLOOR
            }


            if (Math.floor(Math.random() * BIFUCATION_CHANCES) == 1) {
                //We create a bifurcation
                map = randomlyOpenPath(map, nextStartPoint, 3, true)
            }
            return randomlyOpenPath(map, nextStartPoint, Math.floor(Math.random() * 4))
        } else {
            if (nextStartPoint.y < 2 && map.t[nextStartPoint.y][nextStartPoint.x] != tilesTypes.EXIT) {
                if (map.exits && map.exits < 3) {
                    map.t[nextStartPoint.y][nextStartPoint.x] = (Math.random * 2) > 1 ? tilesTypes.EXIT : tilesTypes.FAKE_EXIT
                } else {
                    map.t[nextStartPoint.y][nextStartPoint.x] = tilesTypes.EXIT
                }
                map.exits = map.exits ? map.exits + 1 : 1
                return map
            } 
        }
        return map
    }

    function makePath(map, startpoint) {
        map = randomlyOpenPath(map, startpoint)
        while (!map.exits) {
            DEBUG ? console.warn('Map generation failed, no exit') : null
            map = randomlyOpenPath(map, startpoint)
        }
        return map
    }

    function generateMap() {
        DEBUG ? console.log('--- Generating new map---') : null
        //Map Initialization
        let tiles = new Array(MAPSIZE).fill().map(() => Array(MAPSIZE).fill(tilesTypes.WALL))
        let startpoint = [MAPSIZE-5 + Math.floor(Math.random() * 3), 1 + Math.floor((Math.random() * MAPSIZE - 1))]
        tiles[startpoint[0]][startpoint[1]] = tilesTypes.PLAYER
        tiles[startpoint[0]][startpoint[1] - 1] = tilesTypes.WALL
        tiles[startpoint[0]][startpoint[1] + 1] = tilesTypes.WALL
        tiles[startpoint[0]-1][startpoint[1] - 1] = tilesTypes.WALL
        tiles[startpoint[0]-1][startpoint[1] + 1] = tilesTypes.WALL
        tiles[startpoint[0]-1][startpoint[1]] = tilesTypes.FLOOR
        //Labyrinth Generation
        let map = makePath({t:tiles, player: {y: startpoint[0], x:startpoint[1]}}, {y: startpoint[0]-1, x: startpoint[1]})
        console.log(map)
        DEBUG ? console.log(startpoint) : null
        DEBUG ? drawMap(map) : null
        return map
    }

    function startGame() {
        map = generateMap()
        map.lives = 3
    }

    function handleInput() {
        function move(input) {
            switch (map.t[map.player.y + directions[input].y][map.player.x + directions[input].x]) {
            case tilesTypes.WALL:
                OUTPUT = events.CANNOT_MOVE_WALL
                break
            case tilesTypes.EXIT:
                OUTPUT = events.EXIT
                break
            case tilesTypes.FAKE_EXIT:
                OUTPUT = events.FAKE_EXIT
                break
            case tilesTypes.GLASS:
                OUTPUT = events.GLASS
                map.t[map.player.y][map.player.x] = tileBuffer ? tileBuffer : tilesTypes.FLOOR
                map.player.y += directions[input].y
                map.player.x += directions[input].x
                map.t[map.player.y][map.player.x] = tilesTypes.PLAYER
                tileBuffer = tilesTypes.GLASS
                map.lives -= 1
                break
            case tilesTypes.RATS:
                if (map.rats) {
                    map.lives -= 1
                    OUTPUT = events.RAT_BITE
                } else {
                    OUTPUT = events.RAT_NOISE
                }
                map.t[map.player.y][map.player.x] = tileBuffer ? tileBuffer : tilesTypes.FLOOR
                map.player.y += directions[input].y
                map.player.x += directions[input].x
                map.t[map.player.y][map.player.x] = tilesTypes.PLAYER
                tileBuffer = tilesTypes.RATS
                map.rats = 1
                break
            case tilesTypes.FLOOR:
                OUTPUT = events.STEP
                map.t[map.player.y][map.player.x] = tileBuffer ? tileBuffer : tilesTypes.FLOOR
                map.player.y += directions[input].y
                map.player.x += directions[input].x
                map.t[map.player.y][map.player.x] = tilesTypes.PLAYER
                tileBuffer = null
                break
            case tilesTypes.WET_FLOOR:
                OUTPUT = events.WET_STEP
                map.t[map.player.y][map.player.x] = tileBuffer ? tileBuffer : tilesTypes.FLOOR
                map.player.y += directions[input].y
                map.player.x += directions[input].x
                map.t[map.player.y][map.player.x] = tilesTypes.PLAYER
                tileBuffer = null
                break
            }
        }
        const handlers = {
            'UP': () => move(INPUT),
            'DOWN': () => move(INPUT),
            'LEFT': () => move(INPUT),
            'RIGHT': () => move(INPUT)
        }
        if (handlers[INPUT]) {
            handlers[INPUT]()
        } else {
            console.error('Invalid input', INPUT)
        }
        if (map.lives <= 0) {
            OUTPUT = events.DEATH
        }
        DEBUG ? drawMap(map) : null
    }

    function input(value) {
        INPUT = value
    }

    function output() {
        buffer = OUTPUT
        OUTPUT = ""
        return buffer
    }

    const catacombs = {startGame, input, output, handleInput, events}
    window.catacombs = catacombs

})();