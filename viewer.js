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

connectBtn.addEventListener('click', () => {
    const conn = peer.connect(peerInput.value);

    connectBtn.innerText = 'Connecting...';
    connectBtn.style.backgroundColor = 'white';
    connectBtn.style.color = 'black';
    connectBtn.disabled = true;
    console.log(`1/4 Connecting to ${peerInput.value}`);

    conn.on('open', () => {
        const keyEvent = event => {
            conn.send({
                type: 'key',
                key: event.key.toLowerCase(),
                state: event.type,
            });
        };

        addEventListener('keydown', keyEvent);
        addEventListener('keyup', keyEvent);

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

const keyEvent = event => {
    connections.forEach(conn => {
        conn.send({
            type: 'key',
            key: event.key.toLowerCase(),
            state: event.type,
        });
    });
};

document.body.addEventListener('click', () => {
    if (document.fullscreenElement || !streamDisplay.srcObject) return;

    try {
        document.body.requestFullscreen();
    } catch (err) {
        console.error(`Fullscreen request failed: ${err}`);
    }
});
