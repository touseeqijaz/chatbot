"use server";

export async function requestPost(payload, url) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}

export async function requestPostPlan(payload, url, token) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}


export async function requestGet(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}


export async function requestPut(payload, url) {
  try {
    const response = await fetch(url, {
      method: "PUT", // Changed from POST to PUT
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}

export async function requestUpdate(payload, url, token) {
  try {
    const response = await fetch(url, {
      method: "PUT", // Changed from POST to PUT
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}

export async function requestDelete(url, token) {
  try {
    const response = await fetch(url, {
      method: "DELETE", // Changed from POST to PUT
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}


export async function passwordChange(payload, url, token) {
  try {
    const response = await fetch(url, {
      method: "PUT", // Changed from POST to PUT
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Something went wrong");
  }
}
