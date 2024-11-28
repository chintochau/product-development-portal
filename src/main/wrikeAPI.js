import axios from "axios";
import FormData from "form-data";
// GitLab API base URL
const BASE_URL = 'https://www.wrike.com/api/v4';
const ACCESS_TOKEN = import.meta.env.VITE_WRIKE_ACCESS_TOKEN;


const wrikeAPI = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
    }
})


export const wrike = async (path, type, data) => {
    let response
    switch (type) {
        case "GET":
            response = await wrikeAPI.get(path);
            break;
        case "POST":
            response = await wrikeAPI.post(path, data);
            break;
        case "DELETE":
            response = await wrikeAPI.delete(path);
            break
        case "PUT":
            response = await wrikeAPI.put(path, data);
            break
        default:
            break;
    }
    return response.data;
}