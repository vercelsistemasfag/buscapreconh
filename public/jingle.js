const audio = document.querySelector('#jingle-audio')
const play = document.querySelector('#jingle-play')
const mute = document.querySelector('#jingle-mute')
const progress = document.querySelector('#jingle-progress')
const time = document.querySelector('#jingle-time')
const error = document.querySelector('#jingle-error')
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function updateProgress() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0
  progress.disabled = duration <= 0
  progress.max = duration || 100
  progress.value = audio.currentTime
  time.textContent = formatTime(audio.currentTime)
  progress.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)} de ${formatTime(duration)}`)
}

function updatePlay() {
  const playing = !audio.paused && !audio.ended
  play.classList.toggle('is-playing', playing)
  play.setAttribute('aria-label', playing ? 'Pausar jingle' : 'Reproduzir jingle')
}

play.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause()
    return
  }
  error.hidden = true
  try {
    if (audio.error) audio.load()
    await audio.play()
  } catch {
    error.hidden = false
    updatePlay()
  }
})
progress.addEventListener('input', () => {
  if (Number.isFinite(audio.duration)) audio.currentTime = Number(progress.value)
  updateProgress()
})
mute.addEventListener('click', () => { audio.muted = !audio.muted })
audio.addEventListener('volumechange', () => {
  mute.setAttribute('aria-pressed', String(audio.muted))
  mute.setAttribute('aria-label', audio.muted ? 'Ativar som do jingle' : 'Silenciar jingle')
})
for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'ended']) audio.addEventListener(event, updateProgress)
for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, updatePlay)
audio.addEventListener('error', () => { error.hidden = false; updatePlay() })
document.querySelector('#jingle-controls').hidden = false
updateProgress()
updatePlay()
