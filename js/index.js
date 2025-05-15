$(document).ready(function () {
    const $audio = $('#bg-music')[0];

    $('#activar-musica').on('click', function () {
        $audio.currentTime = 80; // Empieza en 1:20
        $audio.volume = 0;

        $audio.play().then(() => {
            $('#activar-musica').hide();
            $('#silenciar-musica').show();

            let vol = 0;
            const fadeIn = setInterval(() => {
                vol += 0.05;
                if (vol >= 1) {
                    $audio.volume = 1;
                    clearInterval(fadeIn);
                } else {
                    $audio.volume = vol;
                }
            }, 200);
        }).catch((err) => {
            console.error('Error al reproducir:', err);
        });
    });

    $('#silenciar-musica').on('click', function () {
        let vol = $audio.volume;
        const fadeOut = setInterval(() => {
            vol -= 0.05;
            if (vol <= 0) {
                $audio.volume = 0;
                $audio.pause();
                clearInterval(fadeOut);
                $('#silenciar-musica').hide();
                $('#activar-musica').show();
            } else {
                $audio.volume = vol;
            }
        }, 200);
    });

    // Loop manual desde el segundo 80 (1:20)
    $audio.addEventListener('ended', () => {
        $audio.currentTime = 80;
        $audio.play();
    });


    $('.arcade-btn').on('click', function(e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = $(this).attr('href');
    });


});