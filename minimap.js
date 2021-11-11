(function() {
    const SQUARE_SIZE = 10;
    let canvas, ctx
    let walls, fakeExits
    let startPoint, exit

    function init(shouldUpdate=true) {
        if (!catacombs.map) {
            return
        }
        walls = []
        fakeExits = []
        startPoint = {x: catacombs.map.player.x, y: catacombs.map.player.y}
        canvas = document.querySelector('#minimap')
        console.log(canvas)
        ctx = canvas.getContext('2d')
        if (shouldUpdate) {
            update()
        }
    }

    function update(key, output) {
        if (!canvas) {
            init(false)
        }
        canvas.width = SQUARE_SIZE * catacombs.map.MAPSIZE
        canvas.height = SQUARE_SIZE * catacombs.map.MAPSIZE
        ctx.fillStyle = '#292929'
        ctx.fillRect(0, 0, SQUARE_SIZE * catacombs.map.MAPSIZE, SQUARE_SIZE * catacombs.map.MAPSIZE)
        ctx.fillStyle = 'blue'
        ctx.fillRect(SQUARE_SIZE * startPoint.x, SQUARE_SIZE * startPoint.y, SQUARE_SIZE, SQUARE_SIZE)
        ctx.fillStyle = '#ff0059'
        ctx.fillRect(SQUARE_SIZE * catacombs.map.player.x, SQUARE_SIZE * catacombs.map.player.y, SQUARE_SIZE, SQUARE_SIZE)
        if (exit) {
            ctx.fillStyle = '#13ff00'
            ctx.fillRect(SQUARE_SIZE * exit.x, SQUARE_SIZE * exit.y, SQUARE_SIZE, SQUARE_SIZE)
        }
        switch(key) {
            case 'ArrowUp':
                if (output == catacombs.events.CANNOT_MOVE_WALL || output == catacombs.events.FAKE_EXIT) {
                    (output == catacombs.events.FAKE_EXIT ? fakeExits : walls).push({x:catacombs.map.player.x, y:catacombs.map.player.y-1})
                } else if (output == catacombs.events.EXIT) {
                    exit = {x:catacombs.map.player.x, y:catacombs.map.player.y-1}
                }
                break
            case 'ArrowLeft':
                if (output == catacombs.events.CANNOT_MOVE_WALL || output == catacombs.events.FAKE_EXIT) {
                    (output == catacombs.events.FAKE_EXIT ? fakeExits : walls).push({x:catacombs.map.player.x-1, y:catacombs.map.player.y})
                } else if (output == catacombs.events.EXIT) {
                    exit = {x:catacombs.map.player.x-1, y:catacombs.map.player.y}
                }
                break
            case 'ArrowRight':
                if (output == catacombs.events.CANNOT_MOVE_WALL || output == catacombs.events.FAKE_EXIT) {
                    (output == catacombs.events.FAKE_EXIT ? fakeExits : walls).push({x:catacombs.map.player.x+1, y:catacombs.map.player.y})
                } else if (output == catacombs.events.EXIT) {
                    exit = {x:catacombs.map.player.x+1, y:catacombs.map.player.y}
                }
                break
            case 'ArrowDown':
                if (output == catacombs.events.CANNOT_MOVE_WALL || output == catacombs.events.FAKE_EXIT) {
                    (output == catacombs.events.FAKE_EXIT ? fakeExits : walls).push({x:catacombs.map.player.x, y:catacombs.map.player.y+1})
                } else if (output == catacombs.events.EXIT) {
                    exit = {x:catacombs.map.player.x, y:catacombs.map.player.y+1}
                }
                break
        }
        for (wall of walls) {
            ctx.fillStyle = '#c7b597'
            ctx.fillRect(SQUARE_SIZE * wall.x, SQUARE_SIZE * wall.y, SQUARE_SIZE, SQUARE_SIZE)
        }
        for (fakeExit of fakeExits) {
            ctx.fillStyle = '#ffa600'
            ctx.fillRect(SQUARE_SIZE * fakeExit.x, SQUARE_SIZE * fakeExit.y, SQUARE_SIZE, SQUARE_SIZE)
        }
    }
    
    window.map = {init, update}
})();