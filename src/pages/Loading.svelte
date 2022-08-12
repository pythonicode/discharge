<div class="flex items-center justify-center w-full h-full">
  <ul class="loader">
    <li class="center" />
    <li class="item item-1" />
    <li class="item item-2" />
    <li class="item item-3" />
    <li class="item item-4" />
    <li class="item item-5" />
    <li class="item item-6" />
    <li class="item item-7" />
    <li class="item item-8" />
  </ul>
</div>

<style lang="sass">

// Loader vars
$loader-size: 40px
$loader-color: #3B82EC
$loader-time: 3s
$loader-delay: 0s

// Items vars
$item-size: 10px
$item-rotation: 0deg
    
.loader
  position: absolute
  width: $loader-size
  height: $loader-size
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  .center
    width: $loader-size
    height: $loader-size
    background: $loader-color
    border-radius: 50%
    animation: center $loader-time ease-in-out infinite
  .item
    position: absolute
    width: $item-size
    height: $item-size
    top: calc(($loader-size - $item-size) / 2)
    left: 0
    right: 0
    margin: auto
    background: $loader-color
    border-radius: 50%
    
@for $i from 1 through 8
  $loader-delay: $loader-delay + 0.2
  $item-rotation: $item-rotation + 45
  .item-#{$i}
    animation: anim-#{$i} $loader-time ease-in-out infinite $loader-delay
    animation-fill-mode: backwards
  @keyframes anim-#{$i}
    0%, 60%, 100%
      transform: rotate($item-rotation) translateX($loader-size) scale(1)
    10%, 50%
      transform: rotate($item-rotation) translateX(0) scale(1.5)

@keyframes center
  0%, 10%, 90%, 100%
    transform: scale(0.7)
  45%, 55%
    transform: scale(1)

</style>
