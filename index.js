(function() {
    let music = true
    let effects = true
    let minimap = false
    let difficulty = 0

    const audio = {music: new Audio('sound/catacombs.mp3'), player: new Audio(), play: (soundURL) => {
        audio.player.src = soundURL
        audio.player.load()
        audio.player.play()
    }}
    audio.player.volume = 0.3

    let gameOutputDiv

    function playEffect(effect) {
        console.log('effect is', effect)
        function playStep(wet=false) {
            let rand = 1 + Math.floor(Math.random() * 5)
            audio.play(`sound/effects/steps/${wet ? 'wet-' : ''}footsteps-${rand}.mp3`)
        }
        switch (effect) {
            case catacombs.events.STEP:
                playStep()
                break
            case catacombs.events.WET_STEP:
                playStep(true)
                break
            case catacombs.events.GLASS:
                audio.play(`sound/effects/glass.mp3`)
                break
            case catacombs.events.CANNOT_MOVE_WALL:
                audio.play(`sound/effects/bump.mp3`)
                break
            case catacombs.events.EXIT:
                audio.play('sound/effects/door-open.mp3')
                break
            case catacombs.events.FAKE_EXIT:
                audio.play('sound/effects/door-closed.mp3')
                break
            case catacombs.events.RAT_NOISE:
            case catacombs.events.RAT_BITE:
                audio.play(`sound/effects/rats/rats-${1 + Math.floor(Math.random() * 5)}.mp3`)
                break
        }
    }

    function handleKeyboard(key) {
        let output = null
        switch (key) {
            case 'ArrowUp':
                catacombs.input('UP')
                catacombs.handleInput()
                break
            case 'ArrowDown':
                catacombs.input('DOWN')
                catacombs.handleInput()
                break
            case 'ArrowLeft':
                catacombs.input('LEFT')
                catacombs.handleInput()
                break
            case 'ArrowRight':
                catacombs.input('RIGHT')
                catacombs.handleInput()
                break
            case ' ':
                catacombs.startGame()
                audio.music.play()
                audio.play('sound/effects/lamp-break.mp3')
                output = catacombs.events.LAMP_BROKE
                map.init()
                break
            default:
                return
        }
        output = output ? output : catacombs.output()
        gameOutputDiv.className = ""
        gameOutputDiv.innerHTML = output
        setTimeout(() => gameOutputDiv.className = 'appearing', 500)
        playEffect(output)
        map.update(key, output)
    }
    window.onload = () => {
        gameOutputDiv = document.querySelector("#game-output")
        gameOutputDiv.innerHTML = 'Loading sound files...'
        audio.music.load()
        audio.music.loop = true;
        gameOutputDiv.innerHTML = 'Press space (or touch this text) to start playing'
        document.addEventListener('keydown', (event) => handleKeyboard(event.key)) 
    }

    window.musicControl = () => {
        const musicControlP = document.querySelector('#music-control')
        music = !music
        musicControlP.innerHTML = 'Music : ' + (music ? 'On' : 'Off')
        if (!music) {
            audio.music.pause()
            audio.music.volume = 0
        } else {
            audio.music.play()
            audio.music.volume = 1
        }
    }

    window.effectsControl = () => {
        const musicControlP = document.querySelector('#effects-control')
        effects = !effects
        musicControlP.innerHTML = 'Effects : ' + (effects ? 'On' : 'Off')
        if (!effects) {
            audio.player.pause()
            audio.player.volume = 0
        } else {
            audio.player.play()
            audio.player.volume = 1
        }
    }

    window.touchControls = () => {
        const touchControlsP = document.querySelector('#touch-controls-control')
        const touchControls = document.querySelector('#touch-controls')
        if (touchControls.style.display != 'none') {
            touchControlsP.innerHTML = 'Show touch controls'
            touchControls.style.display = 'none'
        } else {
            touchControlsP.innerHTML = 'Hide touch controls'
            touchControls.style.display = ''
        }
    }

    window.minimapControl = () => {
        const minimapControlP = document.querySelector('#minimap-control')
        const minimapCanvas = document.querySelector('#minimap')
        minimap = !minimap
        if (minimapCanvas.style.display == 'none') {
            minimapCanvas.style.display = ''
            minimapControlP.innerHTML = 'Minimap : Off'
        } else {
            minimapCanvas.style.display = 'none'
            minimapControlP.innerHTML = 'Minimap : On'
        }
    }

    window.difficultyControl = () => {
        const difficultyControlP = document.querySelector('#difficulty-control')
        const difficulties = ['BEGINNER', 'ADVENTURER', 'HARDCORE', 'CHALLENGER']

        if (difficulty < 3) {
            difficulty += 1
        } else {
            difficulty = 0
        }
        difficultyControlP.innerHTML = 'Difficulty : '+difficulties[difficulty]
        catacombs.updateMapSize(15*(difficulty+1))
        catacombs.startGame()
    }

    window.handleKeyboard = handleKeyboard

})();