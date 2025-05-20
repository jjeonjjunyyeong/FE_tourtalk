import axios from 'axios'

const fileService = {
  async upload(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data 
  }
}

export default fileService