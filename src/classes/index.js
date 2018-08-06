import Band from './Band';

const band = new Band();

const button = document.getElementById('play');
console.log('button', button);
button.addEventListener('click', () => {
    console.log('play..');
    band.playTune(['D-7', 'G7', 'C^7', 'C^7'].map(c => [c]), 4);
})