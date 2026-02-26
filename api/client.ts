import axios from 'axios'

const REQUEST_TIMEOUT = 15_000

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: REQUEST_TIMEOUT,
})
