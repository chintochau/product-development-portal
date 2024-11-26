const projectId = 61440508 //jasonfortesting
const SOVI_GROUP_ID = 17062603
import yaml from "js-yaml"

export const getProductsLog = async () => {
    const data = await window.api.gitlab(`projects/${projectId}/issues?labels=product&state=opened`, "GET");
    return data
}

export const createNewProductTicket = async (data) => {
    const { productcode, productname, description, releasedate } = data || {}
    const response = await window.api.gitlab(`projects/${projectId}/issues`, "POST", {
        title: productcode + " Product Initiation",
        description: jsonToMarkdown(data),
        confidential: true,
        labels: ["product"]
    });
    return response
}

export const deleteTicket = async (iid) => {
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "DELETE");
    return response
}

export const saveTicket = async (iid, data) => {
    const { } = data || {}
    const response = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "PUT", {
        title: data.productcode + " Product Initiation",
        description: jsonToMarkdown(data),
        confidential: true,
        labels: ["product"]
    }
    )

    return response
}

export const getProductLogWithIID = async (iid) => {
    const data = await window.api.gitlab(`projects/${projectId}/issues/${iid}`, "GET");
    return data
}

const jsonToMarkdown = (data) => {
    console.log("data", data);
    const yamlContent = yaml.dump(data);
    const markdown = `---\n${yamlContent}---\n\n# Additional Information\n\n${data?.description}`;
    return markdown;
};