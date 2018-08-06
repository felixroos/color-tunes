import Band from './Band';


const button = document.getElementById('play');
const band = new Band();
band.ready.then((s) => {
    console.log('band ready', s);
});
button.addEventListener('click', () => {
    band.resume(); // https://goo.gl/7K7WLu
    band.ready.then(() => {
        band.compBars(['D-7', 'G7', 'C^7', 'C^7'], 4);
    });

})