// Создание и рендер разметки по массиву данных и предоставленному шаблону.

import galleryData from './gallery-items.js';

// делаем объект ссылок на DOM элементы

const refs = {
  galleryList: document.querySelector('.js-gallery'),
  backdrop: document.querySelector('.lightbox'),
  backdropOverlay: document.querySelector('.lightbox__overlay'),
  backdropContent: document.querySelector('.lightbox__content'),
  closeModalBtn: document.querySelector(
    '.lightbox button[data-action="close-lightbox"]',
  ),
  imageInModalWindow: document.querySelector('.lightbox__image'),
};

// функция генерирования разметки заданного типа (<li><img></li>)
const GALLERY_ITEM_CLASS = 'gallery__item';
const GALLERY_LINK_CLASS = 'gallery__link';
const GALLERY_IMAGE_CLASS = 'gallery__image';

const createGalleryMarkup = obj => {
  return obj.reduce(
    (acc, { preview, original, description }) =>
      acc +
      `<li class="${GALLERY_ITEM_CLASS}"><a class="${GALLERY_LINK_CLASS}" href="${original}"><img class="${GALLERY_IMAGE_CLASS}" src="${preview}" alt="${description}" data-source="${original}"></a></li>`,
    '',
  );
};

// создаем разметку по заданной коллекции и добавляем ее в дерево

const galleryMarkup = createGalleryMarkup(galleryData);

refs.galleryList.insertAdjacentHTML('beforeend', galleryMarkup);

// добавляем необходимые элементы в объект ссылок

refs.galleryItem = document.querySelector('.gallery__item');
refs.galleryImage = document.querySelector('.gallery__image');

// Реализация делегирования на галерее ul.js - gallery и получение url большого изображения.
// Открытие модального окна по клику на элементе галереи.
// Подмена значения атрибута src элемента img.lightbox__image.

refs.galleryList.addEventListener('click', onGalleryImageClick);

function onGalleryImageClick(event) {
  event.preventDefault();
  const target = event.target;
  const targetItem = target.closest(`.${GALLERY_ITEM_CLASS}`);

  // проверяем чтоб клик прошел по картинке а не мимо
  if (target.nodeName !== 'IMG') return;

  refs.backdrop.classList.add('is-open');

  // вешаем слушатели клавиатуры
  window.addEventListener('keydown', onKeyPressOnOpenModal);

  // вешаем активный класс на картинку которая открывается в модалке и подменяем src элемента img.lightbox__image (и alt)
  setModalImageSource(target);
  targetItem.classList.add('image-in-modal');
}

function setModalImageSource(el) {
  refs.imageInModalWindow.src = el.dataset.source;
  refs.imageInModalWindow.alt = el.alt;
}

// Закрытие модального окна по клику на кнопку button[data - action= "close-modal"].

refs.closeModalBtn.addEventListener('click', onCloseModal);

// Очистка значения атрибута src элемента img.lightbox__image.
// Это необходимо для того, чтобы при следующем открытии модального окна, пока грузится изображение, мы не видели предыдущее.
// снимаем активный класс, который используется для листания галлереи
// снимаем слушатели клавиатуры (они нужны только на открытой модалке)

function onCloseModal(event) {
  refs.backdrop.classList.remove('is-open');
  refs.imageInModalWindow.src = '';

  refs.galleryList
    .querySelectorAll('.gallery__item')
    .forEach(el => el.classList.remove('image-in-modal'));

  removeKeyListeners();
}

function removeKeyListeners() {
  window.removeEventListener('keydown', onEscKeyPress);
  window.removeEventListener('keydown', onRightArrowPress);
  window.removeEventListener('keydown', onLeftArrowPress);
}

// Закрытие модального окна по клику на div.lightbox__overlay.
// реализовано закрытие на ligthbox__content

refs.backdropContent.addEventListener('click', onBackdropClick);

function onBackdropClick(event) {
  if (event.target !== refs.imageInModalWindow) {
    onCloseModal();
  }
}

// Закрытие модального окна по нажатию клавиши ESC.
// Пролистывание изображений галереи в открытом модальном окне клавишами "влево" и "вправо".

// открытый элемент коллекции ловим через активный класс, который ставим при открытии модалки
// по соседям ходим через previousElementSibling и nextElementSibling

function onKeyPressOnOpenModal(e) {
  const ESC_KEY_CODE = 'Escape';
  const RIGHT_ARROW_KEY_CODE = 'ArrowRight';
  const LEFT_ARROW_KEY_CODE = 'ArrowLeft';

  const isEsc = ESC_KEY_CODE === e.code;
  if (isEsc) {
    onCloseModal();
  }

  if (e.code === RIGHT_ARROW_KEY_CODE) {
    // уходим от ошибки когда нет следующего элемента коллекции
    const currentItem = document.querySelector('.image-in-modal');
    if (currentItem === refs.galleryList.lastElementChild) return;
    //   выбираем следующий элемент коллекции, даем ему активный класс и присваиывем его scr на модалку
    const nextItem = currentItem.nextElementSibling;
    changeImage(currentItem, nextItem);
  }

  if (e.code === LEFT_ARROW_KEY_CODE) {
    const currentItem = document.querySelector('.image-in-modal');
    // уходим от ошибки когда нет предыдущего элемента коллекции
    if (currentItem === refs.galleryList.firstElementChild) return;
    //   выбираем предыдущий элемент коллекции, даем ему активный класс и присваиывем его scr на модалку
    const nextItem = currentItem.previousElementSibling;
    changeImage(currentItem, nextItem);
  }
}

function changeImage(currActiveItem, nextActiveItem) {
  const nextImage = nextActiveItem.querySelector('.gallery__image');
  setModalImageSource(nextImage);
  currActiveItem.classList.remove('image-in-modal');
  nextActiveItem.classList.add('image-in-modal');
}
