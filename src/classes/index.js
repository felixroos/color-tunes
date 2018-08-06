import Band from './Band';

window.onload = function () {
    const context = new AudioContext();
    const band = new Band({ context });
    band.ready.then((s) => {
        console.log('band ready', s);
    });
    const button = document.getElementById('play');
    button.addEventListener('click', () => {
        band.ready.then(() => {
            band.compBars(['D-7', 'G7', 'C^7', 'C^7'], 4);
        });
    })
}
