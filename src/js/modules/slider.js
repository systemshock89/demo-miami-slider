import Swiper, {FreeMode, Mousewheel, Parallax, Controller, Lazy} from 'swiper';

function slider() {

    const sliderMain = new Swiper('.slider_main', {
        freeMode: true, // позволяет листать слайды без привязки к позиции слайда
        centeredSlides: true, // 1-й слайд будет в центре
        mousewheel: true,
        parallax: true,
        breakpoints: {
            0: { // ширина экрана от 0 до 680
                slidesPerView: 2.5, // показывать 2,5 слайда
                spaceBetween: 20, // расстояние между слайдами
            },
            680: { // от 680 до бесконечности
                slidesPerView: 3.5,
                spaceBetween: 60,
            },
        },
        lazy: true,
        modules: [FreeMode, Mousewheel, Parallax, Controller, Lazy],
    });

    // слайдер с размытием фона
    const sliderBg = new Swiper('.slider_bg', {
        centeredSlides: true,
        parallax: true,
        slidesPerView: 3.5,
        spaceBetween: 60,
        modules: [Parallax, Controller],
    });

    sliderMain.controller.control = sliderBg; // свяжем слайдеры

    const desc = document.querySelector('.description');
    // при пролистывании слайда, если активный слайд не первый, то скроем текст
    sliderMain.on('slideChange', e => {
        sliderMain.activeIndex > 0 ? desc.classList.add('description_hidden') : desc.classList.remove('description_hidden');
    })

    // клик по изображению
    document.querySelectorAll('.slider__item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            if(!item.classList.contains('slider__item_opened')){
                openModal(item);
            } else {
                closeModal(item);
            }
        });
    });

    function openModal(item){
        const itemWrap = item.querySelector('.slider__item-wrap');

        item.classList.add('slider__item_opened');

        sliderMain.disable();

        const itemAntiRotate = item.querySelector('.slider__item-anti-rotate')
        const offsetX = itemAntiRotate.getBoundingClientRect().x;
        const offsetY = itemAntiRotate.getBoundingClientRect().y;
        const scale = ((document.body.clientHeight + (document.body.clientHeight - itemAntiRotate.clientHeight)) / document.body.clientHeight).toFixed(2);

        // при клике повернем слайд в обратную сторону(ровно) и увеличим
        itemWrap.style.transform = `rotate(-15deg) translateX(calc(${-offsetX}px + 50vw - 50%)) translateY(calc(${-offsetY}px + 50vh - 50%)) scale(${scale})`;

        // закрываем окно при нажатии на клавишу Escape
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && item.classList.contains('slider__item_opened') ) {
                closeModal(item);
            }
        });
    }

    function closeModal(item){
        const itemWrap = item.querySelector('.slider__item-wrap');
        item.classList.remove('slider__item_opened');
        sliderMain.enable();
        itemWrap.style.transform = '';
    }

}

export default slider;