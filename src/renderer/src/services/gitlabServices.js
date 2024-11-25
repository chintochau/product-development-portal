const projectId = 61440508 //jasonfortesting
const SOVI_GROUP_ID = 17062603


export const getProductsLog = async () => {
    const data = await window.api.gitlab(`projects/${projectId}/issues?labels=product&state=opened`,"GET");
    return data
}

export const createNewProductTicket = async (data) => {
    const {name, description} = data || {}
    const response = await window.api.gitlab(`projects/${projectId}/issues`, "POST", {
        title: "Testing Product name", 
        description:`## Description
Our current onboarding flow has several areas that need improvement. 
Users have reported confusion during the account creation and setup process.

### Goals
- Improve clarity in the step-by-step process.
- Ensure error messages are more descriptive.
- Add visual indicators to highlight progress.

### Suggested Improvements
1. Update the UI for the onboarding wizard to align with the latest design guidelines.
2. Implement tooltips for critical form fields.
3. Review and enhance the user journey by adding a checklist.

### Impact
Better onboarding will lead to higher activation rates and user satisfaction.

_This issue is a high priority for the upcoming sprint._`,
        confidential:true,
        labels:["product"]
    });
    return response
}