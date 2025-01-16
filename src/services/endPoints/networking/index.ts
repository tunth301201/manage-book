import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default AxiosInstance;
