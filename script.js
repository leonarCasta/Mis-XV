/* ==========================================================================
   MIS XV AÑOS · MARÍA GUADALUPE
   Lógica de la pre-invitación
   --------------------------------------------------------------------------
   TODO LO EDITABLE ESTÁ EN EL OBJETO "CONFIG".
   Cambia aquí nombres, fecha, horarios, direcciones, teléfono y canción.
   No necesitas tocar el HTML para actualizar los datos.
   ========================================================================== */

'use strict';

const CONFIG = {
    quinceanera: {
        // Nombre completo y sus partes (se usan en el hero y en los títulos)
        name: 'María Guadalupe Pizaña Ramírez',
        firstName: 'María Guadalupe',
        lastName: 'Pizaña Ramírez',

        padres: {
            padre: 'Pedro Antonio Pizaña Tarango',
            madre: 'Margarita Ramírez Montes'
        },

        // Fecha y hora de inicio de la cuenta regresiva.
        // 28 de noviembre de 2026, 00:00 en Chihuahua (UTC-6).
        // Si cambias la fecha, conserva el formato ISO con su zona horaria.
        dateISO: '2026-11-28T00:00:00-06:00',
        timeZone: 'America/Chihuahua',

        ciudad: 'Chihuahua, México'
    },

    evento: {
        // Horarios visibles. Cuando los confirmen, escribe por ejemplo "19:00 hrs".
        ceremonyTime: '18:00 hrs',
        receptionTime: '21:00 hrs',

        ceremonia: {
            nombre: 'Parroquia Jesús Misericordioso',
            direccion: 'Calle Rosaura Zapata, Col. Lázaro Cárdenas, Chihuahua, Chih.',
            // Si dejas mapUrl vacío, se genera automáticamente con el nombre y la dirección.
            mapUrl: ''
        },

        recepcion: {
            nombre: 'Salón Mariana Bonita',
            direccion: 'Calle Sierra Pedernales 10600, Col. Sierra Azul, Chihuahua, Chih.',
            mapUrl: ''
        }
    },

    musica: {
        src: 'assets/hey-lover.mp3',
        volume: 0.55,
        title: 'Hey Lover — The Daughters of Eve'
    },

    calendario: {
        filename: 'xv-maria-guadalupe.ics',
        // El evento se guarda como "todo el día" porque la hora aún está por confirmar.
        // Cuando tengas horario, puedes agregar startISO/endISO y ajustar buildICS().
        recordatorioDiasAntes: 1
    }
};

/* ==========================================================================
   UTILIDADES GENERALES
   ========================================================================== */

const $ = (id) => document.getElementById(id);

const setText = (id, value) => {
    const el = $(id);
    if (el && value != null) el.textContent = value;
};

const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Envuelve una función para que un fallo no detenga el resto de la página.
 * Así, si falta el audio o una imagen, todo lo demás sigue funcionando.
 */
const safe = (label, fn) => {
    try {
        fn();
    } catch (error) {
        console.warn(`[XV] No se pudo iniciar: ${label}`, error);
    }
};

/* ==========================================================================
   FECHAS
   ========================================================================== */

const DATE_FORMATTER = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: CONFIG.quinceanera.timeZone
});

const NUMERIC_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CONFIG.quinceanera.timeZone
});

const getDateLabels = () => {
    const date = new Date(CONFIG.quinceanera.dateISO);

    if (Number.isNaN(date.getTime())) {
        return {
            weekday: 'Sábado',
            longDate: '28 de noviembre de 2026',
            shortDate: '28 · 11 · 2026',
            day: '28',
            month: '11',
            year: '2026'
        };
    }

    const parts = DATE_FORMATTER.formatToParts(date);
    const values = {};
    parts.forEach((part) => {
        if (part.type !== 'literal') values[part.type] = part.value;
    });

    const numericParts = NUMERIC_DATE_FORMATTER.formatToParts(date);
    const numeric = {};
    numericParts.forEach((part) => {
        if (part.type !== 'literal') numeric[part.type] = part.value;
    });

    const weekday = capitalize(values.weekday || 'sábado');
    const day = values.day || numeric.day;
    const month = values.month || '';
    const year = values.year || numeric.year;
    const monthNumber = numeric.month || '11';

    return {
        weekday,
        longDate: `${weekday} ${day} de ${month} de ${year}`,
        shortDate: `${day} · ${monthNumber} · ${year}`,
        day,
        month: monthNumber,
        year
    };
};

/* ==========================================================================
   HIDRATACIÓN DEL CONTENIDO DESDE CONFIG
   ========================================================================== */

const hydrateContent = () => {
    const q = CONFIG.quinceanera;
    const labels = getDateLabels();
    const city = q.ciudad;

    // Nombres
    setText('welcome-name', q.firstName);
    setText('hero-name-first', q.firstName);
    setText('hero-name-last', q.lastName);
    setText('quince-title', q.firstName);
    setText('footer-name', q.firstName);

    // Fechas
    setText('welcome-date', `${labels.weekday} · ${labels.shortDate}`);
    setText('hero-weekday', labels.weekday);
    setText('hero-date-main', labels.shortDate);
    setText('hero-date-sub', city);
    setText('message-date', labels.longDate);
    setText('message-city', city);
    setText('countdown-date', labels.longDate);
    setText('footer-date', `${labels.shortDate} · ${city}`);

    // Padres
    setText('father-name', q.padres.padre);
    setText('mother-name', q.padres.madre);

    // Datos de los lugares
    const places = [
        { prefix: 'ceremony', data: CONFIG.evento.ceremonia, time: CONFIG.evento.ceremonyTime },
        { prefix: 'reception', data: CONFIG.evento.recepcion, time: CONFIG.evento.receptionTime }
    ];

    places.forEach(({ prefix, data, time }) => {
        setText(`${prefix}-name`, data.nombre);
        setText(`${prefix}-address`, data.direccion);
        setText(`${prefix}-time`, time);

        const timeWrap = $(`${prefix}-time-wrap`);
        if (timeWrap) {
            const pending = /confirmar|definir|pendiente|tbd/i.test(String(time));
            timeWrap.classList.toggle('is-pending', pending);
        }

        const mapLink = $(`${prefix}-map`);
        if (mapLink) {
            mapLink.href = data.mapUrl || buildMapUrl(data);
            mapLink.setAttribute(
                'aria-label',
                `Ver en Google Maps: ${data.nombre}`
            );
        }
    });

    // Título de la pestaña
    document.title = `Mis XV Años · ${q.firstName} · Save the Date`;

    // Canción especial
    setText('song-title', CONFIG.musica.title);
};

const buildMapUrl = (place) => {
    const query = [place.nombre, place.direccion].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

/* ==========================================================================
   PORTADA DE APERTURA + MÚSICA
   ========================================================================== */

let introOpened = false;
let musicUnavailable = false;

const setupIntroAndMusic = () => {
    const welcome = $('welcome');
    const openButton = $('open-invite');
    const silentButton = $('open-silent');
    const hero = document.querySelector('.hero');
    const heroHeading = $('hero-name');
    const musicToggle = $('music-toggle');
    const audio = $('bg-music');

    if (!welcome || !openButton) return;

    // Configurar audio desde CONFIG. No se descarga hasta que la persona
    // toca el sello (así ahorramos datos móviles).
    if (audio) {
        audio.src = CONFIG.musica.src;
        audio.volume = Math.min(1, Math.max(0, Number(CONFIG.musica.volume) || 0.55));
        audio.setAttribute('aria-label', `Música de fondo: ${CONFIG.musica.title}`);
    }

    const setMusicButtonState = (isPlaying) => {
        if (!musicToggle) return;
        musicToggle.classList.toggle('is-playing', isPlaying);
        musicToggle.setAttribute('aria-pressed', String(isPlaying));
        musicToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    };

    /**
     * Si el MP3 no existe o el navegador no puede reproducirlo, ocultamos el
     * botón. La pre-invitación sigue funcionando con normalidad.
     */
    const markMusicUnavailable = () => {
        if (musicUnavailable) return;
        musicUnavailable = true;
        if (musicToggle) musicToggle.hidden = true;
        setMusicButtonState(false);
        console.info('[XV] No se encontró o no se pudo reproducir assets/hey-lover.mp3. La página sigue funcionando sin música.');
    };

    const playMusic = async () => {
        if (!audio || musicUnavailable) return;

        try {
            await audio.play();
            if (musicToggle) musicToggle.hidden = false;
            setMusicButtonState(true);
        } catch (error) {
            // Puede ser el bloqueo de autoplay o que el archivo no exista.
            // En ninguno de los dos casos la página debe romperse.
            const noSource =
                (audio.error && audio.error.code === 4) ||
                audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
                error.name === 'NotSupportedError' ||
                error.name === 'AbortError';

            if (noSource) {
                markMusicUnavailable();
            } else {
                setMusicButtonState(false);
                console.info('[XV] La música no pudo iniciarse. Toca el botón de música para reintentar.', error);
            }
        }
    };

    if (audio) {
        audio.addEventListener('play', () => setMusicButtonState(true));
        audio.addEventListener('pause', () => setMusicButtonState(false));
        audio.addEventListener('error', markMusicUnavailable);
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (!audio || musicUnavailable) return;

            if (audio.paused) {
                playMusic();
            } else {
                audio.pause();
            }
        });
    }

    const focusableElements = () => Array.from(welcome.querySelectorAll('button, [href]'))
        .filter((el) => !el.disabled && el.offsetParent !== null);

    const trapFocus = (event) => {
        if (event.key !== 'Tab') return;

        const focusables = focusableElements();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const openInvitation = (withMusic) => {
        if (introOpened) return;
        introOpened = true;

        welcome.classList.add('is-opening');

        // Debe llamarse dentro del gesto del usuario para saltar el bloqueo de autoplay.
        if (withMusic) {
            playMusic();
        } else {
            setMusicButtonState(false);
        }

        const reduce = prefersReducedMotion();
        const fadeDelay = reduce ? 80 : 700;
        const hideDelay = reduce ? 220 : 1520;

        window.setTimeout(() => {
            welcome.classList.add('is-closing');
        }, fadeDelay);

        window.setTimeout(() => {
            welcome.hidden = true;
            document.body.classList.remove('welcome-open');

            if (musicToggle && !musicUnavailable) musicToggle.hidden = false;
            if (hero) hero.classList.add('hero-in');

            // Llevar el foco al título para lectores de pantalla
            if (heroHeading) heroHeading.focus({ preventScroll: true });

            window.scrollTo({ top: 0, behavior: 'auto' });
            welcome.removeEventListener('keydown', onWelcomeKeydown);
        }, hideDelay);
    };

    const onWelcomeKeydown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            openInvitation(false);
            return;
        }
        trapFocus(event);
    };

    openButton.addEventListener('click', () => openInvitation(true));
    if (silentButton) silentButton.addEventListener('click', () => openInvitation(false));
    welcome.addEventListener('keydown', onWelcomeKeydown);

    // Foco inicial en el sello (solo si el usuario no ha interactuado aún)
    window.setTimeout(() => {
        if (!introOpened) openButton.focus({ preventScroll: true });
    }, 350);
};

/* ==========================================================================
   CUENTA REGRESIVA
   ========================================================================== */

const setupCountdown = () => {
    const countdownEl = $('countdown');
    if (!countdownEl) return;

    const target = new Date(CONFIG.quinceanera.dateISO).getTime();
    const noteEl = document.querySelector('.countdown-note');
    const labels = getDateLabels();
    const boxes = {
        days: $('cd-days'),
        hours: $('cd-hours'),
        minutes: $('cd-minutes'),
        seconds: $('cd-seconds')
    };

    if (!Number.isFinite(target)) {
        countdownEl.innerHTML = '<p class="countdown-celebration">Fecha por confirmar</p>';
        console.warn('[XV] La fecha en CONFIG.quinceanera.dateISO no es válida.');
        return;
    }

    const pad = (value) => String(value).padStart(2, '0');
    let lastMinuteLabel = '';
    let finished = false;
    let intervalId = null;

    const showFinished = () => {
        if (finished) return;
        finished = true;

        countdownEl.innerHTML = '<p class="countdown-celebration">¡Hoy es el gran día!</p>';
        countdownEl.setAttribute('aria-label', 'Hoy es el día de los XV años');
        if (noteEl) noteEl.textContent = 'Gracias por acompañarme en este sueño.';
        if (intervalId) window.clearInterval(intervalId);
    };

    const tick = () => {
        const diff = target - Date.now();

        if (diff <= 0) {
            showFinished();
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = totalSeconds % 60;

        if (boxes.days) boxes.days.textContent = String(days);
        if (boxes.hours) boxes.hours.textContent = pad(hours);
        if (boxes.minutes) boxes.minutes.textContent = pad(minutes);
        if (boxes.seconds) boxes.seconds.textContent = pad(seconds);

        // Actualizamos la etiqueta accesible solo cuando cambia el minuto,
        // para no saturar a los lectores de pantalla cada segundo.
        const minuteLabel = `${days} días, ${hours} horas y ${minutes} minutos restantes para el ${labels.longDate}`;
        if (minuteLabel !== lastMinuteLabel) {
            countdownEl.setAttribute('aria-label', minuteLabel);
            lastMinuteLabel = minuteLabel;
        }
    };

    tick();

    if (!finished) {
        intervalId = window.setInterval(tick, 1000);
    }
};

/* ==========================================================================
   REVELADO AL HACER SCROLL
   ========================================================================== */

const setupReveal = () => {
    const elements = Array.from(document.querySelectorAll('.reveal'));
    if (!elements.length) return;

    elements.forEach((el) => {
        const delay = Number.parseInt(el.dataset.delay || '0', 10);
        if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px'
    });

    elements.forEach((el) => observer.observe(el));
};

/* ==========================================================================
   PARTÍCULAS DORADAS DEL HERO (canvas ligero)
   ========================================================================== */

const setupSparkles = () => {
    const canvas = $('sparkles');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = prefersReducedMotion();
    // Dorado fino con destellos lavanda muy sutiles
    const palette = ['184, 144, 90', '201, 166, 107', '220, 192, 140', '142, 111, 176'];

    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;
    let heroVisible = true;

    const createParticles = () => {
        const count = Math.round(Math.min(58, Math.max(24, width / 15)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.3 + 0.5,
            alpha: Math.random() * 0.55 + 0.22,
            speed: Math.random() * 0.9 + 0.35,
            phase: Math.random() * Math.PI * 2,
            drift: Math.random() * 0.055 + 0.012,
            color: palette[Math.floor(Math.random() * palette.length)],
            star: Math.random() > 0.76
        }));
    };

    const resize = () => {
        const rect = hero.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createParticles();
        draw(performance.now());
    };

    const drawStar = (x, y, size, color, alpha) => {
        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 253, 251, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.55, 0, Math.PI * 2);
        ctx.fill();
    };

    const draw = (time) => {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            const twinkle = (Math.sin((time / 1000) * particle.speed + particle.phase) + 1) / 2;
            const alpha = particle.alpha * (0.35 + twinkle * 0.65);

            if (particle.star) {
                drawStar(particle.x, particle.y, particle.radius * 2.6, particle.color, alpha);
            } else {
                ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            if (!reduceMotion) {
                particle.y -= particle.drift;
                particle.x += Math.sin((time / 2400) + particle.phase) * 0.045;

                if (particle.y < -10) {
                    particle.y = height + 10;
                    particle.x = Math.random() * width;
                }
                if (particle.x < -10) particle.x = width + 10;
                if (particle.x > width + 10) particle.x = -10;
            }
        });
    };

    const loop = (time) => {
        draw(time);
        animationId = window.requestAnimationFrame(loop);
    };

    const start = () => {
        if (reduceMotion || animationId) return;
        animationId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
        if (!animationId) return;
        window.cancelAnimationFrame(animationId);
        animationId = null;
    };

    resize();
    start();

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
            resize();
            if (!reduceMotion && heroVisible) start();
        }, 180);
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
            if (heroVisible) start();
            else stop();
        }, { threshold: 0 });

        observer.observe(hero);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else if (heroVisible) {
            start();
        }
    });
};

/* ==========================================================================
   GENERACIÓN DEL ARCHIVO .ICS
   ========================================================================== */

const getNumericDateParts = () => {
    const date = new Date(CONFIG.quinceanera.dateISO);

    if (Number.isNaN(date.getTime())) return null;

    const parts = NUMERIC_DATE_FORMATTER.formatToParts(date);
    const values = {};
    parts.forEach((part) => {
        if (part.type !== 'literal') values[part.type] = part.value;
    });

    return {
        year: values.year,
        month: values.month,
        day: values.day
    };
};

const escapeICS = (text) => String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

const foldICSLine = (line) => {
    if (line.length <= 75) return line;

    const parts = [line.slice(0, 75)];
    let rest = line.slice(75);

    while (rest.length > 0) {
        parts.push(` ${rest.slice(0, 74)}`);
        rest = rest.slice(74);
    }

    return parts.join('\r\n');
};

const buildICS = () => {
    const date = getNumericDateParts();
    if (!date) throw new Error('La fecha del evento no es válida.');

    const { year, month, day } = date;
    const ymd = `${year}${month}${day}`;

    const nextDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1));
    const nextYmd = [
        nextDay.getUTCFullYear(),
        String(nextDay.getUTCMonth() + 1).padStart(2, '0'),
        String(nextDay.getUTCDate()).padStart(2, '0')
    ].join('');

    const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');

    const titulo = `XV Años de ${CONFIG.quinceanera.firstName} ${CONFIG.quinceanera.lastName}`;
    const lugar = [
        `Ceremonia: ${CONFIG.evento.ceremonia.nombre}, ${CONFIG.evento.ceremonia.direccion}`,
        `Recepción: ${CONFIG.evento.recepcion.nombre}, ${CONFIG.evento.recepcion.direccion}`
    ].join(' | ');

    const descripcion = [
        'Pre-invitación. Aparta la fecha para celebrar los XV años.',
        `Ceremonia: ${CONFIG.evento.ceremonia.nombre} (${CONFIG.evento.ceremonyTime}).`,
        `Recepción: ${CONFIG.evento.recepcion.nombre} (${CONFIG.evento.receptionTime}).`,
        `Canción: ${CONFIG.musica.title}.`
    ].join('\n');

    const reminderDays = Math.max(0, Number(CONFIG.calendario.recordatorioDiasAntes) || 1);
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//XV Maria Guadalupe//Pre-invitacion//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:xv-${ymd}-${Date.now()}@maria-guadalupe`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd}`,
        `DTEND;VALUE=DATE:${nextYmd}`,
        `SUMMARY:${escapeICS(titulo)}`,
        `LOCATION:${escapeICS(lugar)}`,
        `DESCRIPTION:${escapeICS(descripcion)}`,
        'TRANSP:OPAQUE'
    ];

    if (reminderDays > 0) {
        lines.push(
            'BEGIN:VALARM',
            `TRIGGER:-P${reminderDays}D`,
            'ACTION:DISPLAY',
            `DESCRIPTION:${escapeICS(`Recuerda: ${titulo}`)}`,
            'END:VALARM'
        );
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines.map(foldICSLine).join('\r\n') + '\r\n';
};

const downloadICS = () => {
    const status = $('calendar-status');

    try {
        const ics = buildICS();
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });

        if (!blob || typeof URL.createObjectURL !== 'function') {
            throw new Error('El navegador no permite generar el archivo.');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = CONFIG.calendario.filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1500);

        if (status) {
            status.textContent = '¡Listo! Abre el archivo para guardar la fecha en tu calendario.';
        }
    } catch (error) {
        console.warn('[XV] No se pudo generar el calendario.', error);
        if (status) {
            status.textContent = 'No se pudo generar el calendario. Intenta desde otro navegador.';
        }
    }
};

const setupCalendar = () => {
    const button = $('add-calendar');
    if (button) button.addEventListener('click', downloadICS);
};

/* ==========================================================================
   RESPALDO VISUAL SI FALTA UNA FOTOGRAFÍA
   ========================================================================== */

const makePhotoFallback = (label) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#FFFDF8"/>
                    <stop offset="55%" stop-color="#EFE7F6"/>
                    <stop offset="100%" stop-color="#D9CCE6"/>
                </linearGradient>
                <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#9A7446"/>
                    <stop offset="100%" stop-color="#C9A66B"/>
                </linearGradient>
            </defs>
            <rect width="900" height="1200" fill="url(#bg)"/>
            <rect x="48" y="48" width="804" height="1104" rx="402" fill="none" stroke="url(#gold)" stroke-opacity=".62"/>
            <rect x="70" y="70" width="760" height="1060" rx="380" fill="none" stroke="#B8905A" stroke-opacity=".36" stroke-dasharray="6 10"/>
            <g fill="#8E6FB0" opacity=".9">
                <ellipse cx="450" cy="470" rx="26" ry="54"/>
                <ellipse cx="450" cy="470" rx="26" ry="54" transform="rotate(60 450 470)"/>
                <ellipse cx="450" cy="470" rx="26" ry="54" transform="rotate(120 450 470)"/>
            </g>
            <circle cx="450" cy="470" r="17" fill="#B8905A"/>
            <text x="450" y="620" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="12" fill="#9A7446">${label.toUpperCase()}</text>
            <text x="450" y="700" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#6F4E95">Coloca aquí tu fotografía</text>
            <text x="450" y="780" text-anchor="middle" font-family="Georgia, serif" font-size="26" letter-spacing="8" fill="#6A5A7C">M · G · P</text>
            <text x="450" y="880" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#B8905A">✦</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const setupImageFallbacks = () => {
    document.querySelectorAll('img[data-fallback]').forEach((img) => {
        const applyFallback = () => {
            if (img.dataset.fallbackApplied === 'true') return;
            img.dataset.fallbackApplied = 'true';
            img.src = makePhotoFallback(img.dataset.fallback || 'Foto');
        };

        img.addEventListener('error', applyFallback);

        // Si la imagen ya falló antes de registrar el evento
        if (img.complete && img.naturalWidth === 0) {
            applyFallback();
        }
    });
};

/* ==========================================================================
   LIGHTBOX DE FOTOGRAFÍAS
   ========================================================================== */

const setupLightbox = () => {
    const lightbox = $('lightbox');
    const image = $('lightbox-img');
    const closeButton = $('lightbox-close');
    const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));

    if (!lightbox || !image || !closeButton || !triggers.length) return;

    let lastFocused = null;

    const close = () => {
        if (lightbox.hidden) return;

        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        image.removeAttribute('src');
        image.alt = '';

        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus({ preventScroll: true });
        }
    };

    const open = (trigger) => {
        const photo = trigger.querySelector('img');
        if (!photo) return;

        lastFocused = trigger;
        image.src = photo.currentSrc || photo.src;
        image.alt = photo.alt || 'Fotografía ampliada';
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        closeButton.focus({ preventScroll: true });
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => open(trigger));
    });

    closeButton.addEventListener('click', close);

    // Cerrar al tocar fuera de la fotografía
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) close();
    });

    // Mantener el foco dentro del visor mientras está abierto
    lightbox.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            closeButton.focus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !lightbox.hidden) {
            event.preventDefault();
            close();
        }
    });
};

/* ==========================================================================
   INICIO
   ========================================================================== */

const init = () => {
    safe('hidratar contenido', hydrateContent);
    safe('portada y música', setupIntroAndMusic);
    safe('cuenta regresiva', setupCountdown);
    safe('animaciones de scroll', setupReveal);
    safe('partículas', setupSparkles);
    safe('calendario', setupCalendar);
    safe('respaldo de imágenes', setupImageFallbacks);
    safe('visor de fotografías', setupLightbox);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
