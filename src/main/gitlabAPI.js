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
            const { file, fileUrl } = data || {};
            if (!file && !fileUrl) {
                throw new Error("No file data provided.");
            }

            const formData = new FormData();

            if (file) {
                // Handle direct file upload
                const fileBuffer = Buffer.from(file.buffer);
                formData.append('file', fileBuffer, { filename: file.name, contentType: file.type });
            } else {
                // Handle fileUrl download
                try {
                    const downloadResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const fileBuffer = Buffer.from(downloadResponse.data);

                    let filename;
                    const contentDisposition = downloadResponse.headers['content-disposition'];

                    // Extract filename from Content-Disposition header
                    if (contentDisposition) {
                        const parts = contentDisposition.split(';');
                        for (let part of parts) {
                            part = part.trim();
                            if (part.startsWith('filename*=')) {
                                const filenamePart = part.split('filename*=')[1];
                                const [encoding, ...filenamePieces] = filenamePart.split("''");
                                filename = decodeURIComponent(
                                    filenamePieces.join("''")
                                );
                                break;
                            } else if (part.startsWith('filename=')) {
                                const filenamePart = part.split('filename=')[1];
                                filename = filenamePart.replace(/^["']|["']$/g, '');
                                break;
                            }
                        }
                    }

                    // Fallback to extracting filename from URL
                    if (!filename) {
                        const parsedUrl = new URL(fileUrl);
                        filename = parsedUrl.pathname.split('/').pop() || 'uploaded_file';
                    }

                    // Determine content type from headers or default
                    const contentType = downloadResponse.headers['content-type'] || 'application/octet-stream';

                    formData.append('file', fileBuffer, {
                        filename: filename,
                        contentType: contentType
                    });
                } catch (error) {
                    throw new Error(`Failed to download file from URL: ${error.message}`);
                }
            }

            response = await gitlabAPI.post(path, formData, {
                headers: {
                    ...formData.getHeaders(),
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