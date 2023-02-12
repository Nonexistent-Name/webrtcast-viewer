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
            const key = event.key.toLowerCase().replaceAll('arrow', '');

            if (pressed[key] === undefined) pressed[key] = false;

            if (pressed[key]) return;

            pressed[key] = true;
            conn.send({ type: 'keydown', key: key });
        });

        addEventListener('keyup', event => {
            const key = event.key.toLowerCase().replaceAll('arrow', '');

            if (pressed[key] === undefined) pressed[key] = false;

            if (!pressed[key]) return;

            pressed[key] = false;
            conn.send({ type: 'keyup', key: key });
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
