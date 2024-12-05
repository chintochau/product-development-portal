const PRODUCT_PROJECTID = 61440508 //jasonfortesting

const SOVI_GROUP_ID = 17062603
import yaml from "js-yaml"
import frontMatter from 'front-matter'


export const getProductsLog = async () => {
    const data = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues?labels=product&state=opened`, "GET");
    return data
}


export const createNewProductTicket = async (data) => {
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues`, "POST", convertDataToTicketObject(data));
    return response
}


export const saveTicket = async (iid, data) => {
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, "PUT", convertDataToTicketObject(data));
    return response
}

export const updateTicketDescription = async (iid, data) => {
    const description = jsonToMarkdown(data)
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, "PUT", {
        description
    });
    return response
}

// convert data to object for gitlab ticket
const convertDataToTicketObject = (data) => {
    const descriptionData = {
        ...data,
    }

    return {
        title: data.projectName + " Product Initiation",
        description: jsonToMarkdown(descriptionData),
        confidential: true,
        labels: ["product"]
    }
}

export const deleteTicket = async (iid) => {
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, "DELETE");
    return response
}


export const getProductLogWithIID = async (iid) => {
    const data = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}`, "GET");
    return data
}

const jsonToMarkdown = (data, message) => {
    const yamlContent = yaml.dump(data);
    const markdown = `---\n${yamlContent}---\n\n${message ? message : ""}`;
    return markdown;
};

export const ticketToJSON = (ticket) => {
    const { title, description, iid, epic, web_url, labels, created_at, updated_at } = ticket || {}
    const parsedData = frontMatter(description)
    return {
        ...parsedData.attributes,
        title,
        iid,
        epic,
        web_url,
        labels,
        created_at: created_at.split("T")[0],
        updated_at: updated_at.split("T")[0]
    }
}

export const getTicketsFromEpic = async (epicId) => {
    const data = await window.api.gitlab(`groups/${SOVI_GROUP_ID}/epics/${epicId}/issues?page=1&per_page=100`, "GET");
    return data
}

export const postNotesToTicket = async (iid, data, message) => {
    const {
        type, // type of comment,
        author, // author of comment
    } = data || {}
    const noteData = jsonToMarkdown(data, message)
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}/notes`, "POST", { body: noteData });
    return response
}

export const updateNotesToTicket = async (iid, noteId, data, message) => {
    const {
        type, // type of comment,
        author, // author of comment
    } = data || {}
    const noteData = jsonToMarkdown(data, message)
    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}/notes/${noteId}`, "PUT", { body: noteData });
    return response
}

export const getNotesFromTicket = async (iid) => {
    const data = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues/${iid}/notes?page=1&per_page=100`, "GET");
    return data
}

export const uploadPIFFile = async (iid, file) => {
    const fileBuffer = await file.arrayBuffer(); // Convert the file to an ArrayBuffer
    const fileData = {
        name: file.name, // File name
        type: file.type, // MIME type
        size: file.size, // File size
        buffer: Array.from(new Uint8Array(fileBuffer)), // Convert ArrayBuffer to an array
    };

    const response = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/uploads`, "UPLOAD", { file: fileData });
    return response;
}


export const getEpics = async () => {
    const data = await window.api.gitlab(`groups/${SOVI_GROUP_ID}/epics?state=opened`, "GET");
    return data
}


export const getUsers = async () => {
    const data = await window.api.gitlab(`/groups/${SOVI_GROUP_ID}/members?per_page=100`, "GET");
    return data
}

export const getGroupIssuesForDeveloper = async (developerId) => {
    const data = await window.api.gitlab(`groups/${SOVI_GROUP_ID}/issues?assignee_id=${developerId}&state=opened&per_page=100&labels=workflow:: 2 doing`, "GET");
    return data
}