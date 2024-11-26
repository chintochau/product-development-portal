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

export const gitlab = async (path, type, data) => {
    let response
    switch (type) {
        case "GET":
            response = await gitlabAPI.get(path);
            break;
        case "POST":
            response = await gitlabAPI.post(path, data);
            break;
        case "DELETE":
            response = await gitlabAPI.delete(path);
            break
        case "PUT":
            response = await gitlabAPI.put(path, data);
            break
        default:
            break;
    }
    const res = response.data
    return res;
}