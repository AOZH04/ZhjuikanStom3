(function () {
    'use strict';

    /* ---- Бургер / мобильное меню ---- */
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.mainnav');
    if (burger && nav) {
        burger.addEventListener('click', function () {
            var open = nav.classList.toggle('is_open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.addEventListener('click', function (e) {
            var a = e.target.closest('a');
            if (a && !a.parentElement.classList.contains('mainnav_has_sub')) {
                nav.classList.remove('is_open');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
        /* Аккордеон подменю на мобильном: тап по родителю раскрывает список */
        nav.querySelectorAll('.mainnav_has_sub > a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (window.matchMedia('(max-width: 850px)').matches) {
                    e.preventDefault();
                    link.parentElement.classList.toggle('is_sub_open');
                }
            });
        });
        /* Закрываем открытое меню при скролле страницы */
        window.addEventListener('scroll', function () {
            if (nav.classList.contains('is_open')) {
                nav.classList.remove('is_open');
                burger.setAttribute('aria-expanded', 'false');
            }
        }, { passive: true });
    }

    /* ---- Шапка: верхний этаж уезжает за верх экрана, навигация прилипает ----
       Реализовано отрицательным top у sticky-шапки на высоту верхнего этажа —
       без изменения высоты в потоке, поэтому страница не прыгает. ---- */
    var header = document.querySelector('.site_header');
    var headerTop = document.querySelector('.header_top');
    if (header && headerTop) {
        var setStickyOffset = function () {
            if (window.matchMedia('(max-width: 850px)').matches) {
                header.style.top = '0px';
            } else {
                header.style.top = '-' + Math.round(headerTop.offsetHeight) + 'px';
            }
            document.documentElement.style.setProperty('--header_h', Math.round(header.offsetHeight) + 'px');
        };
        setStickyOffset();
        window.addEventListener('resize', setStickyOffset);
    }

    /* ---- Табы услуг ---- */
    var tabs = document.querySelectorAll('.services_tab');
    var panels = document.querySelectorAll('.services_panel');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var key = tab.getAttribute('data-tab');
            tabs.forEach(function (t) { t.classList.remove('is_active'); });
            tab.classList.add('is_active');
            panels.forEach(function (p) {
                p.classList.toggle('is_active', p.getAttribute('data-panel') === key);
            });
        });
    });

    /* ---- Галерея услуг: миниатюры меняют главное фото + лайтбокс ---- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = lightbox ? lightbox.querySelector('.lightbox_img') : null;
    var lbList = [];
    var lbIndex = 0;

    function lbShow(i) {
        if (!lbList.length) return;
        lbIndex = (i + lbList.length) % lbList.length;
        lightboxImg.setAttribute('src', lbList[lbIndex]);
    }
    function lbOpen(list, startSrc) {
        lbList = list;
        var s = list.indexOf(startSrc);
        lbShow(s < 0 ? 0 : s);
        lightbox.classList.add('is_open');
        lightbox.setAttribute('aria-hidden', 'false');
    }
    function lbClose() {
        lightbox.classList.remove('is_open');
        lightbox.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.services_panel').forEach(function (panel) {
        var mainImg = panel.querySelector('.services_gallery_main img');
        if (!mainImg) return;
        var thumbs = [].slice.call(panel.querySelectorAll('.services_gallery_thumbs img'));
        var gallery = [mainImg.getAttribute('src')].concat(thumbs.map(function (t) { return t.getAttribute('src'); }));

        thumbs.forEach(function (th) {
            th.addEventListener('click', function () {
                mainImg.setAttribute('src', th.getAttribute('src'));
            });
        });
        if (lightbox) {
            panel.querySelector('.services_gallery_main').addEventListener('click', function () {
                lbOpen(gallery, mainImg.getAttribute('src'));
            });
        }
    });

    /* Документы — открываются в лайтбоксе */
    var docItems = [].slice.call(document.querySelectorAll('.docs_track .doc_item'));
    if (lightbox && docItems.length) {
        var docList = docItems.map(function (i) { return i.getAttribute('src'); });
        docItems.forEach(function (it) {
            it.addEventListener('click', function () { lbOpen(docList, it.getAttribute('src')); });
        });
    }

    /* Галерея работ «До/После» — открывается в лайтбоксе */
    var beforeGal = [].slice.call(document.querySelectorAll('.before_gallery img'));
    if (lightbox && beforeGal.length) {
        var beforeList = beforeGal.map(function (i) { return i.getAttribute('src'); });
        beforeGal.forEach(function (it) {
            it.addEventListener('click', function () { lbOpen(beforeList, it.getAttribute('src')); });
        });
    }

    if (lightbox) {
        lightbox.querySelector('.lightbox_prev').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIndex - 1); });
        lightbox.querySelector('.lightbox_next').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIndex + 1); });
        lightbox.querySelector('.lightbox_close').addEventListener('click', lbClose);
        lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lbClose(); });
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('is_open')) return;
            if (e.key === 'Escape') lbClose();
            else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
            else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
        });
        var lbTouchX = 0;
        lightbox.addEventListener('touchstart', function (e) { lbTouchX = e.changedTouches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - lbTouchX;
            if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
        }, { passive: true });
    }

    /* ---- Табы фото: переключение панелей + клик по фото открывает лайтбокс ---- */
    var procTabs = document.querySelectorAll('.process_tab');
    var procPanels = document.querySelectorAll('.process_panel');
    procTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var key = tab.getAttribute('data-ptab');
            procTabs.forEach(function (x) { x.classList.remove('is_active'); });
            tab.classList.add('is_active');
            procPanels.forEach(function (p) { p.classList.toggle('is_active', p.getAttribute('data-ppanel') === key); });
        });
    });
    procPanels.forEach(function (panel) {
        var imgs = [].slice.call(panel.querySelectorAll('.process_grid img'));
        if (!lightbox || !imgs.length) return;
        var list = imgs.map(function (i) { return i.getAttribute('src'); });
        imgs.forEach(function (it) {
            it.addEventListener('click', function () { lbOpen(list, it.getAttribute('src')); });
        });
    });

    /* ---- FAQ аккордеон ---- */
    document.querySelectorAll('.faq_item').forEach(function (item) {
        var q = item.querySelector('.faq_q');
        var a = item.querySelector('.faq_a');
        q.addEventListener('click', function () {
            var open = item.classList.toggle('is_open');
            a.style.maxHeight = open ? (a.scrollHeight + 'px') : '';
        });
    });

    /* ---- Слайдеры (стрелки прокручивают трек) ---- */
    document.querySelectorAll('.slider').forEach(function (slider) {
        var track = slider.querySelector('.slider_track');
        var prev = slider.querySelector('.slider_prev');
        var next = slider.querySelector('.slider_next');
        if (!track) return;
        function step() {
            var first = track.children[0];
            if (!first) return track.clientWidth * 0.8;
            var gap = 24;
            return first.getBoundingClientRect().width + gap;
        }
        function page() {
            return Math.max(1, Math.round(track.clientWidth / step()));
        }
        if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() * page(), behavior: 'smooth' }); });
        if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() * page(), behavior: 'smooth' }); });
    });

    /* ---- Видео-слайдер: активный слайд по центру ---- */
    document.querySelectorAll('[data-vslider]').forEach(function (slider) {
        var viewport = slider.querySelector('.video_slider_viewport');
        var track = slider.querySelector('.video_slider_track');
        var slides = [].slice.call(track.children);
        var prev = slider.querySelector('.slider_prev');
        var next = slider.querySelector('.slider_next');
        if (!viewport || !track || !slides.length) return;
        var active = 0;

        function layout() {
            var s = slides[active];
            var offset = viewport.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
            track.style.transform = 'translateX(' + offset + 'px)';
            slides.forEach(function (sl, i) { sl.classList.toggle('is_active', i === active); });
        }
        function go(i) {
            i = Math.max(0, Math.min(slides.length - 1, i));
            if (i === active) return;
            /* уходя со слайда — прячем видео и возвращаем превью */
            slides.forEach(function (sl) {
                var frame = sl.querySelector('.video_frame');
                if (!frame || !frame.classList.contains('is_playing')) return;
                frame.classList.remove('is_playing');
                var v = frame.querySelector('.video_player');
                if (v) { v.style.display = ''; try { v.pause(); } catch (e) {} }
            });
            active = i;
            layout();
        }
        if (prev) prev.addEventListener('click', function () { go(active - 1); });
        if (next) next.addEventListener('click', function () { go(active + 1); });

        slides.forEach(function (sl, i) {
            var frame = sl.querySelector('.video_frame');
            var btn = sl.querySelector('.video_play_btn');
            if (btn) btn.addEventListener('click', function (e) {
                if (!sl.classList.contains('is_active')) { e.preventDefault(); go(i); return; }
                frame.classList.add('is_playing');
                var v = frame.querySelector('.video_player');
                /* видео покажем только когда появится реальный src; пока — заглушка */
                if (v && v.getAttribute('src')) { v.style.display = 'block'; try { v.play(); } catch (err) {} }
            });
            sl.addEventListener('click', function () {
                if (!sl.classList.contains('is_active')) go(i);
            });
        });

        window.addEventListener('resize', layout);
        layout();
    });

    /* ---- До/После: ползунок сравнения изображений ---- */
    document.querySelectorAll('[data-compare]').forEach(function (c) {
        var range = c.querySelector('.compare_range');
        var before = c.querySelector('.compare_before');
        var divider = c.querySelector('.compare_divider');
        if (!before || !divider) return;
        function set(v) {
            v = Math.max(0, Math.min(100, v));
            before.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
            divider.style.left = v + '%';
            if (range) range.value = v;
        }
        function moveTo(clientX) {
            var rect = c.getBoundingClientRect();
            set((clientX - rect.left) / rect.width * 100);
        }
        /* Перетаскивание через pointer events — работает на iOS/тач в любой точке,
           не зависит от попадания в тонкий ползунок нативного range. */
        var dragging = false;
        c.addEventListener('pointerdown', function (e) {
            /* на неактивном слайде не мешаем навигации слайдера */
            var slide = c.closest('.video_slide');
            if (slide && !slide.classList.contains('is_active')) return;
            dragging = true;
            if (c.setPointerCapture) { try { c.setPointerCapture(e.pointerId); } catch (err) {} }
            moveTo(e.clientX);
            e.preventDefault();
        });
        c.addEventListener('pointermove', function (e) {
            if (dragging) { moveTo(e.clientX); e.preventDefault(); }
        });
        function stop() { dragging = false; }
        c.addEventListener('pointerup', stop);
        c.addEventListener('pointercancel', stop);
        /* клавиатура: стрелки меняют value нативного range → синхронизируем */
        if (range) range.addEventListener('input', function () { set(+range.value); });
        set(range ? +range.value : 50);
    });

    /* ---- SEO текст: раскрыть/свернуть ---- */
    document.querySelectorAll('.seo_toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = document.getElementById(btn.getAttribute('data-target'));
            if (!target) return;
            var clamped = target.classList.toggle('is_clamped');
            btn.classList.toggle('is_open', !clamped);
            btn.firstChild.textContent = clamped ? 'Раскрыть полностью' : 'Свернуть';
        });
    });

    /* ---- Плавающие кнопки: разворачивание/сворачивание ---- */
    var sideLinks = document.getElementById('sideLinks');
    var sideToggle = document.querySelector('.side_toggle');
    if (sideToggle && sideLinks) {
        var sideAutoHide = null;
        /* На десктопе блок сначала раскрыт, через 3 секунды сворачивается; на мобильном — свёрнут */
        if (!window.matchMedia('(max-width: 850px)').matches) {
            sideLinks.classList.add('is_open');
            sideToggle.setAttribute('aria-expanded', 'true');
            sideAutoHide = setTimeout(function () {
                sideLinks.classList.remove('is_open');
                sideToggle.setAttribute('aria-expanded', 'false');
            }, 3000);
        }
        sideToggle.addEventListener('click', function () {
            /* если пользователь сам нажал раньше — отменяем авто-сворачивание */
            if (sideAutoHide) { clearTimeout(sideAutoHide); sideAutoHide = null; }
            var open = sideLinks.classList.toggle('is_open');
            sideToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    /* ---- Кнопка «наверх» ---- */
    var toTop = document.querySelector('.to_top');
    if (toTop) {
        window.addEventListener('scroll', function () {
            toTop.classList.toggle('is_visible', window.pageYOffset > 700);
        });
        toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
})();
