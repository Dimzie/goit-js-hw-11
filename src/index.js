import './css/styles.css';
import ApiService from './api-pixabay';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';

Notify.init({
  position: 'right-top',
  width: '250px',
  cssAnimationStyle: 'zoom',
  showOnlyTheLastOne: true,
});

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  pagContainer: document.querySelector('#pagination'),
};

const apiService = new ApiService();

let totalHitsAmount = 0;
let pagPage = 1;

refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const lightBox = new SimpleLightbox('.gallery a');

function onSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  totalHitsAmount = 0;

  refs.loadMoreBtn.classList.add('is-hidden');

  refs.pagContainer.classList.add('is-hidden');

  if (e.target.elements.searchQuery.value === '') {
    Notify.failure(
      'Please, write a name of looking picture!');
    return;
  } else {
    apiService.formInput = e.target.elements.searchQuery.value.trim();
  }

  apiService.resetPage();

  apiService.fetchImgFunc().then(images => {
    console.log(images.data);
    if (images.data.hits.length === 0) {
      Notify.failure(
        'Sorry, wrong image search! Try another image.'
      );
    } else {
      refs.gallery.innerHTML = renderImageCards(images);

      totalHitsAmount += images.data.hits.length;

      lightBox.refresh();

      const pagination = new Pagination(refs.pagContainer, {
        totalItems: `${images.data.totalhits}`,
        itemsPerPage: `${apiService.perPage}`,
        visiblePages: 5,
        centerAlign: true,
      });
    
      pagination.reset(images.data.totalHits);
        
      pagination.on('beforeMove', e => {
        pagPage = e.pagPage;
        apiService.fetchImgFunc().then(images => {
          refs.gallery.innerHTML = renderImageCards(images);
          lightBox.refresh();
          goUp();
        });
      });
    
      refs.pagContainer.classList.remove('is-hidden');

      Notify.success(`Success! We found ${images.data.totalHits} images of ${refs.elements.searchQuery.value}.`);
    }
  });

  refs.form.reset();
}

async function onLoadMore() {
  try {
    await apiService
    .fetchImgFunc(images => {
      totalHitsAmount += images.data.hits.length;
      if (totalHitsAmount === images.data.totalHits) {
        renderImageCards(images);
      } else {
          refs.loadMoreBtn.classList.add('is-hidden');
          Notify.failure("We're sorry, but you've reached the end of search results.");  
      }
      
      refs.gallery.insertAdjacentHTML('beforeend', renderImageCards(images));

      lightBox.refresh();
    })
  } catch (error) {
    console.log(error.message);
  }
}

function goUp() {
  window.scroll(0, 0);
}

function renderImageCards(images) {
  const imageCards = images.data.hits
    .map(
      item => `<a href="${item.largeImageURL}"><div class="photo-card">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes: <span class="info-text">${item.likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views: <span class="info-text">${item.views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments: <span class="info-text">${item.comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads: <span class="info-text">${item.downloads}</span></b>
    </p>
  </div>
</div></a>`
    )
    .join('');

  return imageCards;
}