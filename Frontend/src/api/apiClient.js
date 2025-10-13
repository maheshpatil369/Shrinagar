// A centralized API client for making requests to the backend.

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * A helper function to handle fetch requests and responses.
 * @param {string} endpoint - The API endpoint to call (e.g., '/auth/login').
 * @param {object} options - The options for the fetch request (e.g., method, headers, body).
 * @returns {Promise<any>} - The JSON response from the server.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
const apiClient = async (endpoint, options = {}) => {
  const { body, ...customConfig } = options;

  const headers = {
    'Content-Type': 'application/json',
  };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: 'include', // IMPORTANT: This sends cookies with every request
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // Try to parse the error message from the backend, otherwise use the status text
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unexpected error occurred.');
    }

    // If the response is successful but has no content (e.g., for a 204 No Content response)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('API Client Error:', error);
    // Re-throw the error so it can be caught by the calling component
    throw error;
  }
};

export default apiClient;
