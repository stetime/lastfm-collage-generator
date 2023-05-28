const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

const form = document.querySelector('#collage')

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const username = event.target.username.value
  const duration = event.target.duration.value
  const response = await fetch(`/api/${username}/${duration}`)
  if (response.status === 404) {
    showErrorMessage('404: no such user')
    return
  }
  const data = await response.json()
  if (!data.b64) {
    showErrorMessage(`No listening data for ${username} for that time period`)
    return
  }
  const blob = b64toBlob(data.b64, 'image/jpeg')
  const collageUrl = URL.createObjectURL(blob)
  window.location.href = collageUrl
})

const showErrorMessage = (message) => {
  const formContainer = document.querySelector('#footer')
  const error = document.createElement('p')
  const node = document.createTextNode(message)
  error.appendChild(node)
  error.classList.add('error_text')
  formContainer.appendChild(error)
  setTimeout(() => {
    formContainer.removeChild(error)
  }, 5000)
}
