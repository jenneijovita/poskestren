
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- AOS INIT ---------- */
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });

    /* ---------- SCROLL REVEAL ---------- */
    var revealElements = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

        revealElements.forEach(function (element) {
            var delay = Number(element.getAttribute('data-reveal-delay'));
            if (Number.isFinite(delay) && delay > 0) {
                element.style.setProperty('--reveal-delay', delay + 'ms');
            }
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(function (element) {
            element.classList.add('is-revealed');
        });
    }

    /* ---------- PRELOADER ---------- */
    var preloader = document.getElementById('preloader');
    window.addEventListener('load', function () {
        setTimeout(function () { preloader.classList.add('hide'); }, 400);
    });
    // fallback in case load already fired
    setTimeout(function () { preloader.classList.add('hide'); }, 2500);

    /* ---------- SCROLL TO TOP + PROGRESS RING (set up first so onScroll can use it) ---------- */
    var scrollTopBtn = document.getElementById('scrollTop');
    var progressCircle = scrollTopBtn.querySelector('.progress');
    var radius = 23;
    var circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? scrollTop / docHeight : 0;
        progressCircle.style.strokeDashoffset = circumference - pct * circumference;
        if (scrollTop > 400) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    }
    function scrollToTopHandler() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    scrollTopBtn.addEventListener('click', scrollToTopHandler);
    scrollTopBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToTopHandler(); }
    });

    /* ---------- NAVBAR SCROLL STATE ---------- */
    var nav = document.getElementById('mainNav');
    var logoMark = document.querySelector('.hw-logo-mark--poskestren');
    var appointmentButtons = document.querySelectorAll('.btn-hw-appointment');
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var logoMotion;
    var appointmentMotions = [];
    function updateNavbarMotion() {
        if (logoMotion) logoMotion.cancel();
        appointmentMotions.forEach(function (animation) { animation.cancel(); });
        appointmentMotions = [];
        if (!motionPreference.matches) {
            if (logoMark) {
                logoMotion = logoMark.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-4px)' },
                    { transform: 'translateY(0)' }
                ], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
            }
            appointmentButtons.forEach(function (button) {
                var icon = button.querySelector('i');
                if (!icon) return;
                appointmentMotions.push(icon.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-3px) rotate(-8deg)' },
                    { transform: 'translateY(0)' }
                ], { duration: 2200, iterations: Infinity, easing: 'ease-in-out' }));
            });
        }
    }
    updateNavbarMotion();
    motionPreference.addEventListener('change', updateNavbarMotion);

    function onScroll() {
        if (window.scrollY > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        updateScrollProgress();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* collapse mobile menu after clicking a link */
    document.querySelectorAll('#navMenu .nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            var collapseEl = document.getElementById('navMenu');
            var bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
            if (bsCollapse) bsCollapse.hide();
        });
    });

    /* ---------- SERVICE DETAILS MODAL ---------- */
    var serviceModal = document.getElementById('serviceModal');
    if (serviceModal) {
        serviceModal.addEventListener('show.bs.modal', function (event) {
            var trigger = event.relatedTarget;
            if (!trigger) return;
            serviceModal.querySelector('#serviceModalTitle').textContent = trigger.getAttribute('data-service-title');
            serviceModal.querySelector('#serviceModalDescription').textContent = trigger.getAttribute('data-service-description');
        });
    }

    /* ---------- REVIEW WHATSAPP SUBMISSION ---------- */
    var reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        var reviewNameInput = document.getElementById('reviewName');
        var reviewMessageInput = document.getElementById('reviewMessage');
        var reviewFormStatus = document.getElementById('reviewFormStatus');
        var reviewWhatsAppFallback = document.getElementById('reviewWhatsAppFallback');

        reviewNameInput.addEventListener('input', function () {
            reviewNameInput.setCustomValidity('');
        });
        reviewMessageInput.addEventListener('input', function () {
            reviewMessageInput.setCustomValidity('');
        });

        reviewForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var senderName = reviewNameInput.value.trim();
            var senderRole = reviewForm.elements.senderRole.value;
            var dormOrClass = reviewForm.elements.dormOrClass.value.trim();
            var rating = reviewForm.elements.rating.value;
            var reviewMessage = reviewMessageInput.value.trim();

            reviewNameInput.setCustomValidity(senderName ? '' : 'Masukkan nama pengirim.');
            reviewMessageInput.setCustomValidity(reviewMessage ? '' : 'Masukkan ulasan Anda.');
            if (!reviewForm.reportValidity()) return;

            var message = [
                'Assalamu’alaikum, saya ingin menyampaikan ulasan Poskestren.',
                '',
                'Nama: ' + senderName,
                'Status: ' + senderRole,
                'Asrama / Kelas: ' + (dormOrClass || 'Tidak dicantumkan'),
                'Rating: ' + rating + '/5 bintang',
                '',
                'Ulasan:',
                reviewMessage
            ].join('\n');
            var whatsappUrl = 'https://wa.me/6285784960886?text=' + encodeURIComponent(message);

            reviewWhatsAppFallback.href = whatsappUrl;
            reviewWhatsAppFallback.hidden = false;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            reviewFormStatus.textContent = 'Pesan ulasan sudah disiapkan. Periksa kembali di WhatsApp, lalu tekan Kirim.';
        });
    }

    /* ---------- REGISTRATION WHATSAPP SUBMISSION ---------- */
    var registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        var registrationFormStatus = document.getElementById('registrationFormStatus');
        var registrationWhatsAppFallback = document.getElementById('registrationWhatsAppFallback');
        var requiredTextFields = registrationForm.querySelectorAll('input[required][type="text"], textarea[required]');

        requiredTextFields.forEach(function (field) {
            function validateRequiredText() {
                field.setCustomValidity(field.value.trim() ? '' : 'Kolom ini wajib diisi.');
            }

            field.addEventListener('input', validateRequiredText);
            validateRequiredText();
        });

        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!registrationForm.reportValidity()) return;

            var studentName = registrationForm.elements.studentName.value.trim();
            var dormOrClass = registrationForm.elements.dormOrClass.value.trim();
            var service = registrationForm.elements.service.value;
            var complaint = registrationForm.elements.complaint.value.trim();
            var message = [
                'Assalamu’alaikum, saya ingin mendaftar berobat di Poskestren.',
                '',
                'Nama Santri: ' + studentName,
                'Asrama / Kelas: ' + dormOrClass,
                'Poli Tujuan: ' + service,
                'Keluhan Singkat: ' + complaint
            ].join('\n');
            var whatsappUrl = 'https://wa.me/6285784960886?text=' + encodeURIComponent(message);

            registrationWhatsAppFallback.href = whatsappUrl;
            registrationWhatsAppFallback.hidden = false;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            registrationFormStatus.textContent = 'Data pendaftaran sudah disiapkan. Periksa kembali di WhatsApp, lalu tekan Kirim.';
        });
    }

    /* ---------- ANIMATED COUNTERS ---------- */
    var counters = document.querySelectorAll('.counter');
    var counted = new WeakSet();
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = Math.floor(eased * target);
            el.textContent = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
    }
    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !counted.has(entry.target)) {
                counted.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });

    /* ---------- CAUSE PROGRESS BARS ---------- */
    var progressBars = document.querySelectorAll('.cause-progress-fill');
    var progressObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                el.style.width = el.getAttribute('data-progress') + '%';
                progressObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    progressBars.forEach(function (bar) { progressObserver.observe(bar); });

    /* ---------- MOUSE-FOLLOW GLOW IN HERO ---------- */
    var heroGlow = document.querySelector('.hero-glow');
    var heroSection = document.querySelector('.hero');
    if (heroSection && window.matchMedia('(pointer:fine)').matches) {
        heroSection.addEventListener('mousemove', function (e) {
            var rect = heroSection.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            heroGlow.style.transform = 'translate(' + (x - 260) * 0.15 + 'px,' + (y - 260) * 0.15 + 'px)';
        });
    }

});


/* ---------- FAQ SEARCH + CATEGORY FILTER ---------- */
var searchInput = document.getElementById('faqSearch');
if (searchInput) {
    var clearBtn = document.getElementById('faqClear');
    var catButtons = document.querySelectorAll('.faq-cat-btn');
    var faqItems = document.querySelectorAll('.faq-item');
    var faqGroups = document.querySelectorAll('.faq-group');
    var emptyState = document.getElementById('faqEmpty');
    var activeCat = 'all';

    function applyFilters() {
        var term = searchInput.value.trim().toLowerCase();
        clearBtn.classList.toggle('show', term.length > 0);
        var anyVisible = false;

        faqItems.forEach(function (item) {
            var matchesCat = activeCat === 'all' || item.getAttribute('data-cat') === activeCat;
            var text = item.textContent.toLowerCase();
            var matchesSearch = term === '' || text.indexOf(term) !== -1;
            var visible = matchesCat && matchesSearch;
            item.setAttribute('data-hidden', visible ? 'false' : 'true');
            if (visible) anyVisible = true;
        });

        faqGroups.forEach(function (group) {
            var visibleItems = group.querySelectorAll('.faq-item[data-hidden="false"]');
            group.style.display = visibleItems.length > 0 ? '' : 'none';
        });

        emptyState.classList.toggle('show', !anyVisible);
    }

    searchInput.addEventListener('input', applyFilters);
    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        applyFilters();
        searchInput.focus();
    });

    catButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            catButtons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            activeCat = btn.getAttribute('data-cat');
            applyFilters();
        });
    });

}



/* ---------- TOC SCROLLSPY ---------- */
var tocLinks = document.querySelectorAll('#policyToc a');
if (tocLinks) {
    var sections = Array.from(tocLinks).map(function (link) {
        return document.getElementById(link.getAttribute('href').substring(1));
    }).filter(Boolean);

    function updateTocActive() {
        var scrollPos = window.scrollY + 140;
        var current = sections[0];
        sections.forEach(function (sec) {
            if (sec.offsetTop <= scrollPos) current = sec;
        });
        tocLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
        });
    }
    window.addEventListener('scroll', updateTocActive, { passive: true });
    updateTocActive();

    tocLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(link.getAttribute('href').substring(1));
            if (target) window.scrollTo({ top: target.offsetTop - 96, behavior: 'smooth' });
        });
    });
}

/* ---------- REPORT DOWNLOAD (demo) ---------- */
var reportStatus = document.getElementById('reportStatus');
if (reportStatus) {
    document.querySelectorAll('.btn-report').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var name = btn.getAttribute('data-report');
            reportStatus.innerHTML = '<div class="alert alert-success d-inline-flex align-items-center gap-2 mb-0" style="border-radius:12px;"><i class="bi bi-check-circle-fill"></i>' + name + ' is ready &mdash; connect a file host to enable live downloads.</div>';
        });
    });
}
