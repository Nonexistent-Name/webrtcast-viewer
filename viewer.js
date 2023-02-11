const overlay = document.getElementById('overlay');
const streamDisplay = document.getElementById('stream');

const peer = new Peer();

peer.on('call', call => {
    call.answer();

    console.log('3/4 Stream established');

    call.on('stream', stream => {
        console.log('4/4 Stream recieved');

        overlay.style.display = 'none';
        streamDisplay.srcObject = stream;
        streamDisplay.style.display = 'unset';
    });

    call.on('close', () => {
        overlay.style.display = '';
        streamDisplay.srcObject = null;
    });
});

const connectBtn = document.getElementById('connectBtn');
const mouseBtns = ['left', 'middle', 'right'];

connectBtn.addEventListener('click', () => {
    const conn = peer.connect(peerInput.value);

    connectBtn.innerText = 'Connecting...';
    connectBtn.style.backgroundColor = 'white';
    connectBtn.style.color = 'black';
    connectBtn.disabled = true;
    console.log(`1/4 Connecting to ${peerInput.value}`);

    conn.on('open', () => {
        const pressed = {
            left: false,
            middle: false,
            right: false,
        };

        addEventListener('keydown', event => {
            if (pressed[event.key] === undefined) pressed[event.key] = false;

            if (pressed[event.key]) return;

            pressed[event.key] = true;
            conn.send({ type: 'keydown', key: event.key.toLowerCase() });
        });

        addEventListener('keyup', event => {
            if (pressed[event.key] === undefined) pressed[event.key] = false;

            if (!pressed[event.key]) return;

            pressed[event.key] = false;
            conn.send({ type: 'keyup', key: event.key.toLowerCase() });
        });

        addEventListener('mousedown', event => {
            const btn = mouseBtns[event.button];
            if (pressed[btn]) return;
            pressed[btn] = true;
            conn.send({ type: 'mousedown', button: btn });
        });

        addEventListener('mouseup', event => {
            const btn = mouseBtns[event.button];
            if (!pressed[btn]) return;
            pressed[btn] = false;
            conn.send({ type: 'mouseup', button: btn });
        });

        addEventListener('mousemove', event => {
            conn.send({
                type: 'mousepos',
                x: event.pageX / document.body.clientWidth,
                y: event.pageY / document.body.clientHeight,
            });
        });

        addEventListener('contextmenu', event => event.preventDefault());

        console.log('2/4 Connection established');
    });

    conn.on('close', () => {
        console.log('Connection closed');
    });

    conn.on('error', err => {
        console.error(err);
    });
});

const peerInput = document.getElementById('peerInput');

peerInput.addEventListener('blur', () => {
    if (peerInput.style.display !== 'none') peerInput.focus();
});

peerInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') connectBtn.click();
});

addEventListener('click', () => {
    if (document.fullscreenElement || !streamDisplay.srcObject) return;

    try {
        document.body.requestFullscreen();
    } catch (err) {
        console.error(`Fullscreen request failed: ${err}`);
    }
});
