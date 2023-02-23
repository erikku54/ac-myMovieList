const BASE_URL="https://webdev.alphacamp.io/";
const POSTER_URL=BASE_URL+"posters/";
const STORAGE_KEY="favorite";

const cardrow=document.querySelector("#card-row");
const moviemodal=document.querySelector("#movie-modal");



const favorite=JSON.parse(localStorage.getItem(STORAGE_KEY))||[];
renderMovies(favorite);

console.log(favorite);




cardrow.addEventListener("click", function onPanelClick(event){

    if(event.target.matches(".btn-show-movie")){
        console.log(event.target.dataset.index);

        axios.get(INDEX_URL+event.target.dataset.index).then((response)=>{

            const title=moviemodal.querySelector("#movie-modal-title");
            const poster=moviemodal.querySelector("#movie-modal-poster");
            const date=moviemodal.querySelector("#movie-modal-date");
            const description=moviemodal.querySelector("#movie-modal-description");

            title.textContent=response.data.results.title;
            poster.setAttribute("src", POSTER_URL+response.data.results.image);
            date.textContent=`release date: ${response.data.results.release_date}`;
            description.textContent=response.data.results.description;

        }).catch((err)=>console.log(err));
    }else if (event.target.matches(".btn-remove-from-favorite")){

        const id=Number(event.target.dataset.index);


        removeFromFavorite(id);
    }
})


function removeFromFavorite(id){

    if (!favorite||!favorite.length) return;

    const index=favorite.findIndex((item)=>item.id === id)

    if (index === -1) return ;
    
    favorite.splice(index,1);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(favorite));
    renderMovies(favorite);
}

function renderMovies(movies){

    cardrow.innerHTML="";

    for (let movie of movies){

        const newcard=document.createElement('div');
        newcard.classList.add('card', 'col-sm-3', 'm-3');
        newcard.style="width: 18rem;";
    
        newcard.innerHTML=`<img src="${POSTER_URL+movie.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <a href="#" class="btn btn-primary btn-show-movie" data-index="${movie.id}"  data-bs-toggle="modal" data-bs-target="#movie-modal">More</a>
          <a href="#" class="btn btn-primary bg-danger border-0 btn-remove-from-favorite" data-index="${movie.id}">X</a>
        </div>`;
    
        cardrow.appendChild(newcard);
    }
}