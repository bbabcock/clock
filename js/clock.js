// Wait until DOM is loaded
document.addEventListener('DOMContentLoaded', e => {
  // Some state managment variables
  let alarmFormIsOpen = false
  let alarmRunning = false
  let clockTick = null
  let alarms = []

  // Audio
  let audioElement = new Audio('assets/audio/alarm-buzz.mp3')

  // DOM elements
  const body = document.querySelector('body')
  const form = document.querySelector('#alarm-form')
  const input = document.querySelector('#alarm')

  // Get a count of the number segments for the clock
  const numberSegmentCount = 6

  // Get the DOM element
  const clock = document.querySelector('.clock')

  // Creates the layout for order in which the number lines are drawn
  const numberSegmentTemplate = ['top', 'right', 'right', 'bottom', 'left', 'middle', 'left']

  // Full text version of numbers 0-9
  const textNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

  const addLeadingZero = n => {
    return n < 10 ? '0'+ n : ''+ n
  }

  const nonMilitary = n => {
    return n % 12 || (n == '00' ? 12 : n % 12)
  }

  // Get the current time
  const getTheTime = (h, m, s) => {
    const segments = []
    for (let i = 0; i < numberSegmentCount; i++) {
      segments.push(document.querySelector('.number_'+ i))
    }

    const numberSegmentClasses = textNumbers.map(str => 'display-'+ str)
    segments.map(segment => segment.classList.remove(...numberSegmentClasses))

    let charAtIdx = 0
    segments.forEach((seg, idx) => {
      let c = h.charAt(charAtIdx)
      if (idx < 2) {
        c = h.charAt(charAtIdx)
      } else if (idx >= 2 && idx < 4) {
        c = m.charAt(charAtIdx)
      } else if (idx >= 4 && idx < 6) {
        c = s.charAt(charAtIdx)
      }

      if (textNumbers[c] !== undefined) {
        seg.classList.add('display-'+ textNumbers[c])
      }
      charAtIdx = !charAtIdx ? 1 : 0
    })
  }

  // Loop through the numberSegments
  for (let i = 0; i < numberSegmentCount; i++) {
    const n = document.createElement('div')
    n.setAttribute('class', 'number number_'+ i)

    numberSegmentTemplate.forEach((tmpl, tmplIdx) => {
      let tmpSVG = clockPieces[tmpl].svg
      tmpSVG = tmpSVG.replace('class="', 'class="pos'+ tmplIdx +' ')
      n.innerHTML += tmpSVG
    })

    clock.appendChild(n)
  }

  // Update the time
  const setClock = () => {
    clockTick = setInterval(() => {
      const date = new Date()
      let hours = addLeadingZero(nonMilitary(date.getHours()))
      let minutes = addLeadingZero(date.getMinutes())
      let seconds = addLeadingZero(date.getSeconds())

      getTheTime(hours, minutes, seconds)
      if (alarms.length > 0) {
        document.querySelector('.set-alarm').classList.add('alarm-is-set')

        alarms.forEach((a, idx) => {
          let aHours = addLeadingZero(a.split(':')[0])
          let aMin = addLeadingZero(a.split(':')[1])
          if (aHours +':'+ aMin === hours +':'+ minutes && !alarmRunning) {
            soundAlarm(idx)
          }
        })
      } else {
        document.querySelector('.set-alarm').classList.remove('alarm-is-set')
      }
    }, 1000)
  }

  const soundAlarm = (idx) => {
    alarmRunning = true
    body.classList.add('alarming')

    // Play sound
    audioElement.play()

    let snooze = document.querySelector('.snooze')
    snooze.setAttribute('alarmidx', idx)
    snooze.addEventListener('click', onSnooze)
  }

  const onSnooze = e => {
    body.classList.remove('alarming')
    audioElement.pause()
    e.target.removeEventListener('click', onSnooze)

    alarms.splice(e.target.getAttribute('alarmidx'), 1)
  }

  const closeAlarmForm = () => {
    alarmFormIsOpen = false
    input.setAttribute('disabled', 'disabled')

    // Hide the form
    form.style = 'display:none;'

    // Restart the clock
    setClock()

    // Clear the input
    input.value = ''
  }

  // Click handle for alarm button
  document.querySelector('.set-alarm').addEventListener('click', () => {
    if (!alarmFormIsOpen) {
      alarmFormIsOpen = true
      // Stop the clock
      clearInterval(clockTick)

      // Set base time
      getTheTime('00', '00', '00')

      // Show the form
      form.style = 'display:block;'
      input.removeAttribute('disabled')
      input.addEventListener('input', e => {
        let value = e.target.value
        let parsed = value.split(':')
        let hours = addLeadingZero(parsed[0]) || '00'
        let minutes = addLeadingZero(parsed[1]) || '00'
        let seconds = '00'

        // Make sure there is a value when the form submits
        e.target.value = value

        // Set the time as the user types
        getTheTime(hours, minutes, seconds)
      })
    } else {
      closeAlarmForm()
    }
  })

  // Handle form submission
  form.addEventListener('submit', e => {
    e.preventDefault()
    alarms.push(input.value)

    closeAlarmForm()
  })

  // Start the clock
  setClock()
})