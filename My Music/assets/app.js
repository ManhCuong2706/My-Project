/**
 * 1. Render songs -> ok
 * 2. Scroll top -> ok
 * 3. Play / pause / seek -> ok
 * 4. CD rotate -> ok
 * 5. Next / previous ->ok
 * 6. Random -> ok
 * 7. Next / Repeat when ended -> ok
 * 8. Active song ->ok
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const playlist = $('.playlist');
const player = $('.player')
const cd =$('.cd');
const cdThumb = $('.cd-thumb');
const heading = $('header h2');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const progress = $('.progress_bar');
const progressBar = $('.progress_slider');
const currentMinutes =$('.current_minutes');
const currentSeconds =$('.current_seconds');
const durationMinutes = $('.duration_minutes');
const durationSeconds = $('.duration_seconds');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

var activeSong;
var loadingSong;
var pausingSong;

const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom: false,
    isRepeat: false,
    isLoading: false,
    songsPlayed:[],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            id: 1,
            name: 'Dance Monkey',
            singer: 'Tone and I',
            path: './assets/music/song-1.mp3',
            img: './assets/img/song-1.jpg'
        },
        {
            id: 2,
            name: 'Easy on me',
            singer: 'Adele',
            path: './assets/music/song-2.mp3',
            img: './assets/img/song-2.jpg'
        },
        {
            id: 3,
            name: 'Fake a Smile',
            singer: 'Alan Walker & Salem ilese',
            path: './assets/music/song-3.mp3',
            img: './assets/img/song-3.jpg'
        },
        {
            id: 4,
            name: 'Industry Baby',
            singer: 'Lil Nas X, Jack Harlow',
            path: './assets/music/song-4.mp3',
            img: './assets/img/song-4.jpg'
        },
        {
            id: 5,
            name: 'Need to know',
            singer: 'Doja Cat',
            path: './assets/music/song-5.mp3',
            img: './assets/img/song-5.jpg'
        },
        {
            id: 6,
            name: 'Senorita',
            singer: 'Shawn Mendes, Camila Cabello',
            path: './assets/music/song-6.mp3',
            img: './assets/img/song-6.jpg'
        },
        {
            id: 7,
            name: 'Stay',
            singer: 'The Kid LAROI, Justin Bieber',
            path: './assets/music/song-7.mp3',
            img: './assets/img/song-7.jpg'
        },
        {
            id: 8,
            name: 'Sweet Dreams',
            singer: 'Alan Walker & Imanbek',
            path: './assets/music/song-8.mp3',
            img: './assets/img/song-8.jpg'
        },
        {
            id: 9,
            name: 'When we were young ',
            singer: 'Adele',
            path: './assets/music/song-9.mp3',
            img: './assets/img/song-9.jpg'
        },
        {
            id: 10,
            name: 'Wrap me in plastic',
            singer: 'Chromance',
            path: './assets/music/song-10.mp3',
            img: './assets/img/song-10.jpg'
        },
    ],
    setConfig:function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb_wrap">
                        <div class='stroke-wrap  '>
                            <span class="stroke"></span>
                            <span class="stroke"></span>
                            <span class="stroke"></span>
                            <span class="stroke"></span>
                            <i class="fas fa-play play-icon "></i>
                        </div>
                        <div class='thumb ' style="background-image: url('${song.img}')">
                        </div>      
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })

        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        
        // CD rotate

        const cdThumbAnimation = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration:10000, // thời gian quay 10 seconds
            iterations: Infinity, // lặp lại vô hạn
        })

        // loader animate

        cdThumbAnimation.pause();
         
        // Resize CD when scrollTop
        const cdWidth = cd.offsetWidth;
        document.onscroll =() => {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Play button
        const _this = this;
        playBtn.onclick = () =>{
            if(_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
            
        }
        // When pause the song
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause();
            _this.isLoading = false;
            _this.addClassLoad();
            _this.addPlayIcon();
        }

        // When play the song

        audio.onplay= function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play();
            _this.isLoading = true;
            _this.addPlayIcon();
            _this.addClassLoad();
        }

        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = (audio.currentTime*100 / audio.duration);
                progressBar.style.width = progressPercent +'%';
                // Music timing 
                currentMinutes.innerHTML = Math.floor(audio.currentTime/60) < 10 ? "0" +Math.floor(audio.currentTime/60) : Math.floor(audio.currentTime/60);
                currentSeconds.innerHTML = Math.floor(audio.currentTime%60) < 10 ? "0" +Math.floor(audio.currentTime%60) : Math.floor(audio.currentTime%60);
                durationMinutes.innerHTML = Math.floor(audio.duration /60) < 10 ? "0" +Math.floor(audio.duration /60) : Math.floor(audio.duration /60);
                durationSeconds.innerHTML = Math.floor(audio.duration%60) < 10 ? "0" +Math.floor(audio.duration%60) : Math.floor(audio.duration%60);
            }
            
            console.log(audio.duration /60)
        }
        
        progress.onclick= function(e) {
            const seekTime = (e.offsetX/progress.offsetWidth)* audio.duration;
            audio.currentTime = seekTime;
            
        }
        // Next song
        nextBtn.onclick= function() {
            if(_this.isRandom) {
                _this.playRandom();
            }else {
                _this.nextSong();
            }
            _this.addClassActive();
            _this.addClassLoad();
            _this.scrollToActiveSong();
            audio.play();    
        }

        // Previous Song

        prevBtn.onclick= function() {
            if(_this.isRandom) {
                _this.playRandom();
            }else {
                _this.previousSong();
            }
            _this.addClassActive();
            _this.addClassLoad();
            _this.scrollToActiveSong();
            audio.play();
        }

        //Toggle Random Songs Button

        randomBtn.onclick =function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom);
        }
        // Toggle Repeat Song Button

        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        // Next Song when ended 

        audio.onended = function() {
            if(_this.isRepeat) {
                // audio.load();
                audio.play();
            }else {
                nextBtn.click();
            }
        }

        // Playlist listener events 
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionElement = e.target.closest('.option')
            if (songNode || optionElement) {
                if(songNode) {
                    _this.currentIndex =Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.addClassActive();
                    audio.play();
                }
            }
        }
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },
    playRandom: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() *this.songs.length); 
        }while ((this.songsPlayed.includes(newIndex) ));
        this.currentIndex = newIndex;
        this.inputSongsPlayed();
        this.loadCurrentSong();
    },
    inputSongsPlayed : function () {
        if(this.songsPlayed.length < this.songs.length-1) {
            this.songsPlayed.push(this.currentIndex)
        }else {
            this.songsPlayed = [];
            this.songsPlayed.push(this.currentIndex);
        }
        console.log(this.songsPlayed);
    },
    nextSong : function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length ){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    previousSong : function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = (this.songs.length -1);
        }
        this.loadCurrentSong();
    },
    addClassActive : function() {
        const listSongDetails = $$('.song');
        listSongDetails.forEach((song) => {
            song.classList.remove('active');

        })
        console.log(listSongDetails);
        activeSong =  listSongDetails[this.currentIndex];
        activeSong.classList.add('active');
        console.log(activeSong)
    },
    addClassLoad : function() {
        const strokers = $$('.stroke-wrap');
        strokers.forEach((stroke) => {
            stroke.classList.remove('loader');
        })
        if(this.isLoading) {
            loadingSong = strokers[this.currentIndex];
            loadingSong.classList.add('loader');
        }
    },
    addPlayIcon : function() {
        const playIcons = $$('.play-icon');
        
        playIcons.forEach((icon) => {
            icon.classList.remove('active');
        })
        if(!this.isPlaying) {
            pausingSong = playIcons[this.currentIndex];
            pausingSong.classList.add('active');
        }
       
    },
    scrollToActiveSong: function() {
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'nearest'
            });
        },300)
    },

    start : function() {
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // lắng nge / xử lý các sự kiện
        this.handleEvents();

        // load bài hát hiện tại vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();
    }
}

app.start();