import axios from "axios";

// GitLab API base URL
const BASE_URL = 'https://gitlab.com/api/v4';

// Personal Access Token
const ACCESS_TOKEN = import.meta.env.VITE_GITLAB_ACCESS_TOKEN;

const gitlabAPI = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
    }  
})

export async function gitlabGet(path) {
    const response = await gitlabAPI.get(path);
    const res = response.data
    return res;
}