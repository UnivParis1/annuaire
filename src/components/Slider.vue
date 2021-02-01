<template>
<div class="Slider" v-if="slides">
  <ul class="slides"
       :style="{ 'animation-name': forceSlide === null ? `slidy${nb}` : '',
                 'animation-duration': `${nb * slide_duration}s`,
                 width: `${100 * (nb+1)}%`,
                 left: `-${(forceSlide || 0) * 100}%`, }">
	<li v-for="(slide, i) in [ ...slides, slides[0] ]"
       :style="{ width: `${100 / (nb+1)}%` }">

        <a class="flex-direction-nav flex-prev" @click="forceSlide = (i-1+nb) % nb">Previous</a>

		<img :src="slide.img" alt=""/>
		<div class="flex-caption" v-html="slide.html"></div>
        
        <a class="flex-direction-nav flex-next" @click="forceSlide = (i+1) % nb">Next</a>
	</li>
  </ul>
</div>
</template>

<script>
import { ref, computed } from '@vue/composition-api';

export default {
  props: [ 'slides', 'slide_duration' ],
  setup(props) { return {
      forceSlide: ref(null),
      nb: computed(() => props.slides.length),
  } },
};
</script>

<style>
.Slider {
     overflow: hidden;
     position: relative;
}

.Slider .slides {
      position: relative;
      padding: 0;
      animation-iteration-count: infinite;
}
.Slider .slides:hover {
    animation-play-state: paused;
}

.Slider .slides > li {
    float: left;
    display: flex; /* contexte sur le parent */
}

.flex-direction-nav {
    width: 30px;
    height: 30px;
    margin: auto 1rem;
    background: url(../../public/images/bg_direction_nav.png) no-repeat 0 0;
    text-indent: -9999px;
    
    cursor: pointer;
    opacity: 0.2;
}
.flex-direction-nav.flex-next {
    background-position: 100% 0;
}

@keyframes slidy2 {
      0% { left:    0%; }
     40% { left:    0%; }
     50% { left: -100%; }
     90% { left: -100%; }
    100% { left: -200%; }
}
@keyframes slidy3 {
      0% { left:    0%; }
     27% { left:    0%; }
     33% { left: -100%; }
     60% { left: -100%; }
     66% { left: -200%; }
     93% { left: -200%; }
    100% { left: -300%; }
}
@keyframes slidy4 {
      0% { left:    0%; }
     20% { left:    0%; }
     25% { left: -100%; }
     45% { left: -100%; }
     50% { left: -200%; }
     70% { left: -200%; }
     75% { left: -300%; }
     95% { left: -300%; }
    100% { left: -400%; }
}
@keyframes slidy5 {
      0% { left:    0%; }
     16% { left:    0%; }
     20% { left: -100%; }
     36% { left: -100%; }
     40% { left: -200%; }
     56% { left: -200%; }
     60% { left: -300%; }
     76% { left: -300%; }
     80% { left: -400%; }
     96% { left: -400%; }
    100% { left: -500%; }
}

</style>