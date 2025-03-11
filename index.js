addListeners();

function addListeners() {
    let fadeIn;
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            fadeIn = animaster().addFadeIn(5000).play(block);
        });
    document.getElementById('fadeInReset')
        .addEventListener('click', function () {
            fadeIn?.reset?.();
        });

    let fadeOut;
    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            fadeOut = animaster().addFadeOut(5000).play(block);
        });
    document.getElementById('fadeOutReset')
        .addEventListener('click', function () {
            fadeOut?.reset?.();
        });

    let move;
    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            move = animaster().addMove(3000, { x: 100, y: 30 }).play(block);
        });
    document.getElementById('moveReset')
        .addEventListener('click', function () {
            move?.reset?.();
        });

    let scale;
    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            scale = animaster().addScale(3000, 1.35).play(block);
        });
    document.getElementById('scaleReset')
        .addEventListener('click', function () {
            scale?.reset?.();
        });
    
    let rotate;
    document.getElementById('rotatePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('rotateBlock');
            rotate = animaster().addRotate(3000).play(block);
        });
    document.getElementById('rotateReset')
        .addEventListener('click', function () {
            rotate?.reset?.();
        });

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            const moveAndHideController = animaster().moveAndHide(block, 1000);

            document.getElementById('moveAndHideReset').addEventListener('click', function () {
                moveAndHideController.reset();
            });
    });

    document.getElementById('showAndHide')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 1000);
        });

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            const heartBeatingController = animaster().heartBeating(block);

            document.getElementById('heartBeatingStop').addEventListener('click', function () {
                heartBeatingController.stop();
            });
        });
    
    document.getElementById('complexBlock')
        .addEventListener('click', animaster()
            .addFadeIn(100)
            .addMove(200, {x: 40, y: 40})
            .addScale(800, 1.3)
            .addMove(200, {x: 80, y: 0})
            .addScale(800, 1)
            .addMove(200, {x: 40, y: -40})
            .addScale(800, 0.7)
            .addMove(200, {x: 0, y: 0})
            .addScale(800, 1)
            .buildHandler());
}

function animaster() {
    return {
        _steps: [],

        _addStep(duration, stepFunc) {
            const next = animaster()
            next._steps.push(...this._steps);
            next._steps.push([duration, stepFunc]);
            return next;
        },

        _playStep(element, stepId, state) {
            if (stepId >= this._steps.length) {
                return;
            }
            const [duration, func] = this._steps[stepId];
            state.history.push(func(element, duration));
            state.currentTimeout = setTimeout(() => {
                this._playStep(element, stepId + 1, state);
            }, duration);
        },

        play(element) {
            const state = {
                history: []
            };
            this._playStep(element, 0, state);
            return {
                stop() {
                    clearTimeout(state.currentTimeout);
                    state.history[state.history.length - 1]?.stop?.();
                },
                reset() {
                    clearTimeout(state.currentTimeout);
                    for (const step of state.history.reverse())
                        step.reset?.();
                }
            };
        },

        buildHandler() {
            const animaster = this;
            return function() {
                animaster.play(this);
            }
        },

        addFadeIn(duration) {
            return this._addStep(duration, this.fadeIn);
        },

        addFadeOut(duration) {
            return this._addStep(duration, this.fadeOut);
        },

        addMove(duration, translation) {
            return this._addStep(duration, (element, duration) => this.move(element, duration, translation));
        },

        addScale(duration, ratio) {
            return this._addStep(duration, (element, duration) => this.scale(element, duration, ratio));
        },

        addRotate(duration) {
            return this._addStep(duration, (element, duration) => this.rotate(element, duration));
        },

        /**
         * Блок плавно появляется из прозрачного.
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         */
        fadeIn(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('hide');
            element.classList.add('show');
            return {
                reset() {
                    element.style.transitionDuration = null;
                    element.classList.remove('show');
                    element.classList.add('hide');
                }
            };
        },

        /**
         * Блок плавно исчезает в прозрачный.
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         */
        fadeOut(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('show');
            element.classList.add('hide');
            return {
                reset() {
                    element.style.transitionDuration = null;
                    element.classList.remove('hide');
                    element.classList.add('show');
                }
            };
        },

        /**
         * Функция, передвигающая элемент
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         * @param translation — объект с полями x и y, обозначающими смещение блока
         */
        move(element, duration, translation) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(translation, null);
            return {
                reset() {
                    element.style.transitionDuration = null;
                    element.style.transform = getTransform({ x: 0, y: 0 }, null);
                }
            };
        },

        /**
         * Функция, увеличивающая/уменьшающая элемент
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
         */
        scale(element, duration, ratio) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(null, ratio);
            return {
                reset() {
                    element.style.transitionDuration = null;
                    element.style.transform = getTransform(null, 1);
                }
            };
        },

        rotate(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = "rotate(360deg)";
            return {
                reset() {
                    element.style.transitionDuration = null;
                    element.style.transform = null;
                }
            };
        },

        moveAndHide(element, duration, translation) {
            let isRunning = true;
            let moveTimeoutId = null;
            let fadeTimeoutId = null;

            function startMove() {
                if (!isRunning) return;
                this.move(element, (2 / 5) * duration, { x: 100, y: 20 });

                moveTimeoutId = setTimeout(() => {
                    if (!isRunning) return;
                    startFade();
                }, (2 / 5) * duration);
            }

            function startFade() {
                if (!isRunning) return;
                this.fadeOut(element, (3 / 5) * duration);
            }

            startMove.call(this);

            return {
                reset: () => {
                    isRunning = false;
                    clearTimeout(moveTimeoutId);
                    clearTimeout(fadeTimeoutId);

                    element.style.transform = '';
                    this.fadeIn(element, duration);
                    element.classList.remove('hide');
                    element.classList.add('show');
                }
            };
        },

        showAndHide(element, duration) {
            element.classList.remove('hide');
            this.fadeIn(element, duration / 3);
            setTimeout(() => {
                this.fadeOut(element, duration / 3);
            }, duration / 3 * 2);
        },

        heartBeating(element) {
            let isRunning = true;
            let timeoutId = null;

            function beat() {
                if (!isRunning) return;

                this.scale(element, 500, 1.4);

                timeoutId = setTimeout(() => {
                    if (!isRunning) return;
                    this.scale(element, 500, 1);

                    timeoutId = setTimeout(beat.bind(this), 500);
                }, 500);
            }

            beat.call(this);

            return {
                stop: () => {
                    isRunning = false;
                    clearTimeout(timeoutId);
                }
            };
        },
    }
}


function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
