/**
 * the default function to get data
 * @param {string} controller 
 */
const Api = (controller) => 
     axios.create({
        baseURL: `${window.location.origin}/.netlify/functions/${controller}?action=`,
        // baseURL: `localhost:9000/`,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Bearer ${new User().token}`
        },
        method: 'post',
    });