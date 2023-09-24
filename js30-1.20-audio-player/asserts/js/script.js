import { data } from "./data.js";
import { shuffle, toMinAndSec } from "./help.js";

const AudioControl = {

    state: {
        audios: [],
        current: {},
        playing: false,
        repeating: false,
        volume: 0.5
    },
    init(){
        this.initVariables();
        this.creatAudios();
        this.initEvent();
    },

    initVariables(){
        this.playButton = null;
        this.audiolist = document.querySelector('.items');
        this.currentItem = document.querySelector('.current');
        this.repeatButton = document.querySelector('.handling-repeat');
        this.volumeButton = document.querySelector('.controls-volume');
        this.shafflButton = document.querySelector('.handling-shuffle');
    },

    initEvent(){
        this.audiolist.addEventListener('click', this.handleItemClick.bind(this));
        this.repeatButton.addEventListener('click', this.handleRepeat.bind(this));
        this.volumeButton.addEventListener('change', this.handleVolume.bind(this));
        this.shafflButton.addEventListener('click',this.handleShaffle.bind(this));
    },

    handleShaffle(){
        const {children} = this.audiolist;
        const shuffled = shuffle([...children]);
        this.audiolist.innerHTML = "";
        shuffled.forEach((item) => this.audiolist.appendChild(item));
    },

    handleVolume( {target : { value }}){
        const {current} = this.state;
        this.state.volume = value;
        if(!current?.audio) return;
        current.audio.volume = value;
      },

    handleRepeat( { currentTarget}){
        const { repeating } =   this.state;

        currentTarget.classList.toggle('active', !repeating);
        this.state.repeating = !repeating;
    },

    handleAudioPlay(){
        const { playing, current} =this.state;
        const { audio } = current;

        !playing ? audio.play() : audio.pause();


        this.state.playing = !playing;
        this.playButton.classList.toggle("playing", !playing);
    },

    handleNext(){
        const {current} = this.state;
        const currentItem = document.querySelector(`[data-id="${current.id}"]`);
        const next = currentItem.nextSibling?.dataset;
        const first  = this.audiolist.firstElementChild?.dataset
        const itemId = next?.id || first?.id;
        if (!itemId) return;
        this.setCurrentItem(itemId);
    },

    handlePrev(){
        const {current} = this.state;
        const currentItem = document.querySelector(`[data-id="${current.id}"]`);
        const prev = currentItem.previousSibling?.dataset;
        const first = this.audiolist.lastChild?.dataset;
        const itemId = prev?.id || first?.id;
        if (!itemId) return;
        this.setCurrentItem(itemId);
    },

    handelPlayer(){
        const play = document.querySelector('.controls-play');
        const next = document.querySelector('.controls-next');
        const previous = document.querySelector('.controls-prev');
        this.playButton = play;
        play.addEventListener("click", this.handleAudioPlay.bind(this));
        next.addEventListener("click", this.handleNext.bind(this));
        previous.addEventListener("click", this.handlePrev.bind(this));
    },

    audioUpdateHandler({ audio, duration }){
        const progress = document.querySelector('.progress-current');
        const timeLIne = document.querySelector('.time-start');


        progress.addEventListener('input', (event) => {
            const newValue = event.target.value;
            const newTime = (newValue / 100) * duration;
            audio.currentTime = newTime;
            timeStart.textContent = toMinAndSec(newTime);
        });

        audio.addEventListener('timeupdate', ({target}) => {

            const {currentTime} = target;
            const width  = currentTime * 100/ duration;

            timeLIne.innerHTML = toMinAndSec(currentTime);
            if (this.state.playing) {
                progress.value = width;
            }
        })

        audio.addEventListener('ended', ({ target }) => {
            target.currentTime = 0;
            this.state.repeating? target.play() : this.handleNext();
        })

    },

    rederCurrentItem({link, track, year, group, duration } ) {
        const [image] = link.split(".");
        return `<div class="current-image"
        style="background-image: url(asserts/images/${image}.jpg);"></div>
        <div class="current-info">
            <div class="current-info__top">
                <div class="current-info__titles">
                    <h2 class="current-info__group">${group}</h2>
                    <h3 class="current-info__track">${track}</h3>
                </div>
                <div class="current-info__year">${year}</div>
            </div>
            <div class="controls">
                <div class="controls-buttons">
                    <button class="controls-button controls-prev">
                        <svg class="icon-arrow">
                            <use xlink:href="asserts/images/sprite.svg#arrow"></use>
                        </svg>
                    </button>
                    <button class="controls-button controls-play">
                        <svg class="icon-pause">
                            <use xlink:href="asserts/images/sprite.svg#pause"></use>
                        </svg>
                        <svg class="icon-play">
                            <use xlink:href="asserts/images/sprite.svg#play"></use>
                        </svg>
                    </button>
                    <button class="controls-button controls-next">
                        <svg class="icon-arrow">
                            <use xlink:href="asserts/images/sprite.svg#arrow"></use>
                        </svg>
                    </button>
                </div>
                <div class="controls-progress">
                    <input type="range" class="progress-current" min="0" max="100" step="0.01" value="0"  />
                    <div class="timeline">
                        <span class="time-start">00:00</span>
                        <span class="time-end">${toMinAndSec(duration)}</span>
                    </div>
                </div>
            </div>
        </div>`

    },

    pauseCurrentAudio(){
        const {current: {audio}} =this.state;
        if(!audio) return;
        audio.pause();
        audio.currentTime = 0;
    },

    togglePlaying(){
        const { playing, current } =this.state;
        const { audio } = current;
        playing ?  audio.play() : audio.pause();
        this.playButton.classList.toggle("playing", playing);
    },

    setCurrentItem(itemId){
        const current = this.state.audios.find(({id}) => +id === +itemId)
        if(!current) return;
        this.pauseCurrentAudio();
        this.state.current = current;
        this.currentItem.innerHTML = this.rederCurrentItem(current);
        current.audio.volume = this.state.volume; 
        this.audioUpdateHandler(current);
        this.handelPlayer();
        setTimeout(() => {
            this.togglePlaying()
        }, 10)
    },

    handleItemClick({target}){

        const {id} = target.dataset;

        if (!id) return;
        this.setCurrentItem(id);
    },

    loadAudioData(audio){
        const {id, link, track, group, genre,  duration } = audio;
        const toMinutes = (duration) =>{
            const minutes = formatTime(Math.floor(duration / 60)) ;
            const seconds = formatTime(Math.floor(duration-minutes * 60));
            return `${minutes}:${seconds}`
        }
        const formatTime = (time) => (time < 10 ? `0${time}`:time)
        const [image] = link.split('.');
        const item = `<div class="item" data-id="${id}">
                            <div class="item-image"
                            style="background-image: url(asserts/images/${image}.jpg);"></div>
                            <div class="item-titles">
                                <h2 class="item-group">${group}</h2>
                                <h3 class="item-track">${track}</h3>
                            </div>
                            <p class="item-duration">
                                ${toMinutes(duration)}
                            </p>
                            <p class="item-genre">
                                ${track}
                            </p>
                            <button class="item-play">
                                <svg class="icon-play">
                                    <use xlink:href="asserts/images/sprite.svg#play"></use>
                                </svg>
                            </button>
                        </div>`
        this.audiolist.innerHTML += item;
    },

    creatAudios(){
        data.forEach((item) => {
            const audio = new Audio(`./asserts/audio/${item.link}`)

            audio.addEventListener("loadeddata", () =>{
                const newItem = {...item, duration: audio.duration, audio}
                this.state.audios.push(newItem);
                this.loadAudioData(newItem);
            })
        })

    }
}

AudioControl.init();