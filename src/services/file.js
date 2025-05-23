import axios from 'axios'

const fileService = {
  async upload(file, type) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type) // 업로드 경로 지정: curators, members 등

    const response = await axios.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
  },
}

export default fileService
