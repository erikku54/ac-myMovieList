//變數宣告
const BASE_URL="https://webdev.alphacamp.io/";
const INDEX_URL=BASE_URL+"api/movies/"
const POSTER_URL=BASE_URL+"posters/";
const STORAGE_KEY="favorite";
const STORAGE_KEY_2="layout-type";
const MOVIES_PER_PAGE=12

const movies=[];
let filteredMovies=[];
const favorite=JSON.parse(localStorage.getItem(STORAGE_KEY))||[];
let layoutType=localStorage.getItem(STORAGE_KEY_2)||"cards";  //"cards" or "list"

const searchForm=document.querySelector("#search-form");
const inputKeyword=document.querySelector('input#keyword');
const divLayoutSwitch=document.querySelector('div#layout-switch');

const cardrow=document.querySelector("#card-row");
const moviemodal=document.querySelector("#movie-modal");
const ulPage=document.querySelector("#page-ul");


//主程式區段
axios.get(INDEX_URL).then((response)=>{

    movies.push(...response.data.results);
    console.log(movies);

    renderPages(movies.length);
    goToPage(1);

}).catch((err)=>console.log(err));




//動作：切換頁碼
ulPage.addEventListener("click",(event)=>{

    if(event.target.tagName!=='A') return;

    goToPage(event.target.textContent);


});


//動作：切換排列樣式
divLayoutSwitch.addEventListener('click',(event)=>{

    if (event.target.tagName!=="I") return;

    if (event.target.matches(".fa-th")){

        switchLayoutType("cards");
    }
    else{

        switchLayoutType("list");
    }
})


//動作：搜尋（篩選）
searchForm.addEventListener("submit",function onSearchFormSubmitted(event){

    event.preventDefault();
    const keyword=inputKeyword.value.trim().toLowerCase();

    // if(!keyword.length){
    //     inputKeyword.value="";
    //     return alert("請輸入有效字串");
    // }


    filteredMovies=movies.filter((movie)=>movie.title.toLowerCase().includes(keyword));

    inputKeyword.value="";
    if(!filteredMovies.length){
        return alert(`你輸入的關鍵字${keyword}無符合電影～！`);
    }

    renderPages(filteredMovies.length);
    goToPage(1);

    //renderCards(filteredMovies);

});

//動作：顯示Detail資訊（modal) & 加入/移除最愛
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
    }else if (event.target.matches("a.btn-add-to-favorite, i.fa-plus")){

        const btn=event.target.matches('i.fa-plus')? event.target.parentElement:event.target;

        const id=Number(btn.dataset.index);
        addTofavorite(id);

        btn.style="display:none;"
        btn.nextElementSibling.removeAttribute('style');

        console.log(favorite);

    }else if (event.target.matches("a.btn-remove-from-favorite, i.fa-check")){

        const btn=event.target.matches('i.fa-check')? event.target.parentElement:event.target;

        const id=Number(btn.dataset.index);
        removeFromFavorite(id);

        btn.style="display:none;"
        btn.previousElementSibling.removeAttribute('style');

        console.log(favorite);
    }
})




//函式：以卡片形式渲染資料
function renderCards(movies){

    cardrow.innerHTML="";

    for (let movie of movies){

        const newcard=document.createElement('div');
        newcard.classList.add('card', 'col-sm-3', 'm-3');
        newcard.style="width: 18rem;";
    
        newcard.innerHTML=`<img src="${POSTER_URL+movie.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <a href="#" class="btn btn-secondary btn-show-movie" data-index="${movie.id}"  data-bs-toggle="modal" data-bs-target="#movie-modal">More</a>
          <a class="btn btn-info text-white btn-add-to-favorite" data-index="${movie.id}"><i class="fa-solid fa-plus"></i></a>
          <a class="btn btn-success text-white btn-remove-from-favorite" style="display:none" data-index="${movie.id}"><i class="fa-solid fa-check fa-sm"></i></a>
          </div>`;
    
        cardrow.appendChild(newcard);
    }
}

//函式：以清單形式渲染頁面
function renderList(movies){

    cardrow.innerHTML="";

    for (let movie of movies){
    
        cardrow.innerHTML+=`<div class="d-flex justify-content-between align-items-center p-1">
        <h5 class="card-title">${movie.title}</h5>
        <a href="#" class="btn btn-secondary ms-sm-auto btn-show-movie " data-index="${movie.id}"  data-bs-toggle="modal" data-bs-target="#movie-modal">More</a>
        <a class="btn btn-info text-white mx-sm-2 btn-add-to-favorite" data-index="${movie.id}"><i class="fa-solid fa-plus"></i></a> 
        <a class="btn btn-success text-white mx-sm-2 btn-remove-from-favorite" style="display:none" data-index="${movie.id}"><i class="fa-solid fa-check fa-sm"></i></a>
      </div>
      <hr>`;
    
    }

}


//函式：切換排列樣式
function switchLayoutType(type){

    if(layoutType===type) return;

    //找到當前頁號
    const currentPage=Number(ulPage.querySelector('li.active').textContent);

    layoutType=type;
    localStorage.setItem(STORAGE_KEY_2,layoutType);

    goToPage(currentPage);

    return;
}

//函式：渲染頁碼區
function renderPages(moviesNum){

    let count=Math.ceil(moviesNum/MOVIES_PER_PAGE);

    ulPage.innerHTML='';
    for (let i=1;i<=count;i++){

        ulPage.innerHTML+=`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
    }

}

//函式：找到某頁的電影清單
function getMoviesByPages(page){

    const start=(page-1)*MOVIES_PER_PAGE;
    const end=start+MOVIES_PER_PAGE;

    return filteredMovies.length? filteredMovies.slice(start,end):movies.slice(start,end);
}

//函式：切換頁碼
function goToPage(page){

    //切換將目前的頁碼以高亮顯示
    const lis=ulPage.querySelectorAll('li');

    for (let i=0;i<lis.length;i++){

        if(i==page-1){
            lis[i].classList.add("active");
            lis[i].setAttribute("aria-current","page")

        }else{
            lis[i].classList.remove("active");
            lis[i].removeAttribute("aria-current");
        }
    }


    //根據layoutType內容決定何種顯示模式
    const iFath=document.querySelector('div#layout-switch .fa-th');
    const iFabars=document.querySelector('div#layout-switch .fa-bars');

    if (layoutType==="cards"){

        iFath.classList.add('bg-info');
        iFabars.classList.remove('bg-info');
        renderCards(getMoviesByPages(page));
    }else{

        iFath.classList.remove('bg-info');
        iFabars.classList.add('bg-info');        
        renderList(getMoviesByPages(page));
    }



    //根據是否在我的最愛清單中決定切換我的最愛按鈕形式
    const aBtnAdd=Array.from(document.querySelectorAll('.btn-add-to-favorite'));
    const aBtnRemove=Array.from(document.querySelectorAll('.btn-remove-from-favorite'));

    for (let movie of favorite){
        const targetBtnAdd = aBtnAdd.find((btn)=>(Number(btn.dataset.index) === movie.id));
        const targetBtnRemove = aBtnRemove.find((btn)=>(Number(btn.dataset.index) === movie.id));

        if((targetBtnAdd!==undefined)||(targetBtnRemove!==undefined)){      
            targetBtnAdd.style="display:none;";
            targetBtnRemove.removeAttribute('style');
        }
    }
}



//函式：加至最愛
function addTofavorite(id){


    if (favorite.some((item)=>item.id===id)){

        return alert("此電影已在收藏清單中");

    }

    const newFavorite=movies.find((item)=>item.id === id);
    favorite.push(newFavorite);

    localStorage.setItem(STORAGE_KEY,JSON.stringify(favorite));
    
    // console.log(favorite);

}

//函式：移除最愛
function removeFromFavorite(id){

    const targetIndex=favorite.findIndex((item)=>item.id === id);

    if(targetIndex===-1){

        return alert("此電影已不在收藏清單中");   
    }else{

        favorite.splice(targetIndex,1);
    }

    localStorage.setItem(STORAGE_KEY,JSON.stringify(favorite));
}





// function addcard(index, movie){
//     // const cardList=document.querySelector(listSelector);
//     // let row=cardList.lastElementChild;

//     // if(row === null || row.childElementCount >= 4){

//     //     const newrow=document.createElement('div');
//     //     newrow.classList.add('row');
//     //     cardList.appendChild(newrow);

//     //     row=newrow;
//     // }


//     const newcard=document.createElement('div');
//     newcard.classList.add('card', 'col-sm-3', 'm-3');
//     newcard.style="width: 18rem;";

//     newcard.innerHTML=`<img src="${POSTER_URL+movie.image}" class="card-img-top" alt="Movie Poster">
//     <div class="card-body">
//       <h5 class="card-title">${movie.title}</h5>
//       <a href="#" class="btn btn-primary btn-show-movie" data-index="${movie.id}"  data-bs-toggle="modal" data-bs-target="#movie-modal">More</a>
//       <a href="#" class="btn btn-primary bg-info border-0">+</a>
//     </div>`;

//     cardrow.appendChild(newcard);
// }
