import Band from './Band';

const band = new Band();

const button = document.getElementById('play');
button.addEventListener('click', () => {
    console.log('');
    band.playTune(['D-7', 'G7', 'C^7', 'C^7']);
})