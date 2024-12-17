import axios from "axios";
import FormData from "form-data";
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
        case "UPLOAD":
            const { file } = data || {};
            if (!file) {
                throw new Error("No file data provided.");
            }

            // Reconstruct the file as a Buffer
            const fileBuffer = Buffer.from(file.buffer);
            const formData = new FormData();

            // Append the file with the correct filename and MIME type
            formData.append('file', fileBuffer, { filename: file.name, contentType: file.type });

            response = await gitlabAPI.post(path, formData, {
                headers: {
                    ...formData.getHeaders(), // Ensure proper multipart/form-data headers
                },
            });
            break;
        default:
            break;
    }
    const res = response?.data
    return res;
}

export const gitlabWithHeaders = async (path, type, data) => {
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
    return {
        data: response?.data,
        headers: response?.headers
    };
}