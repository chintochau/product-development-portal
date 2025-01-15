const PRODUCT_PROJECTID = 61440508 //jasonfortesting
const SOVI_GROUP_ID = 17062603
const FIRMWARE_PROJECTID = 36518748
const IOS_PROJECTID = 34489453
const ANDROID_PROJECTID = 34489306
const DESKTOP_PROJECTID = 34489352
const FEATURES_PROJECTID = 36518895


export const getNameForProject = (id) => {
    switch (id) {
        case FIRMWARE_PROJECTID:
            return null
        case IOS_PROJECTID:
            return "iOS"
        case ANDROID_PROJECTID:
            return "Android"
        case DESKTOP_PROJECTID:
            return "Desktop"
        default:
            return null
    }
}

import yaml from "js-yaml"
import frontMatter from 'front-matter'


export const getProductsLog = async () => {
    const data = await window.api.gitlab(`projects/${PRODUCT_PROJECTID}/issues?labels=product&state=opened&per_page=100`, "GET");
    return data
}


export const createGitlabIssue = async (data, projectId = PRODUCT_PROJECTID) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues`, "POST", convertDataToTicketObject(data));
    return response
}


export const saveGitlabIssue = async (iid, data, projectId = PRODUCT_PROJECTID) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "PUT", convertDataToTicketObject(data));
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
    const { title, projectName, useLookup } = data
    const isProduct = useLookup || projectName
    const descriptionData = {
        ...data,
    }
    return {
        title: isProduct ? ("Product Initiation") : title,
        description: jsonToMarkdown(descriptionData),
        confidential: true,
        labels: [isProduct ? "product" : "type::feature"]
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
    const data = await window.api.gitlab(`groups/${SOVI_GROUP_ID}/epics?state=opened&per_page=100`, "GET");
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

export const getMilestones = async () => {
    const firmware = await window.api.gitlab(`projects/${FIRMWARE_PROJECTID}/milestones?per_page=100&state=active`, "GET");
    const ios = await window.api.gitlab(`projects/${IOS_PROJECTID}/milestones?per_page=100&state=active`, "GET");
    const android = await window.api.gitlab(`projects/${ANDROID_PROJECTID}/milestones?per_page=100&state=active&state=active`, "GET");
    const desktop = await window.api.gitlab(`projects/${DESKTOP_PROJECTID}/milestones?per_page=100&state=active&state=active`, "GET");
    const data = [...firmware, ...ios, ...android, ...desktop]
    return data
}

export const getFeaturesRequestsIssues = async (currentPage=0, per_page=20, projectId) => {
    const data = await window.api.gitlabWithHeaders(`projects/${FIRMWARE_PROJECTID}/issues?state=opened&labels=type::feature&page=${currentPage}&per_page=${per_page}`, "GET");
    return data
}

export const createFeatureRequestIssue = async (data) => {
    const response = await createGitlabIssue(data, FEATURES_PROJECTID)
    return response
}

export const updateFeatureRequestIssue = async (iid, data) => {
    const response = await saveGitlabIssue(iid, data, FEATURES_PROJECTID)
    return response
}