const projectId = 61440508 //jasonfortesting
const SOVI_GROUP_ID = 17062603
import yaml from "js-yaml"
import frontMatter from 'front-matter'


export const getProductsLog = async () => {
    const data = await window.api.gitlab(`projects/${projectId}/issues?labels=product&state=opened`, "GET");
    return data
}

export const createNewProductTicket = async (data) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues`, "POST", convertDataToTicketObject(data));
    return response
}


export const saveTicket = async (iid, data) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "PUT", convertDataToTicketObject(data));
    return response
}

// convert data to object for gitlab ticket
const convertDataToTicketObject = (data) => {
    const { productcode, productname, description, releasedate } = data || {}
    const descriptionData = {
        ...data,
        epicLink: "https://gitlab.com/groups/lenbrook/sovi/-/epics/70",
        softwareSignoff: false,
        softwareSignoffBy: "",
        softwareSignoffDate: "2024-08-28",
        hardwareSignoff: false,
        hardwareSignoffBy: "",
        hardwareSignoffDate: "2024-08-27",
        status: "initiated",
    }

    return {
        title: data.productcode + " Product Initiation",
        description: jsonToMarkdown(descriptionData),
        confidential: true,
        labels: ["product"]
    }
}

export const deleteTicket = async (iid) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "DELETE");
    return response
}


export const getProductLogWithIID = async (iid) => {
    const data = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "GET");
    return data
}

const jsonToMarkdown = (data,message) => {
    const yamlContent = yaml.dump(data);
    const markdown = `---\n${yamlContent}---\n\n${message}`;
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

export const getPIFFielsFromComments = async (iid) => {
    const data = await window.api.gitlab(`projects/${projectId}/issues/${iid}/notes`, "GET");
    return data
}

export const postNotesToTicket = async (iid, data, message) => {
    const {
        type, // type of comment,
        author, // author of comment
    } = data || {}
    const noteData = jsonToMarkdown(data, message)
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}/notes`, "POST", { body: noteData });
    return response
}

export const getNotesFromTicket = async (iid) => {
    const data = await window.api.gitlab(`projects/${projectId}/issues/${iid}/notes?page=1&per_page=100`, "GET");
    return data
}