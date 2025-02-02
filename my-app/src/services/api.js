const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "https://digi-uckg.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
