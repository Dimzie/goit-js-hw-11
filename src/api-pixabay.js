import axios from 'axios';

export default class ApiService {
  constructor() {
    this.formInput = '';
    this.page = 1;
    this.perPage = 40;
}

async fetchImgFunc() {
    const API_KEY = '38965807-d601a08749052acceafe15189';
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${this.formInput}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=${this.perPage}`;

    const response = await axios.get(url);
    this.page += 1;
    return response;
}

get input() {
    return this.formInput;
}

set input(newFormInput) {
return (this.formInput = newFormInput);
}

resetPage() {
    this.page = 1;
  }
}