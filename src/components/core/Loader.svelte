<div class="flex items-center justify-center grow">
  <div class="dot-pulse" />
</div>

<style>
  /**
 * ==============================================
 * Dot Pulse
 * ==============================================
 */
  .dot-pulse {
    position: relative;
    left: -9999px;
    width: 8px;
    height: 8px;
    border-radius: 5px;
    background-color: #f2f2f2;
    color: #f2f2f2;
    box-shadow: 9999px 0 0 -5px #f2f2f2;
    animation: dotPulse 1.5s infinite linear;
    animation-delay: 0.25s;
  }

  .dot-pulse::before,
  .dot-pulse::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    width: 8px;
    height: 8px;
    border-radius: 5px;
    background-color: #f2f2f2;
    color: #f2f2f2;
  }

  .dot-pulse::before {
    box-shadow: 9984px 0 0 -5px #f2f2f2;
    animation: dotPulseBefore 1.5s infinite linear;
    animation-delay: 0s;
  }

  .dot-pulse::after {
    box-shadow: 10014px 0 0 -5px #f2f2f2;
    animation: dotPulseAfter 1.5s infinite linear;
    animation-delay: 0.5s;
  }

  @keyframes dotPulseBefore {
    0% {
      box-shadow: 9984px 0 0 -5px #f2f2f2;
    }
    30% {
      box-shadow: 9984px 0 0 2px #f2f2f2;
    }
    60%,
    100% {
      box-shadow: 9984px 0 0 -5px #f2f2f2;
    }
  }

  @keyframes dotPulse {
    0% {
      box-shadow: 9999px 0 0 -5px #f2f2f2;
    }
    30% {
      box-shadow: 9999px 0 0 2px #f2f2f2;
    }
    60%,
    100% {
      box-shadow: 9999px 0 0 -5px #f2f2f2;
    }
  }

  @keyframes dotPulseAfter {
    0% {
      box-shadow: 10007px 0 0 -5px #f2f2f2;
    }
    30% {
      box-shadow: 10007px 0 0 2px #f2f2f2;
    }
    60%,
    100% {
      box-shadow: 10007px 0 0 -5px #f2f2f2;
    }
  }
</style>
